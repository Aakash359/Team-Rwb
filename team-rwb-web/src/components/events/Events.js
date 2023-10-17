import React, {Component} from 'react';
import {Switch, Link, Route, withRouter} from 'react-router-dom';
import EventDetail from './EventDetail';
import EventListItem from './EventListItem';
import styles from './Events.module.css';
import eventAttendees from './event_attendees.json';
import EventDetailAttendees from './EventDetailAttendees';
import CreateEventButton from './CreateEventButton';
import SearchBar from '../SearchBar';
import FiltersBar from './FiltersBar';
import {rwbApi} from '../../../../shared/apis/api';
import {userProfile} from '../../../../shared/models/UserProfile';
import {userLocation} from '../../../../shared/models/UserLocation';
import {
  logAccessEventDetails,
  logSearch,
  logAccessMyEvents,
  logToggleLozenge,
} from '../../../../shared/models/Analytics';
import {filters} from '../../models/Filters';

import Loading from '../Loading';

import MyEvents from './MyEvents';
import {MdWarning as WarningIcon} from 'react-icons/md';

import SearchGooglePlaces from '../SearchGooglePlaces';
import {debounce, urlToParamsObj} from '../../../../shared/utils/Helpers';
import PlacesList from './PlacesList';
import {hasReachedBottom} from '../../BrowserUtil';
import {
  geocodeByAddress,
  getLatLng,
} from '../../react-places-autocomplete/dist/utils';
import ReusableTabs from '../ReusableTabs';
import {eventURLFormatter} from '../../../../shared/utils/eventURLFormatter';
import {
  EVENT_TAB_TYPES,
  EVENT_NAV_ELEMENTS,
  MY_EVENT_TYPES,
  GROUP_EVENT_NAV_ELEMENTS,
  GROUP_EVENT_TAB_TYPES,
  CHALLENGE_EVENT_TAB_TYPES,
} from '../../../../shared/constants/EventTabs';
import {IconButton} from '@material-ui/core';
import ChevronBackIcon from '../svgs/ChevronBackIcon';
import {
  isCreateEventButtonVisible,
  localeFormatter,
} from '../../../../shared/utils/EventHelpers';
import Header from '../Header';
import PostView from '../feed/PostView';
import {
  EVENT_OPTIONS,
  PAST_GROUP_EVENT_OPTIONS,
  VIRTUAL_EVENT_OPTIONS,
  VIRTUAL_GROUP_OPTIONS,
} from '../../../../shared/constants/EventFilters';
import {
  DEFAULT_LOCAL_OPTIONS,
  DEFAULT_VIRTUAL_OPTIONS,
} from '../../../../shared/constants/DefaultFilters';
import RecordWorkout from '../recordWorkout/RecordWorkout';

const SEARCHBAR_NAME_PLACEHOLDER = [
  'Search for events',
  'Search for Virtual events...',
  'Search for your events...',
];
const VIRTUAL_INITIAL_GROUP_TYPES = ['activity', 'sponsor'];

