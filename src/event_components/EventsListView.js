import React from 'react';
import {
  SafeAreaView,
  Text,
  View,
  ActivityIndicator,
  Alert,
  Platform,
  TouchableOpacity,
  Modal,
} from 'react-native';
import EventList from './EventList';
import {NavigationEvents} from 'react-navigation';
import {getIndexFromID} from '../../shared/utils/Helpers';
import {
  isCreateEventButtonVisible,
  localeFormatter,
} from '../../shared/utils/EventHelpers';
import {rwbApi} from '../../shared/apis/api';
import {userProfile} from '../../shared/models/UserProfile';
import {userLocation} from '../../shared/models/UserLocation';
import {filters} from '../models/Filters';
import {
  EVENT_TAB_TYPES,
  GROUP_EVENT_TAB_TYPES,
} from '../../shared/constants/EventTabs';
import {
  logDistanceFilter,
  logActivityFilter,
  logAccessEventDetails,
  logDateFilter,
  logSortFilter,
  logStartEventCreation,
  logToggleLozenge,
} from '../../shared/models/Analytics';
import NavigationService from '../models/NavigationService';
import CreateEventView from './CreateEventView';
import EventFilterView from './EventFilterView';

import globalStyles, {RWBColors} from '../styles';
import {eventURLFormatter} from '../../shared/utils/eventURLFormatter';
import LozengeDispatcher from './LozengeDispatcher';
import {EVENT_OPTIONS, MY_EVENT_OPTIONS, PAST_GROUP_EVENT_OPTIONS, VIRTUAL_EVENT_OPTIONS, VIRTUAL_GROUP_OPTIONS} from '../../shared/constants/EventFilters';
import {
  DEFAULT_LOCAL_OPTIONS,
  DEFAULT_VIRTUAL_OPTIONS,
} from '../../shared/constants/DefaultFilters';

// SVGs
import SearchIcon from '../../svgs/SearchIcon';
import NoEventIcon from '../../svgs/NoEventIcon';
import AddIcon from '../../svgs/AddIcon';

const LOZENGE_VIEW_HEIGHT = 50;

export default class EventsListView extends React.Component {
  constructor(props) {
    super(props);
    this.alertLimitUsersDisplayedShowed = false;
    this.yOffset = 0;
    this.user = userProfile.getUserProfile();
    this.maxContainerOffset = 0; //full screen size with both search boxes. This will be used for smoother scrolling experience on android
    this.state = {
      server_error_text: null,

      // local events only
      locale: '',
      lat: null,
      long: null,
      city: userProfile.location.city, // initially setting the city here avoid a flash render
      createVisible: false,
      locationSearchInput: '',
      eventCreationTypeVisible: false,
      distanceSliderValue: 100,

      // my events only
      activeMyEventsType: this.props.activeMyEventsType, //check if this is needed, might be able to just use prop version

      // local and virtual events
      filterVisible: false,

      // groups
      activeGroupEventType: 'all-activities', // applies to virtual/local
      activePastEventType: '',

      // local, virtual, and my events
      total_number_pages: null,
      isLoading: true,
      refreshing: false,
      loadingMore: false,
      stopFetching: false,
      noResultsFound: false,
      events: [],
      event_ids: [],
      search: '',
      page: 0,
      groupId: this.props.groupId,
    };
  }

