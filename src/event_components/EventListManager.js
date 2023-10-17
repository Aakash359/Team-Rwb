import React from 'react';
import {SafeAreaView, View, StatusBar, Alert, Linking} from 'react-native';
import {rwbApi} from '../../shared/apis/api';
import {userProfile} from '../../shared/models/UserProfile';
import {notificationController} from '../NotificationController';
import {authentication} from '../../shared/models/Authentication';
import {
  EVENT_TAB_TYPES,
  EVENT_NAV_ELEMENTS,
  MY_EVENT_TYPES,
  GROUP_EVENT_NAV_ELEMENTS,
  GROUP_EVENT_TAB_TYPES,
} from '../../shared/constants/EventTabs';
import {logAccessEventDetails} from '../../shared/models/Analytics';
import MCReactModule from 'react-native-marketingcloudsdk';

import globalStyles, {RWBColors} from '../styles';
import NavTabs from '../design_components/NavTabs';
import EventsListView from './EventsListView';
import EventSearches from './EventSearches';
import {filters} from '../models/Filters';
import GoogleAutocompleteView from '../autocomplete_components/GoogleAutocomplete';
import {
  VIRTUAL_EVENT_OPTIONS,
  VIRTUAL_GROUP_OPTIONS,
} from '../../shared/constants/EventFilters';
import {DEFAULT_VIRTUAL_OPTIONS} from '../../shared/constants/DefaultFilters';

export default class EventListManager extends React.Component {
  constructor(props) {
    super(props);
    // chapter group names follow the convent "Team RWB CITY ST", retrieve the city to display in the search bar
    // geographical information for chapter groups contains state, lat, long, but no city
    let cityNameFromGroup;
    if (this.props.groupName && this.props.groupType === 'chapter')
      cityNameFromGroup = this.props.groupName
        .replace('Team RWB', '')
        .slice(0, -2)
        .trim();
    this.alertLimitUsersDisplayedShowed = false;
    this.yOffset = 0;
    this.user = userProfile.getUserProfile();
    this.localRef = React.createRef();
    this.virtualRef = React.createRef();
    this.myRef = React.createRef();
    this.pastRef = React.createRef();
    this.state = {
      activeTab:
        this.props.groupType && this.props.groupType !== 'chapter'
          ? EVENT_TAB_TYPES.virtual
          : EVENT_TAB_TYPES.local,
      collapsedHeader: false,
      isAdmin: undefined, // remains undefined for event list tab, otherwise will be true or false
      // stored filter values so they persist through changing screens
      activeMyEventsType: MY_EVENT_TYPES.hosting, // default of hosting for my events

      // local filters
      localEventDistance: filters.eventDistance,
      localEventCategory: filters.eventCategory, //"all-activities", "yoga", "social", etc
      localEventDate: filters.eventDate,
      localSortBy: filters.sortBy,
      localEventGroupOption: filters.eventGroupOption,
      eventFilterNavTab: filters.eventFilterNavTab,

      // virtual filters
      virtualSubtype: filters.virtualSubtype,
      virtualEventCategory: filters.virtualEventCategory,
      virtualEventDate: filters.virtualEventDate,
      virtualSortBy: filters.virtualSortBy,
      virtualEventGroupOption: filters.virtualEventGroupOption,
      virtualTime: filters.virtualTime,

      // past filtering
      pastEventCategory: filters.eventCategory,

      showLocationSearch: false,
      search: '',
      cityNameFromGroup,
      groupLat: this.props.groupLat || '',
      groupLong: this.props.groupLong || '',
      city:
        this.props.groupType === 'chapter'
          ? cityNameFromGroup
          : this.user.location.city,
      locationSearchInput: '',
    };
  }

  componentDidMount() {
    Linking.addEventListener('url', this.handleURL);
    // case for alpha testers who had old filters.
    if (!(this.state.virtualEventGroupOption in VIRTUAL_GROUP_OPTIONS)) {
      this.setState({
        virtualEventGroupOption:
          DEFAULT_VIRTUAL_OPTIONS.virtualEventGroupOption,
      });
      filters.setFilter({
        virtualEventGroupOption:
          DEFAULT_VIRTUAL_OPTIONS.virtualEventGroupOption,
      });
    }
    // on the initial opening of the events tab, handleURL is not picked up by the listener
    // this will ensure on that fist case that the appropriate actions happen
    if (this.props.navigation.state?.params?.is_virtual === 'true')
      this.handleURL();
  }
  // initial load of EventsListView determines if the user is an admin
  // this is group specific and only called if a group id
  setIsAdmin = (isAdmin) => {
    this.setState({isAdmin});
  };