class Events extends Component {
  constructor(props) {
    super(props);
    filters.getFilters();
    this.alertLimitUsersDisplayedShowed = false;
    this.yOffset = 0;
    this.user = userProfile.getUserProfile();

    const groupType = props.location.state?.groupType;
    const isVirtualInitial = VIRTUAL_INITIAL_GROUP_TYPES.includes(groupType); // for activity and sponsor group, the default tab is virtual, otherwise, the default tab is local
    // chapter group names follow the convent "Team RWB CITY ST", retrieve the city to display in the search bar
    // geographical information for chapter groups contains state, lat, long, but no city
    let cityNameFromGroup;
    if (
      props.location.state?.groupName &&
      props.location.state?.groupType === 'chapter'
    )
      cityNameFromGroup = props.location.state?.groupName
        .replace('Team RWB', '')
        .slice(0, -2)
        .trim();
    this.state = {
      locale: '',
      lat: this.props.location.state?.groupLat || null,
      long: this.props.location.state?.groupLong || null,
      events: [],
      preferredChapterEvent: false,
      eventDistance: filters.eventDistance,
      eventCategory: filters.eventCategory, // "all-activities", "yoga", "social", etc
      total_number_pages: null,
      eventDate: filters.eventDate,
      sortBy: filters.sortBy,
      virtualSubtype: filters.virtualSubtype, // "all", "challenges", "workouts"
      virtualEventCategory: filters.virtualEventCategory,
      virtualEventDate: filters.virtualEventDate,
      virtualSortBy: filters.virtualSortBy,
      eventFilterNavTab: filters.eventFilterNavTab,
      eventGroupOption: filters.eventGroupOption,
      virtualEventGroupOption: filters.virtualEventGroupOption,
      virtualTime: filters.virtualTime,
      search: '',
      page: 0,
      event_ids: [],
      cityNameFromGroup,
      city:
        props.location.state?.groupType === 'chapter'
          ? cityNameFromGroup
          : userProfile.location.city, // initially setting the city here avoid a flash render
      isLoading: true,
      refreshing: false,
      loadingMore: false,
      stopFetching: false,
      server_error_text: null,
      noResultsFound: false,
      showLocationSearch: false,
      createVisible: false,
      locationSearchInput: '',
      locationError: null,
      chapterEventCreation: false,
      eventCreationTypeVisible: false,
      myEventsVisible: false,
      collapsedHeader: false,
      locationSuggestions: [],
      retrievedLastEvent: false,
      activeTab: props.match.params?.challengeId
        ? CHALLENGE_EVENT_TAB_TYPES.upcoming
        : isVirtualInitial
        ? EVENT_TAB_TYPES.virtual
        : EVENT_TAB_TYPES.local,
      isAdmin: undefined, // remains undefined for event list tab, otherwise will be true or false
      selectedEventType: isVirtualInitial ? 1 : 0, // [0: 'local', 1: 'virtual', 2: 'my']
      activeMyEventsType: MY_EVENT_TYPES.hosting, // hosting || upcoming || past - default to hosting
      // groups
      groupId: props.match.params?.groupId || null,
      groupName: props.location.state?.groupName || '',
      groupType: groupType || '',
      eventTypes: props.match.params?.groupId
        ? GROUP_EVENT_NAV_ELEMENTS
        : EVENT_NAV_ELEMENTS,
      activeGroupEventType: 'all-activities', // applies to virtual/local
      activePastEventType: null,
      // challenges
      challengeId: props.match.params?.challengeId || null,
      challengeName: props.location.state?.challengeName || null,
    };
  }

  componentDidMount() {
    if (!(filters.virtualEventGroupOption in VIRTUAL_GROUP_OPTIONS)) {
      filters.setFilter({
        virtualEventGroupOption:
          DEFAULT_VIRTUAL_OPTIONS.virtualEventGroupOption,
      });
    }
    // this is for sending users a link to set them on the virtual list
    const params = urlToParamsObj(this.props.location.search);
    if (params.is_virtual === 'true') {
      this.setState(
        {
          virtualSubtype:
            params.virtual_event_category || filters.virtualSubtype,
          virtualEventCategory: params.category || filters.virtualEventCategory,
          virtualSortBy: params.sort || filters.virtualSortBy,
        },
        () => {
          this.handleEventTypeChange(1);
        },
      );
    } else {
      // setting filters causes changes from the link to be overwritten
      this.setFilters();
    }
    window.addEventListener('scroll', this.trackScrolling);
  }

  trackScrolling = (event) => {
    event.preventDefault();
    if (this.state.isLoading) return; // prevent the user from loading the next page of events before the initial events are loaded
    const wrappedElement = document.getElementById('root');
    if (hasReachedBottom(wrappedElement) && !this.state.retrievedLastEvent) {
      this.setState(
        (prevState) => ({
          page: prevState.page + 1,
          retrievedLastEvent: true,
          isLoading: true,
        }),
        () => {
          this.fetchEvents(this.state);
        },
      );
      window.removeEventListener('scroll', this.trackScrolling);
    }
  };