  componentDidMount() {
    this.setFilters();
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      const eventId = this.props.navigation.getParam('eventId');
      // if not set to null, clicking back will always renavigate to the event
      this.props.navigation.setParams({eventId: null});
      if (eventId) {
        NavigationService.navigate('EventView', {
          id: eventId,
          returnRoute: 'events',
          refreshEvents: this.refreshEvents,
        });
      }
      const prevAnonStatus = this.user.anonymous_profile;
      this.user = userProfile.getUserProfile();
      // in order to properly display/hide the add icon for an event post, we check if the user updated their profile and force update
      if (this.user.anonymous_profile !== prevAnonStatus) this.forceUpdate();
    });
  }

  closeModal = () => {
    this.setState({filterVisible: false}, () => {
      this.clearEvents();
    });
  };

  setFilters = () => {
    filters.getFilters().then((previousFilters) => {
      this.setState(previousFilters, () => this.setLocale(true));
    });
  };

  alertLimitUsersDisplayed = () => {
    if (!this.alertLimitUsersDisplayedShowed) {
      this.alertLimitUsersDisplayedShowed = true;
      Alert.alert(
        'Team RWB',
        `Could not display some interested and going users`,
      );
    }
  };

  openFilters = () => {
    this.setState({filterVisible: true});
  };

  setLocale = (forceFetch) => {
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
        city: displayCity,
      });
    }
  };

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
      () => this.fetchEvents(this.state),
    );
    return;
  };

  // if on a group event list and isAdmin has not been retrieved, make the network call
  checkIfAdmin = () => {
    const {groupId} = this.state;
    const {isAdmin, activeTab} = this.props;
    if (
      groupId &&
      isAdmin === undefined &&
      (activeTab === GROUP_EVENT_TAB_TYPES.local ||
        activeTab === GROUP_EVENT_TAB_TYPES.virtual)
    ) {
      return rwbApi
        .isGroupAdmin(groupId)
        .then((isAdmin) => {
          this.props.setIsAdmin(isAdmin.is_admin);
        })
        .catch((err) => {
          this.props.setIsAdmin(false);
        });
    } else return new Promise.resolve();
  };

  useEventFormatter = (state, user) => {
    this.checkIfAdmin().then(() => {
      eventURLFormatter(state, user)
        .then((result) => {
          const {urlParams, state} = result;
          this.getEventsCall(urlParams, state);
        })
        .catch((err) => {
          Alert.alert('Team RWB', err);
          this.setState({isLoading: false, loadingMore: false});
        });
    });
  };

  fetchEvents = (state) => {
    // fetching events requires all the pararms which are handled in EventListManager when not on the group event list
    // since those values are stored in props, add them to the state object to pass through
    state.activeTab = this.props.activeTab;
    if (this.props.challengeId) {
      state.challengeId = this.props.challengeId;
      // ensure the is_virtual param is not set, all upcoming events are shown, and all activity types can be found
      state.eventDate = DEFAULT_VIRTUAL_OPTIONS.virtualEventDate;
      state.eventCategory = DEFAULT_VIRTUAL_OPTIONS.virtualEventCategory;
    } else if (!this.props.groupName) {
      state.eventDistance = this.props.eventDistance;
      state.eventCategory = this.props.eventCategory;
      state.eventDate = this.props.eventDate;
      state.sortBy = this.props.sortBy;
      state.virtualSubtype = this.props.virtualSubtype;
      state.eventGroupOption = this.props.eventGroupOption;
      state.eventFilterNavTab = this.props.eventFilterNavTab;
      state.virtualTime = this.props.virtualTime;
    } else {
      state.eventCategory = this.state.activeGroupEventType;
      // ensure virtualSubtype is all when on a group's page
      state.virtualSubtype = VIRTUAL_EVENT_OPTIONS.all.slug;
      // use defaults to avoid filter changes from the events tab (shared between local and virtual)
      state.eventDate = DEFAULT_LOCAL_OPTIONS.eventDate;
      state.sortBy = DEFAULT_LOCAL_OPTIONS.sortBy;
      state.eventGroupOption = null;
      // use the lat/long of the city a user looked up, otherwise use the lat/long of the selected group
      state.lat = this.state.lat || this.props.groupLat;
      state.long = this.state.long || this.props.groupLong;
    }
    // user profile not initiated, usually due to deep links
    if (this.user.first_name === null) {
      userProfile.init().then(() => {
        const user = userProfile.getUserProfile();
        this.user = user;
        this.useEventFormatter(state, user);
      });
    } else this.useEventFormatter(state, this.user);
  };

  getEventsCall = (urlParams, state) => {
    let {page, events} = state;
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
          });
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
          loadingMore: false,
          server_error_text: 'there was a problem with the server.',
        });
        Alert.alert('Server Error', 'Please try again later.');
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

  updateEvent = (id) => {
    this.setState({
      isLoading: true,
    });
    const {events} = this.state;
    return rwbApi
      .getEvent(id)
      .then((newEvent) => {
        let index = getIndexFromID(id, events);
        events[index] = newEvent;
        this.setState({
          events,
        });
      })
      .catch((error) => {})
      .finally(() => {
        this.setState({
          isLoading: false,
        });
      });
  };

  // passed to GetLocationWrapper component as a callback for when a search completes.

  GLWrapperCallback = (locale) => {
    const {lat, long} = userLocation.getUserLocation();

    this.clearEvents({
      latitude: lat,
      longitude: long,
      locale,
    });
  };

  onClearSearchPressed = () => {
    this.clearEvents({search: ''});
  };

  onDistancePressed = (distance) => {
    if (this.props.activeTab !== EVENT_TAB_TYPES.local) return;
    logDistanceFilter();
    this.props.handleDistancePressed(distance);
  };

  onCategoryPressed = (category) => {
    logActivityFilter();
    this.props.handleCategoryPressed(category);
  };

  onDatePressed = (date) => {
    logDateFilter();
    this.props.handleDatePressed(date);
  };

  onSortByPressed = (sortBy) => {
    logSortFilter();
    this.props.handleSortByPressed(sortBy);
  };

  onGroupPressed = (eventGroupOption) => {
    this.props.handleGroupPressed(eventGroupOption);
  };

  onNavTabPressed = (nav) => {
    this.props.handleNavTabPressed(nav);
  };

  onVirtualSubtypePressed = (virtualSubtype) => {
    // no logging set for this
    this.props.handleVirtualSubtypePressed(virtualSubtype);
  };

  onVirtualTimePressed = (virtualTime) => {
    this.props.handleVirtualTimePressed(virtualTime);
  };

  onEventPressed = () => {
    return (event, attendeesPromise, updateEvent) => {
      logAccessEventDetails();
      NavigationService.navigateIntoInfiniteStack(
        this.props.groupName
          ? 'GroupProfileAndEventDetailsStack'
          : this.props.challengeId
          ? 'ChallengeProfileAndEventDetailsStack'
          : 'EventsProfileAndEventDetailsStack',
        'event',
        {
          returnRoute: 'Events',
          updateEvent: updateEvent,
          refreshEvents: this.clearEvents,
          value: {
            event,
            attendeesPromise,
          },
        },
      );
    };
  };

  handleGoogleResponse = (response) => {
    if (response) {
      // some countries administrative leveling is different so what we expect as city gets saved as state
      this.setState({locationSearchInput: response.city || response.state});
      this.clearEvents({
        lat: response.lat.toString(),
        long: response.long.toString(),
        city: response.city,
      });
      this.props.updateShowLocationSearch(false);
    }
    // do not change the city if there was no response (user hit back/done without selecting a value)
    else this.props.updateShowLocationSearch(false);
  };

  loadAttendees(id) {
    return rwbApi.getAllMobileAttendees(id).catch((error) => {});
  }

  handleDidNavTo = ({state: {params: {value} = {}}}) => {
    this.setLocale(false);

    // Event filtering
    if (value === undefined || value === null) return;
    const {slug, filterSelected} = value;
    filters.setFilter({
      [filterSelected]: slug,
    });
    const eventfilter = Object.assign(
      {},
      filterSelected === 'eventDistance' ? {eventDistance: slug} : {},
      filterSelected === 'eventCategory' ? {eventCategory: slug} : {},
    );
    this.clearEvents(eventfilter);
    this.props.navigation.setParams({value: null});
  };

  closeCreate = () => {
    this.setState({createVisible: false});
  };

  closeMyEvents = () => {
    this.setState({myEventsVisible: false});
  };

  // NOTE: The other two lozenges toggles are only used by the specified types.
  // This might be used for virtual events later on. Because of this, it does not properly persist (waiting for further lozenge changes)
  toggleLocalLozenge = (value) => {
    // untoggling an eventCategory lozenge to set it back to all-activities
    if (this.state.eventCategory === value) {
      this.props.updateParentFilter('localEventCategory', 'all-activities');
      this.clearEvents({
        latitude: this.state.lat,
        longitude: this.state.long,
        eventCategory: 'all-activities',
      });
    }
    // set the category type
    else {
      const analyticsObj = {
        active_tab: this.props.activeTab,
        click_text: EVENT_OPTIONS[value].display,
      }
      logToggleLozenge(analyticsObj);
      this.props.updateParentFilter('localEventCategory', value);
      this.clearEvents({
        eventCategory: value,
        latitude: this.state.lat,
        longitude: this.state.long,
      });
    }
  };

  toggleVirtualLozenge = (value) => {
    if (this.props.eventGroupOption === value) {
      this.props.updateParentFilter('virtualEventGroupOption', 'national');
      this.clearEvents({virtualEventGroupOption: 'national'});
    } else {
      const analyticsObj = {
        active_tab: this.props.activeTab,
        click_text: VIRTUAL_GROUP_OPTIONS[value].display,
      }
      logToggleLozenge(analyticsObj);
      this.props.updateParentFilter('virtualEventGroupOption', value);
      this.clearEvents({virtualEventGroupOption: value});
    }
  };

  toggleMyLozenge = (value) => {
    if (this.state.activeMyEventsType === value) {
      return; // if the active type is reselected, it is not deselected. "hosting", "upcoming", or "past" should always be selected
    } else {
      const analyticsObj = {
        active_tab: this.props.activeTab,
        click_text: MY_EVENT_OPTIONS[value].display,
      }
      logToggleLozenge(analyticsObj);
      this.props.updateParentFilter('activeMyEventsType', value);
      this.clearEvents({activeMyEventsType: value});
    }
  };

  togglePastLozenge = (value) => {
    if (value === this.state.activePastEventType) {
      this.setState({activePastEventType: ''});
      this.clearEvents({activePastEventType: ''});
    } else {
      const analyticsObj = {
        active_tab: this.props.activeTab,
        click_text: PAST_GROUP_EVENT_OPTIONS[value].display,
      }
      logToggleLozenge(analyticsObj);
      this.setState({activePastEventType: value});
      this.clearEvents({activePastEventType: value});
    }
  };

  toggleGroupEventLozenge = (value) => {
    if (value !== this.state.activeGroupEventType) {
      const analyticsObj = {
        active_tab: this.props.activeTab,
        click_text: EVENT_OPTIONS[value].display,
      };
      logToggleLozenge(analyticsObj);
      this.setState({activeGroupEventType: value});
      this.clearEvents({eventCategory: value});
    } else {
      this.setState({activeGroupEventType: 'all-activities'});
      this.clearEvents({eventCategory: 'all-activities'});
    }
  };

  renderFooter = () => {
    if (this.state.noResultsFound && this.state.events.length === 0) {
      return (
        <View style={{padding: '5%', alignItems: 'center'}}>
          <NoEventIcon style={{width: 36, height: 36, marginBottom: 10}} />
          <Text style={[globalStyles.bodyCopy, {textAlign: 'center'}]}>
            The selected filters produced no events.{'\n'}
            Please adjust filter settings.
          </Text>
        </View>
      );
    }

    //prevents header from being chopped off by bottom of the view during refresh
    if (this.state.refreshing) {
      return (
        <View
          style={{
            height: 200,
            width: '100%',
            flex: 1,
          }}
        />
      );
    }
    if (!this.state.loadingMore) return null;
    return (
      <View
        style={{
          paddingVertical: 20,
        }}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  };

  handleLoadMore = () => {
    if (
      this.state.loadingMore === false &&
      this.state.isLoading === false &&
      this.state.stopFetching === false &&
      this.state.page < this.state.total_number_pages
    ) {
      this.setState(
        {
          page: this.state.page + 1,
          loadingMore: true,
        },
        () => this.fetchEvents(this.state, false),
      );
    }
  };

  handleRefresh = () => {
    this.setState({
      refreshing: true,
    });
    this.clearEvents(null, true);
  };

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 0,
          width: '100%',
          borderBottomWidth: 2,
          borderBottomColor: RWBColors.grey8,
        }}
      />
    );
  };

  handleLocationInput = (value) => {
    if (value === undefined) this.props.updateShowLocationSearch(false);
    this.setState({locationSearchInput: value});
  };

  createEvent = () => {
    if (this.state.eventCreationTypeVisible || this.state.createVisible) return;
    if (!this.user.salesforce_contact_id) {
      Alert.alert(
        'Team RWB',
        'Unable to create an event until your account has fully synced. Try again in 15 minutes.',
      );
      return;
    }
    logStartEventCreation();
    this.setState({createVisible: true});
  };

  // some scroll values have drastic differences between android and iOS
  // iOS handles the header hiding much better than android, and instead of trying to account for both in one function
  // handle the scrolling events differently on an OS level
  handleScroll = (event) => {
    // prevent changing state of header when loading more
    if (this.state.loadingMore) return;
    const position = event.nativeEvent.contentOffset.y;
    // this seems to double occassionally with android, which can cause totalHeaderHeight to be negative
    const containerOffset =
      event.nativeEvent.contentSize.height -
      event.nativeEvent.layoutMeasurement.height;
    // Preventing header hiding when there are less than 8 events
    // This should prevent header bouncing issues and help deal with differences from various phone resolutions
    if (this.state.events.length >= 8) {
      if (Platform.OS === 'ios')
        this.handleiOSScroll(position, containerOffset);
      else this.handleAndroidScroll(position, containerOffset);
    }
  };

  handleiOSScroll = (position, containerOffset) => {
    const MINIMUM_PIXELS_FOR_HEADER_CHANGE = 5;
    // prevent checking on each scroll pixel, only change header after moving up or down the minimum set pixel amount
    if (
      position + MINIMUM_PIXELS_FOR_HEADER_CHANGE >= this.yOffset ||
      position - MINIMUM_PIXELS_FOR_HEADER_CHANGE <= this.yOffset
    ) {
      // collapse the headers when the user is scrolling down and is at least past the height of lozenges
      if (
        position >= this.yOffset &&
        !this.props.collapsedHeader &&
        position >= LOZENGE_VIEW_HEIGHT &&
        this.yOffset + LOZENGE_VIEW_HEIGHT > position
      )
        this.props.collapseHeader(true);
      else if (position < this.yOffset && this.props.collapsedHeader)
        this.props.collapseHeader(false);
      else if (
        position <= 0 &&
        containerOffset >= LOZENGE_VIEW_HEIGHT &&
        this.props.collapsedHeader
      )
        this.props.collapseHeader(false);
    }
    // only update the current position when the app is not in a state to "bounce" updwards
    if (position < containerOffset) this.yOffset = position;
  };

  handleAndroidScroll = (position, containerOffset) => {
    // maxContainerOffset is the value with both search bars
    // only set it on first scroll
    if (this.maxContainerOffset === 0)
      this.maxContainerOffset = containerOffset;

    // total view of lozenge height and search bars
    let totalHeaderHeight = LOZENGE_VIEW_HEIGHT;
    totalHeaderHeight += this.maxContainerOffset - containerOffset;

    const MINIMUM_PIXELS_FOR_HEADER_CHANGE = 10;

    // force header to be shown when close enough to the top
    if (position - MINIMUM_PIXELS_FOR_HEADER_CHANGE <= LOZENGE_VIEW_HEIGHT)
      this.props.collapseHeader(false);
    // force header to be hidden when near the bottom
    else if (
      position + MINIMUM_PIXELS_FOR_HEADER_CHANGE >=
      this.maxContainerOffset
    )
      this.props.collapseHeader(true);
    // prevent checking on each scroll pixel, only change header after moving up or down the minimum set pixel amount
    else if (
      position + MINIMUM_PIXELS_FOR_HEADER_CHANGE >= this.yOffset ||
      position - MINIMUM_PIXELS_FOR_HEADER_CHANGE <= this.yOffset
    ) {
      // collapse the headers when the user is scrolling down and is at least past the height of lozenges
      if (
        position >= this.yOffset &&
        !this.props.collapsedHeader &&
        position >= LOZENGE_VIEW_HEIGHT &&
        this.yOffset + LOZENGE_VIEW_HEIGHT > position
      ) {
        this.props.collapseHeader(true);
        this.yOffset = position;
      } else if (
        position < this.yOffset &&
        this.props.collapsedHeader &&
        position > totalHeaderHeight &&
        totalHeaderHeight > 0
      ) {
        this.props.collapseHeader(false);
        this.yOffset = position;
      } else if (
        position <= 0 &&
        containerOffset >= LOZENGE_VIEW_HEIGHT &&
        this.props.collapsedHeader
      ) {
        this.props.collapseHeader(false);
        this.yOffset = position;
      }
    }
  };

  render() {
    //sometimes when navigations happen before animations are complete onDidFocus doesn't get called.
    //here is a workaround
    const {navigation} = this.props;
    const value = navigation.getParam('value', undefined);
    if (value != undefined) {
      this.handleDidNavTo(navigation);
    }
    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={{flex: 1, backgroundColor: RWBColors.white}}>
          <NavigationEvents onDidFocus={this.handleDidFocus} />
          <View>
            {!this.props.collapsedHeader ? null : (
              <View>
                <TouchableOpacity
                  accessible={true}
                  accessibilityLabel={'Toggle event filters'}
                  accessibilityRole={'button'}
                  onPress={() => this.setState({collapsedHeader: false})}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      top: 5,
                      left: 10,
                    }}>
                    <SearchIcon
                      tintColor={RWBColors.white}
                      height={24}
                      width={24}
                    />
                    <Text style={{color: RWBColors.white, left: 10}}>
                      Events near {this.state.city}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {/* Determine if should be visible always or hidden during scrolling */}
          <View style={{backgroundColor: RWBColors.white, flex: 1}}>
            {/* Filter Buttons */}
            {!this.props.collapsedHeader && !this.props.challengeId ? (
              <LozengeDispatcher
                groupEventType={this.state.activeGroupEventType}
                pastEventType={this.state.activePastEventType}
                activeTab={this.props.activeTab}
                eventCategory={this.props.eventCategory}
                eventDistance={this.props.eventDistance}
                sortBy={this.props.sortBy}
                eventDate={this.props.eventDate}
                virtualSubtype={this.props.virtualSubtype}
                myEventType={this.props.activeMyEventsType}
                groupName={this.props.groupName}
                virtualTime={this.props.virtualTime}
                eventGroupOption={this.props.eventGroupOption}
                eventFilterNavTab={this.props.eventFilterNavTab}
                toggleLocalLozenge={this.toggleLocalLozenge}
                openFilters={this.openFilters}
                toggleVirtualLozenge={this.toggleVirtualLozenge}
                toggleMyLozenge={this.toggleMyLozenge}
                togglePastLozenge={this.togglePastLozenge}
                toggleGroupEventLozenge={this.toggleGroupEventLozenge}
              />
            ) : null}
            <EventList
              events={this.state.events}
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
              loadMore={this.handleLoadMore}
              renderSeparator={this.renderSeparator}
              renderFooter={this.renderFooter}
              extraData={{
                locale: this.state.locale,
                isLoading: this.state.isLoading,
                noResultsFound: this.state.noResultsFound,
              }}
              disableOlderEvents={false}
              alertLimitUsersDisplayed={this.alertLimitUsersDisplayed}
              onEventPressed={this.onEventPressed}
              loadAttendees={this.loadAttendees}
              loadFollowingAttendees={this.loadFollowingAttendees}
              handleScroll={this.handleScroll}
              activeTab={this.props.activeTab}
            />
          </View>
          {isCreateEventButtonVisible(
            this.props.groupName,
            this.props.activeTab,
            this.state.isLoading,
            this.state.createVisible,
            this.user,
            this.props.navigation.getParam('groupType'),
            this.props.isAdmin,
            this.props.joinedGroup,
            this.props.challengeId,
          ) ? (
            <View style={globalStyles.addButtonContainer}>
              <View>
                <TouchableOpacity
                  onPress={() => this.createEvent()}
                  style={globalStyles.addButton}>
                  <AddIcon style={{height: 24, width: 24}} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
        <Modal
          visible={this.state.createVisible}
          onRequestClose={() => this.closeCreate()}>
          <View style={{flex: 1}}>
            <CreateEventView
              close={() => this.closeCreate()}
              isVirtual={this.props.activeTab === GROUP_EVENT_TAB_TYPES.virtual}
              groupName={this.props.groupName}
              groupId={this.state.groupId}
              groupType={this.props.navigation.getParam('groupType')}
              refreshEvents={this.clearEvents}
              isAdmin={this.props.isAdmin}
            />
          </View>
        </Modal>

        <Modal
          animationType="slide"
          visible={this.state.filterVisible}
          onRequestClose={() => this.closeModal()}>
          <EventFilterView
            // shared between local and virtual
            type={this.props.activeTab}
            onClose={this.closeModal}
            activityCategory={this.props.eventCategory}
            onCategoryPressed={this.onCategoryPressed}
            date={this.props.eventDate}
            onDatePressed={this.onDatePressed}
            sortBy={this.props.sortBy}
            onSortByPressed={this.onSortByPressed}
            eventGroupOption={this.props.eventGroupOption}
            onGroupPressed={this.onGroupPressed}
            eventFilterNavTab={this.props.eventFilterNavTab}
            onNavTabPressed={this.onNavTabPressed}
            // virtual only
            virtualEventCategory={''}
            virtualSubtype={this.props.virtualSubtype}
            onVirtualCategoryPressed={() => null}
            onVirtualSubtypePressed={this.onVirtualSubtypePressed}
            virtualTime={this.props.virtualTime}
            onVirtualTimePressed={this.onVirtualTimePressed}
            // local only
            distance={this.props.eventDistance}
            sliderValue={this.state.distanceSliderValue}
            onDistancePressed={this.onDistancePressed}
          />
        </Modal>
      </SafeAreaView>
    );
  }
}