  handleDistancePressed = (distance) => {
    if (this.state.activeTab === EVENT_TAB_TYPES.local) {
      this.setState({localEventDistance: distance});
      filters.setFilter({eventDistance: distance});
    }
  };

  handleCategoryPressed = (category) => {
    if (this.state.activeTab === EVENT_TAB_TYPES.local) {
      this.setState({localEventCategory: category});
      filters.setFilter({eventCategory: category});
    } else if (this.state.activeTab === EVENT_TAB_TYPES.virtual) {
      this.setState({virtualEventCategory: category});
      filters.setFilter({virtualEventCategory: category});
    }
  };

  handleDatePressed = (date) => {
    if (this.state.activeTab === EVENT_TAB_TYPES.local) {
      this.setState({localEventDate: date});
      filters.setFilter({eventDate: date});
    } else if (this.state.activeTab === EVENT_TAB_TYPES.virtual) {
      this.setState({virtualEventDate: date});
      filters.setFilter({virtualEventDate: date});
    }
  };

  handleSortByPressed = (sortBy) => {
    if (this.state.activeTab === EVENT_TAB_TYPES.local) {
      this.setState({localSortBy: sortBy});
      filters.setFilter({sortBy: sortBy});
    } else if (this.state.activeTab === EVENT_TAB_TYPES.virtual) {
      this.setState({virtualSortBy: sortBy});
      filters.setFilter({virtualSortBy: sortBy});
    }
  };

  handleGroupPressed = (group) => {
    if (this.state.activeTab === EVENT_TAB_TYPES.local) {
      this.setState({localEventGroupOption: group});
      filters.setFilter({eventGroupOption: group});
    } else if (this.state.activeTab === EVENT_TAB_TYPES.virtual) {
      this.setState({virtualEventGroupOption: group});
      filters.setFilter({virtualEventGroupOption: group});
    }
  };

  handleNavTabPressed = (nav) => {
    this.setState({eventFilterNavTab: nav});
    filters.setFilter({eventFilterNavTab: nav});
  };

  handleVirtualSubtypePressed = (virtualSubtype) => {
    if (this.state.activeTab === EVENT_TAB_TYPES.virtual) {
      this.setState({virtualSubtype: virtualSubtype});
      filters.setFilter({virtualSubtype: virtualSubtype});
    }
  };

  handleVirtualTimePressed = (virtualTime) => {
    if (this.state.activeTab === EVENT_TAB_TYPES.virtual) {
      this.setState({virtualTime: virtualTime});
      filters.setFilter({virtualTime: virtualTime});
    }
  };

  onSearchTextChange = (text) => {
    this.setState({search: text});
  };

  onClearSearchPressed = () => {
    this.setState({search: ''});
    this.clearEvents({search: ''});
  };

  onShowLocation = () => {
    this.setState({showLocationSearch: true});
  };

  handleLocationInput = (value) => {
    // look events up by the user's chapter after clicking the clear button when new events are displayed
    if (value === undefined && !this.state.showLocationSearch) {
      this.setState({
        showLocationSearch: false,
        city: this.state.cityNameFromGroup || this.user.location.city,
        locationSearchInput: '',
      });
      this.clearEvents({
        city: this.state.cityNameFromGroup || this.user.location.city,
        lat: this.state.groupLat || '',
        long: this.state.groupLong || '',
        locationSearchInput: '',
      });
    }
    // hide the location selection before a new location has been selected
    else if (value === undefined) {
      this.setState({
        showLocationSearch: false,
      });
    }
    this.setState({locationSearchInput: value});
  };

  setFlag = (flag) => {
    this.setState({activeTab: flag, search: '', locationSearchInput: ''});
  };

  searchSubmit = () => {
    const {search} = this.state;
    // logSearch();
    // MySQL requires there to be at least 3 characters in order to search. (Might need to explain that to users)
    if (search.length >= 3) this.clearEvents({search});
    else this.clearEvents({search: ''});
  };