  hanldeLocationError = (err) => {
    // ReactPlacesAutocomplete has a very finicky loading state
    // in order to determine if it is done loading when there are zero results we check for the error instead
    if (err === 'ZERO_RESULTS')
      this.setState({locationError: 'No Results Found'});
  };

  setFilters() {
    filters.getFilters().then((previousFilters) => {
      this.setState(previousFilters, () => this.setLocale(true));
    });
  }

  alertLimitUsersDisplayed() {
    if (!this.alertLimitUsersDisplayedShowed) {
      this.alertLimitUsersDisplayedShowed = true;
      alert('Team RWB', `Could not display some interested and going users`);
    }
  }

  setLocale(forceFetch) {
    // Location handling
    // city, state and zip can be either '' or null, both of which lead to interesting behavior
    const lastLocale = this.state.locale;
    const lastCity = this.state.city;
    const localeObj = localeFormatter(lastLocale, lastCity);
    const locale = localeObj.locale;
    const displayCity = localeObj.displayCity;
    if (forceFetch) {
      this.clearEvents({
        locale,
        city: this.state.cityNameFromGroup || displayCity,
      });
    }
  }

  clearEvents = (search_props) => {
    this.setState(
      Object.assign(
        {
          events: [],
          noResultsFound: false,
          isLoading: true,
          loadingMore: true,
          stopFetching: false,
          page: 0,
        },
        search_props,
      ),
      () => {
        this.fetchEvents(this.state);
      },
    );
    return;
  };

  // initial load of EventsListView determines if the user is an admin
  // this is group specific and only called if a group id
  setIsAdmin = (isAdmin) => this.setState({isAdmin});

  // if on a group event list and isAdmin has not been retrieved, make the network call
  checkIfAdmin = () => {
    const {groupId, isAdmin, activeTab} = this.state;
    if (
      groupId &&
      isAdmin === undefined &&
      (activeTab === GROUP_EVENT_TAB_TYPES.local ||
        activeTab === GROUP_EVENT_TAB_TYPES.virtual)
    ) {
      return rwbApi
        .isGroupAdmin(groupId)
        .then((isAdmin) => {
          this.setIsAdmin(isAdmin.is_admin);
        })
        .catch((err) => this.setIsAdmin(false));
    } else return new Promise((resolve) => resolve());
  };

  fetchEvents(state) {
    /* 
      virtual and local events have their own saved filters with their own names
      eventURLformatter expects the name of the local values
      Because of this, we want to modify the values the eventURL formatter receives when on the virtual tab
    */
    if (state.activeTab === EVENT_TAB_TYPES.virtual && !state.groupId) {
      state.eventDate = state.virtualEventDate;
      state.sortBy = state.virtualSortBy;
      state.eventCategory = state.virtualEventCategory;
      state.eventGroupOption = state.virtualEventGroupOption;
      state.virtualTime = state.virtualTime;
    } else if (state.activeTab === EVENT_TAB_TYPES.virtual && state.groupId) {
      // ensure virtualSubtype is all when on a group's page
      state.virtualSubtype = VIRTUAL_EVENT_OPTIONS.all.slug;
    }
    if (state.groupId) {
      state.eventCategory = this.state.activeGroupEventType;
      state.eventDate = DEFAULT_LOCAL_OPTIONS.eventDate;
      state.sortBy = DEFAULT_LOCAL_OPTIONS.sortBy;
      state.eventGroupOption = null;
    }
    if (state.challengeId) {
      // ensure the is_virtual param is not set, all upcoming events are shown, and all activity types can be found
      state.eventDate = DEFAULT_VIRTUAL_OPTIONS.virtualEventDate;
      state.eventCategory = DEFAULT_VIRTUAL_OPTIONS.virtualEventCategory;
    }
    this.checkIfAdmin().then(() => {
      eventURLFormatter(state, this.user)
        .then((result) => {
          const {urlParams, state} = result;
          // return results from virtual overwrite the value
          // look into not returning state from eventURLFormatter
          state.eventDate = filters.eventDate;
          state.sortBy = filters.sortBy;

          this.getEventsCall(urlParams, state);
        })
        .catch((err) => {
          alert(`Team TWB: ${err}`);
          this.setState({isLoading: false, loadingMore: false});
        });
    });
  }

  getEventsCall = (urlParams, state) => {
    let {page, events, retrievedLastEvent} = state;
    rwbApi
      .getMobileEvents(urlParams)
      .then((json) => {
        const {data, total_number_pages, total_number_posts} = json;
        let event_ids = [];
        if (data) {
          data.map((event) => {
            event_ids.push(event.id);
          });
        }

        rwbApi
          .getAllFollowedAttendees(event_ids)
          .then((followingAttendeesResult) => {
            let followingAttendeesObjs = [];
            for (let i = 0; i < followingAttendeesResult.length; i++) {
              const singleEvent = followingAttendeesResult[i];
              const eventAttendeesObj = {
                event_id: singleEvent.event_id,
                attendees: singleEvent.attendees,
              };
              followingAttendeesObjs.push(eventAttendeesObj);
            }
            this.setState(
              Object.assign(
                {
                  isLoading: false,
                  loadingMore: false,
                  refreshing: false,
                  total_number_pages,
                },
                data
                  ? {
                      events: [
                        ...events,
                        ...this.addFollowAttendeesToEvents(
                          data,
                          followingAttendeesResult,
                        ),
                      ],
                    }
                  : {},
                {event_ids},
                total_number_posts === 0 ? {noResultsFound: true} : {},
                page >= total_number_pages ? {stopFetching: true} : {},
              ),
            );

            if (retrievedLastEvent && page < total_number_pages) {
              this.setState({retrievedLastEvent: false}, () =>
                window.addEventListener('scroll', this.trackScrolling),
              );
            }
          });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
          loadingMore: false,
          server_error_text: 'there was a problem with the server.',
        });
        alert('Server Error', 'Please try again later.');
      });
  };

  // needs a way to clean up or boost performance. This should ever only check a list of 10 events and all can have a follow, but improvement is desired
  addFollowAttendeesToEvents = (events, followingAttendeesObjs) => {
    for (let i = 0; i < events.length; i++) {
      for (let j = 0; j < followingAttendeesObjs.length; j++) {
        if (events[i].id.toString() === followingAttendeesObjs[j].event_id) {
          events[i].followingAttendees = followingAttendeesObjs[j].attendees;
          break;
        }
      }
    }
    return events;
  };

  // See google reverse geocode API documents for what `component` can be.
  extractAddressComponent(component, address_data) {
    for (let datum of address_data) {
      if (datum.types.includes(component)) {
        return datum;
      }
    }
    throw new Error(`Cannot find component ${component} in data.`);
  }

  extractLocale(addressComponents) {
    const city = this.extractAddressComponent('locality', addressComponents)
      .long_name;
    const state = this.extractAddressComponent(
      'administrative_area_level_1',
      addressComponents,
    ).short_name;
    const zip = this.extractAddressComponent('postal_code', addressComponents)
      .long_name;

    const localeString = `${zip.slice(0, 5)} ${city}, ${state}`;
    return localeString;
  }

  addressFromLatLng = async (lat, lng) => {
    var geocoder = new window.google.maps.Geocoder();
    var OK = window.google.maps.GeocoderStatus.OK;

    var latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
    return new Promise(function (resolve, reject) {
      geocoder.geocode({location: latlng}, function (results, status) {
        if (status !== OK) {
          reject(status);
        }
        resolve(results);
      });
    });
  };

  selectCurrentLocationHandler = () => {
    try {
      navigator.geolocation.getCurrentPosition((position) => {
        const {latitude, longitude} = position.coords;
        if (latitude && longitude) {
          this.addressFromLatLng(latitude, longitude).then((results) => {
            let match;
            for (let result of results) {
              if (result.types.includes('street_address')) {
                match = result;
              }
            }
            const {address_components} = match;
            const street = this.extractAddressComponent(
              'route',
              address_components,
            ).long_name;
            const city = this.extractAddressComponent(
              'locality',
              address_components,
            ).long_name;
            const state = this.extractAddressComponent(
              'administrative_area_level_1',
              address_components,
            ).short_name;
            const zip = this.extractAddressComponent(
              'postal_code',
              address_components,
            ).long_name;
            const localeString = this.extractLocale(address_components);
            if (localeString && street && city && state && zip) {
              userLocation.saveToUserLocation({
                lat: latitude,
                long: longitude,
                locale: localeString,
                street,
                city,
                state,
                zip,
              });

              this.handleGoogleResponse({city, lat: latitude, long: longitude});
            } else {
              throw Error('Location can not be found');
            }
          });
        } else {
          throw Error('Location can not be found');
        }
      });
    } catch (error) {
      alert(error.message);
    }
  };

  handleGoogleResponse = (response) => {
    if (response) {
      this.setState({locationSearchInput: ''});
      this.clearEvents({
        lat: response.lat.toString(),
        long: response.long.toString(),
        city: response.city,
      });
    }
  };

  submitSearchEvents = (search_props) => {
    logSearch();
    this.clearEvents(search_props);
  };

  selectLocationHandler = (address, city) => {
    geocodeByAddress(address)
      .then((results) => getLatLng(results[0]))
      .then((latLng) =>
        this.handleGoogleResponse({
          city,
          lat: latLng.lat,
          long: latLng.lng,
        }),
      )
      .catch(() => alert('Error with selecting the location.'));
  };

  getSuggestionsHandler = (suggestions) => {
    this.setState({locationSuggestions: suggestions});
  };

  loadAttendees(id) {
    return rwbApi.getAllMobileAttendees(id).catch((error) => {
      throw error;
    });
  }

  getSuggestionsDebounce = debounce(this.getSuggestionsHandler, 500);

  handleEventTypeChange = (index) => {
    const {groupId, eventTypes} = this.state;
    this.setState(
      {
        selectedEventType: index,
        activeTab: eventTypes[index].key,
        eventCategory: 'all-activities',
        activeGroupEventType: 'all-activities',
      },
      () => this.submitSearchEvents({search: ''}),
    );

    // log access to my events
    if (!groupId && EVENT_NAV_ELEMENTS[index].key === EVENT_TAB_TYPES.my)
      logAccessMyEvents();
  };

  onFilterMyEvents = (activeMyEventsType) => {
    this.setState({activeMyEventsType}, this.submitSearchEvents);
  };

  componentWillUnmount() {
    window.removeEventListener('scroll', this.trackScrolling);
  }

  toggleGroupEventLozenge = (value) => {
    if (value !== this.state.activeGroupEventType) {
      const analytics_params = {
        active_tab: this.state.activeTab,
        click_text: EVENT_OPTIONS[value].display,
      };
      logToggleLozenge(analytics_params);
      this.setState({activeGroupEventType: value});
      this.clearEvents({eventCategory: value});
    } else {
      this.setState({activeGroupEventType: 'all-activities'});
      this.clearEvents({eventCategory: 'all-activities'});
    }
  };

  changeActivePastEventType = (type) => {
    const {activePastEventType} = this.state;
    if (activePastEventType === type) {
      this.setState({activePastEventType: null});
    } else {
      const analytics_params = {
        active_tab: this.state.activeTab,
        click_text: PAST_GROUP_EVENT_OPTIONS[type].display,
      };
      logToggleLozenge(analytics_params);
      this.setState({activePastEventType: type});
    }
    this.clearEvents();
  };

  render() {
    const {match, history} = this.props;
    const {
      isLoading,
      events,
      search,
      city,
      locationSearchInput,
      locationSuggestions,
      activeTab,
      selectedEventType,
      activeMyEventsType,
      lat,
      long,
      groupId,
      groupName,
      eventTypes,
      activeGroupEventType,
      activePastEventType,
      createVisible,
      groupType,
      isAdmin,
      challengeId,
      challengeName,
    } = this.state;
    return (
      <div
        className={`${styles.container} ${
          (groupId || challengeId) && styles.nonPaddingContainer
        }`}
        id={'root'}>
        {isLoading && (
          <Loading size={100} color={'var(--white)'} loading={true} right />
        )}
        <>
          <Switch>
            <Route path={`${match.path}/myEvents`}>
              <MyEvents />
            </Route>
            <Route path={`${match.path}/:eventId`} exact>
              <EventDetail refreshEvents={this.clearEvents} />
            </Route>
            <Route path={`${match.path}/:eventId/attendees`}>
              <EventDetailAttendees />
            </Route>
            <Route path={`${match.path}/:eventId/feed/:postId`}>
              <PostView />
            </Route>
            <Route path={`${match.path}/:eventId/record-workout`}>
              <RecordWorkout />
            </Route>
            <Route
              path={`${match.path}/challenges/challengeId/events/:eventId/record-workout`}>
              <RecordWorkout />
            </Route>
            <Route path={match.path}>
              {(groupId || challengeId) && (
                <Header
                  title={'Events'}
                  subtitle={groupName || challengeName}
                  onBack={() => history.goBack()}
                  noBottomPadding={true}
                />
              )}
              {!challengeId && (
                <div className={styles.searchContainer}>
                  <SearchBar
                    noRightRadius={selectedEventType === 0 ? true : false}
                    value={search}
                    onChange={(value) => this.setState({search: value})}
                    onSubmit={this.submitSearchEvents}
                    onClearSearch={() => {
                      this.setState({search: ''}, this.submitSearchEvents);
                    }}
                    placeholder={SEARCHBAR_NAME_PLACEHOLDER[selectedEventType]}
                  />
                  {selectedEventType === 0 && (
                    <SearchGooglePlaces
                      noLeftRadius={true}
                      value={locationSearchInput}
                      onChange={(value) => {
                        this.setState({locationSearchInput: value});
                        value.length < 3 && this.getSuggestionsHandler([]);
                      }}
                      onClearSearch={() => {
                        // locationSearchInput is cleared after making a selection, make a search and get the initial results
                        if (!locationSearchInput) {
                          this.clearEvents({
                            city:
                              this.state.cityNameFromGroup ||
                              this.user.location.city,
                            lat: this.props.location.state?.groupLat || '',
                            long: this.props.location.state?.groupLong || '',
                          });
                        }
                        this.setState({locationSearchInput: ''});
                        this.getSuggestionsHandler([]);
                      }}
                      handleError={this.hanldeLocationError}
                      getSuggestions={this.getSuggestionsDebounce}
                      placeholder={city || ''}
                      lat={lat}
                      type="(regions)"
                    />
                  )}
                </div>
              )}
              {challengeId && (
                <div className={styles.eventsTabsContainer}>
                  <div
                    onClick={() =>
                      this.clearEvents({
                        activeTab: CHALLENGE_EVENT_TAB_TYPES.upcoming,
                      })
                    }
                    className={`${styles.eventsTab} ${
                      activeTab === CHALLENGE_EVENT_TAB_TYPES.upcoming &&
                      styles.eventsTabActive
                    }`}>
                    <span
                      className={`${styles.eventsTabTitle} ${
                        activeTab === CHALLENGE_EVENT_TAB_TYPES.upcoming &&
                        styles.eventsTabTitleActive
                      }`}>
                      {CHALLENGE_EVENT_TAB_TYPES.upcoming.toUpperCase()}
                    </span>
                  </div>
                  <div
                    onClick={() =>
                      this.clearEvents({
                        activeTab: CHALLENGE_EVENT_TAB_TYPES.past,
                      })
                    }
                    className={`${styles.eventsTab} ${
                      activeTab === CHALLENGE_EVENT_TAB_TYPES.past &&
                      styles.eventsTabActive
                    }`}>
                    <span
                      className={`${styles.eventsTabTitle} ${
                        activeTab === CHALLENGE_EVENT_TAB_TYPES.past &&
                        styles.eventsTabTitleActive
                      }`}>
                      {CHALLENGE_EVENT_TAB_TYPES.past.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

              {locationSearchInput.length > 0 ? (
                <PlacesList
                  locationError={this.state.locationError}
                  locationSuggestions={locationSuggestions}
                  onSelect={this.selectLocationHandler}
                  onCurrentLocationSelect={this.selectCurrentLocationHandler}
                />
              ) : (
                <>
                  {!challengeId && (
                    <>
                      <ReusableTabs
                        selectedValue={selectedEventType}
                        values={eventTypes.map(({name}) => name)}
                        onChangeHandler={this.handleEventTypeChange}
                      />

                      <FiltersBar
                        onSubmit={() => this.setFilters()}
                        activeTab={activeTab}
                        activeMyEventsType={activeMyEventsType}
                        onFilterMyEvents={this.onFilterMyEvents}
                        // only using props for virtual due to link
                        virtualSubtype={this.state.virtualSubtype}
                        virtualSortBy={this.state.virtualSortBy}
                        virtualEventDate={this.state.virtualEventDate}
                        virtualEventCategory={this.state.virtualEventCategory}
                        groupId={groupId}
                        activeGroupEventActivity={activeGroupEventType}
                        changeGroupEventActivity={this.toggleGroupEventLozenge}
                        activePastEventType={activePastEventType}
                        onChangeActivePastEventType={
                          this.changeActivePastEventType
                        }
                      />
                    </>
                  )}

                  {events.length > 0 && (
                    <div className={styles.eventListContainer}>
                      {events.map((event, i) => (
                        <Link
                          onClick={logAccessEventDetails}
                          to={{
                            pathname: `/events/${event.id}`,
                            state: {
                              from: history.location.pathname,
                            },
                          }}
                          key={`e-${i}`}>
                          <EventListItem
                            event={event}
                            eventAttendees={eventAttendees}
                            loadAttendees={this.loadAttendees}
                            type="AllActivities"
                          />
                        </Link>
                      ))}
                    </div>
                  )}
                  {/* TODO: Figure out if should be displayed even when events.length is zero */}
                  {isCreateEventButtonVisible(
                    groupName,
                    activeTab,
                    isLoading,
                    createVisible,
                    this.user,
                    groupType,
                    isAdmin,
                    this.props.location.state?.joinedGroup,
                    challengeId,
                  ) && (
                    <CreateEventButton
                      groupId={groupId}
                      groupName={groupName}
                      selectedTab={
                        activeTab === GROUP_EVENT_TAB_TYPES.local ||
                        EVENT_TAB_TYPES.my
                          ? 0
                          : 1
                      }
                      isAdmin={isAdmin}
                      groupType={groupType}
                      isVirtual={activeTab === GROUP_EVENT_TAB_TYPES.virtual}
                      refreshEvents={this.clearEvents}
                    />
                  )}

                  {!events.length && !isLoading && (
                    <div className={styles.emptyContainer}>
                      <WarningIcon color={'var(--magenta)'} size={60} />
                      <p>The selected filters produced no events.</p>
                      <p>Please adjust filter settings.</p>
                    </div>
                  )}
                </>
              )}
            </Route>
          </Switch>
        </>
      </div>
    );
  }
}

export default withRouter(Events);