  clearEvents = (search) => {
    const {activeTab} = this.state;
    // NOTE: There is sometimes an issue calling clear events of the ref
    // this happens with deep linking, and might be a race condition
    // I have only discovered this issue with fast refresh while debugging
    if (activeTab === EVENT_TAB_TYPES.local)
      this.localRef?.current?.clearEvents(search);
    else if (activeTab === EVENT_TAB_TYPES.virtual)
      this.virtualRef?.current?.clearEvents(search);
    else if (activeTab === EVENT_TAB_TYPES.my)
      this.myRef?.current?.clearEvents(search);
    else if (activeTab === GROUP_EVENT_TAB_TYPES.past)
      this.pastRef?.current?.clearEvents(search);
    else
      throw new Error(
        "Expecting activeTab of 'local', 'virtual', 'my', or 'past",
      );
  };

  setCollapsedHeader = (collapsed) => {
    this.setState({collapsedHeader: collapsed});
  };

  // NOTE: Ideally would scrap this for using our saved filters. This for now is a basic setup
  updateParentFilter = (category, value) => {
    this.setState({[category]: value});
  };

  updateShowLocationSearch = (value) => {
    this.setState({showLocationSearch: value});
  };

  handleGoogleResponse = (response) => {
    this.setState({city: response.city, locationSearchInput: response.city});
    this.localRef.current.handleGoogleResponse(response);
  };

  // Currently keeps old params
  handleURL = () => {
    // handle link directly to this page
    const params = this.props.navigation.state.params;
    if (params?.is_virtual === 'true') {
      this.setFlag(EVENT_TAB_TYPES.virtual);
      // Overwriting the filters so that when a user opens up their filters, they can see them
      // if the app is closed and reopened, their saved filters will be present
      this.setState({
        virtualSubtype:
          params?.virtual_event_category || filters.virtualSubtype,
        virtualEventCategory: params?.category || filters.virtualEventCategory,
        virtualSortBy: params?.sort || filters.virtualSortBy,
      });

      // params persist, reset the params after getting them
      // this primarly will only help with development, as users should not be getting multiple links in one session
      this.props.navigation.setParams({
        // is_virtual: null,
        sort: null,
        category: null,
        virtual_event_category: null,
      });

      // ensure the tab changes
      this.forceUpdate();
      // ensure new events are retrieved if the user is on the virtual tab
      this.clearEvents();
    }
  };

  render() {
    return (
      // viewing from the group page does not have the bottom nav bar and the bottom safe area on ios (bottom swipe bar) would be magenta
      <SafeAreaView
        style={{
          backgroundColor: this.props.groupName
            ? RWBColors.white
            : RWBColors.magenta,
          flex: 1,
        }}>
        <StatusBar
          barStyle="light-content"
          animated={true}
          translucent={false}
          backgroundColor={RWBColors.magenta}
        />
        <View style={{backgroundColor: RWBColors.magenta}}>
          {!this.state.collapsedHeader ? (
            <View>
              <View
                style={{
                  width: '100%',
                  paddingTop: 10,
                  paddingBottom: 20,
                }}>
                <EventSearches
                  activeTab={this.state.activeTab}
                  searchSubmit={this.searchSubmit}
                  onClearSearchPressed={this.onClearSearchPressed}
                  search={this.state.search}
                  onSearchTextChange={this.onSearchTextChange}
                  showLocation={this.onShowLocation}
                  city={this.state.city}
                  onLocationInput={this.handleLocationInput}
                  locationSearch={this.state.locationSearchInput}
                  searchingLocation={this.state.showLocationSearch}
                />
              </View>
              <NavTabs
                tabs={
                  this.props.groupName
                    ? GROUP_EVENT_NAV_ELEMENTS
                    : EVENT_NAV_ELEMENTS
                }
                selected={this.state.activeTab}
                handleOnPress={this.setFlag}
              />
              {this.state.showLocationSearch ? (
                <GoogleAutocompleteView
                  searchValue={this.state.locationSearchInput}
                  onGoogleFinish={this.handleGoogleResponse}
                  searchType={'(regions)'}
                />
              ) : null}
            </View>
          ) : null}
        </View>
        {this.state.activeTab === EVENT_TAB_TYPES.local ? (
          <EventsListView
            navigation={this.props.navigation}
            activeTab={EVENT_TAB_TYPES.local}
            collapseHeader={this.setCollapsedHeader}
            collapsedHeader={this.state.collapsedHeader}
            updateParentFilter={this.updateParentFilter}
            showLocationSearch={this.state.showLocationSearch}
            updateShowLocationSearch={this.updateShowLocationSearch}
            eventCategory={this.state.localEventCategory}
            eventDistance={this.state.localEventDistance}
            eventDate={this.state.localEventDate}
            sortBy={this.state.localSortBy}
            eventGroupOption={this.state.localEventGroupOption}
            eventFilterNavTab={this.state.eventFilterNavTab}
            handleDistancePressed={this.handleDistancePressed}
            handleCategoryPressed={this.handleCategoryPressed}
            handleDatePressed={this.handleDatePressed}
            handleSortByPressed={this.handleSortByPressed}
            handleGroupPressed={this.handleGroupPressed}
            handleNavTabPressed={this.handleNavTabPressed}
            ref={this.localRef}
            groupName={this.props.groupName}
            groupId={this.props.groupId}
            isAdmin={this.state.isAdmin}
            setIsAdmin={this.setIsAdmin}
            // no-ops needed because EventFilterView.js expects them
            handleVirtualSubtypePressed={() => null}
            handleVirtualTimePressed={() => null}
            groupLat={this.props.groupLat}
            groupLong={this.props.groupLong}
            joinedGroup={this.props.joinedGroup}
            key={'local'}
          />
        ) : this.state.activeTab === EVENT_TAB_TYPES.virtual ? (
          <EventsListView
            navigation={this.props.navigation}
            activeTab={EVENT_TAB_TYPES.virtual}
            collapseHeader={this.setCollapsedHeader}
            collapsedHeader={this.state.collapsedHeader}
            updateParentFilter={this.updateParentFilter}
            eventCategory={this.state.virtualEventCategory}
            virtualSubtype={this.state.virtualSubtype}
            virtualTime={this.state.virtualTime}
            eventDate={this.state.virtualEventDate}
            sortBy={this.state.virtualSortBy}
            eventGroupOption={this.state.virtualEventGroupOption}
            ref={this.virtualRef}
            handleCategoryPressed={this.handleCategoryPressed}
            handleDatePressed={this.handleDatePressed}
            handleSortByPressed={this.handleSortByPressed}
            handleVirtualSubtypePressed={this.handleVirtualSubtypePressed}
            handleGroupPressed={this.handleGroupPressed}
            handleVirtualTimePressed={this.handleVirtualTimePressed}
            groupName={this.props.groupName}
            groupId={this.props.groupId}
            isAdmin={this.state.isAdmin}
            setIsAdmin={this.setIsAdmin}
            // no-ops needed because EventFilterView.js expects them
            handleDistancePressed={() => null}
            handleNavTabPressed={() => null}
            joinedGroup={this.props.joinedGroup}
            key={'virtual'}
          />
        ) : this.state.activeTab === EVENT_TAB_TYPES.my ? (
          <EventsListView
            navigation={this.props.navigation}
            activeTab={EVENT_TAB_TYPES.my}
            collapseHeader={this.setCollapsedHeader}
            collapsedHeader={this.state.collapsedHeader}
            updateParentFilter={this.updateParentFilter}
            activeMyEventsType={this.state.activeMyEventsType}
            ref={this.myRef}
            key={'my'}
          />
        ) : this.state.activeTab === GROUP_EVENT_TAB_TYPES.past ? (
          <EventsListView
            navigation={this.props.navigation}
            activeTab={GROUP_EVENT_TAB_TYPES.past}
            collapseHeader={this.setCollapsedHeader}
            collapsedHeader={this.state.collapsedHeader}
            updateParentFilter={this.updateParentFilter}
            eventCategory={this.state.pastEventCategory}
            ref={this.pastRef}
            groupName={this.props.groupName}
            groupId={this.props.groupId}
            key={'past'}
          />
        ) : null}
      </SafeAreaView>
    );
  }
}
