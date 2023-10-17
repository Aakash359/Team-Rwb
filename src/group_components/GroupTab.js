import React, {Component} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import {NavigationEvents} from 'react-navigation';
import Geolocation from '@react-native-community/geolocation';
import {
  LOCATION_PERMISSION_ERROR,
  NO_LOCATION_ERROR,
  GENERAL_LOCATION_ERROR,
} from '../../shared/constants/ErrorMessages';
import {rwbApi} from '../../shared/apis/api';
import {userProfile} from '../../shared/models/UserProfile';
import {GROUP_VERSION} from '../../shared/constants/OnboardingVersions';
import {isUpdateNeeded} from '../../shared/utils/Helpers';
import NavigationService from '../models/NavigationService';
import globalStyles, {RWBColors} from '../styles';
import GroupContainer from './GroupContainer';
import GroupSearchBar from '../design_components/ElasticSearchBar';
import GroupMessages from '../onboard_components/GroupMessages';
import {version as currentVersion} from '../../package.json';

export default class GroupTab extends Component {
  constructor(props) {
    super(props);
    this.firstLaunch = true;
    const user = userProfile.getUserProfile();
    this.state = {
      // group types
      favorites: [],
      my: [],
      featured: [],
      admin: [],
      activity: [],
      nearby: [],

      favoritesGroupsLoading: true,
      myGroupsLoading: true,
      featuredGroupsLoading: true,
      adminGroupsLoading: true,
      activityGroupsLoading: true,
      nearbyGroupsLoading: true,

      newToGroups: false,
      searchingGroups: false,
      //used for all group searches
      lat: '',
      long: '',
      chapter_id: user.preferred_chapter.id,
      user_address: user.location.address,
    };
  }

  componentDidMount() {
    rwbApi.getAppVersion().then((savedVersion) => {
      savedVersion = savedVersion.app_version;
      if (isUpdateNeeded(savedVersion, GROUP_VERSION)) {
        this.setState({newToGroups: true});
        rwbApi.updateAppVersion(currentVersion);
      }
      Linking.addEventListener('url', this.handleURL);
      this.retrieveGroups();
    });
  }

  // used to navigate back into a specific group while already on the groups tab
  handleURL = (linkObj) => {
    this.firstLaunch = false;
    let url = linkObj.url;
    const GROUP_PATH = '/groups/';
    const groupID = url.split(GROUP_PATH)[1];
    if (groupID) this.navToGroup(groupID);
  };

  navToGroup = (groupID) => {
    NavigationService.navigate('GroupView', {
      group_id: groupID,
      updateJoined: this.loadMyGroups,
    });
  };

  getLocation = () => {
    return new Promise((resolve) => {
      return Geolocation.getCurrentPosition(
        (position) => {
          const {latitude, longitude} = position.coords;
          this.setState({lat: latitude.toString(), long: longitude.toString()});
          resolve({lat: latitude.toString(), long: longitude.toString()});
        },
        (error) => {
          const chapter_id = this.state.chapter_id;
          const onGroupsScreen =
            NavigationService.getCurrentScreenName() === 'Groups';
          // on an error, send the user's preferred chapter ID and the backend will get the lat/long of the preferred chapter
          // only show an alert on this screen (this can be called when joining/unjoining a different group)
          // Error code when denied permission
          if (error.code === 1) {
            if (onGroupsScreen)
              Alert.alert('Team RWB', LOCATION_PERMISSION_ERROR);
            resolve({chapter_id});
          }
          // Error code when device can't find its own location (bad reception, etc.)
          else if (error.code === 2) {
            if (onGroupsScreen) Alert.alert('Team RWB', NO_LOCATION_ERROR);
            resolve({chapter_id});
          }
          // Error code when geolocator times out.
          else {
            if (onGroupsScreen) Alert.alert('Team RWB', GENERAL_LOCATION_ERROR);
            resolve({chapter_id});
          }
        },
      );
    });
  };

  // load all groups
  retrieveGroups = () => {
    this.loadAdminGroups();
    this.loadMyGroups();
    this.loadNearbyGroups();
    this.loadActivityGroups();
  };

  loadAdminGroups = () => {
    rwbApi.retrieveGroups('admin').then((adminGroups) => {
      this.setState({
        admin: adminGroups.data || [],
        adminGroupsLoading: false,
      });
    });
  };

  loadFavoriteGroups = () => {};

  loadMyAndNearbyGroups = () => {
    this.loadMyGroups();
    this.loadNearbyGroups();
  };

  loadMyGroups = () => {
    rwbApi.retrieveGroups('my').then((myGroups) => {
      this.setState({
        my: myGroups.data,
        myGroupsLoading: false,
      });
    });
  };

  // not in sprint 1
  loadFeaturedGroups = () => {};

  loadActivityGroups = () => {
    rwbApi.retrieveGroups('activity').then((activityGroups) => {
      this.setState({
        activity: activityGroups.data,
        activityGroupsLoading: false,
      });
    });
  };

  loadNearbyGroups = () => {
    this.getLocation().then((locationData) => {
      rwbApi.retrieveGroups('nearby', locationData).then((nearbyGroups) => {
        this.setState({
          nearby: nearbyGroups.data || [],
          nearbyGroupsLoading: false,
        });
      });
    });
  };

  // not in sprint 1
  handleUpdateFavoriteGroups = () => {
    return;
    this.loadFavoriteGroups().then((favoriteGroups) => {
      this.setState({favorites: favoriteGroups});
    });
  };

  handleSearchFocus = () => {
    this.interactWithGroups();
    this.setState({searchingGroups: true});
  };

  // called on any interactions on the group page (visiting a group, interacting with the search bar, clicking on another tab)
  interactWithGroups = () => {
    if (this.state.newToGroups) this.setState({newToGroups: false});
  };
  // used to handle deep linking when on another tab
  // taking care of naving to the page from here to ensure the proper update functions are sent
  handleDidFocus = () => {
    const groupID = this.props.navigation.getParam('groupID', null);
    // clear the param to avoid being stuck going to the specific group repeatedly
    this.props.navigation.setParams({groupID: null});
    if (groupID && this.firstLaunch) this.navToGroup(groupID);
    else if (
      userProfile.getUserProfile().location.address !== this.state.user_address
    )
      this.handleAddressChange();
  };

  // retrieve nearby groups and my groups when a user changes their address in their profile settings
  handleAddressChange = () => {
    const user = userProfile.getUserProfile();
    this.setState(
      {
        chapter_id: user.preferred_chapter.id,
        user_address: user.location.address,
        myGroupsLoading: true,
        nearbyGroupsLoading: true,
      },
      () => {
        this.loadNearbyGroups();
        this.loadMyGroups();
      },
    );
  };

  render() {
    const {searchingGroups} = this.state;
    return (
      <SafeAreaView style={styles.container}>
        <NavigationEvents
          onWillBlur={() => this.setState({newToGroups: false})}
          onDidFocus={this.handleDidFocus}
        />
        <StatusBar
          barStyle="light-content"
          animated={true}
          translucent={false}
          backgroundColor={RWBColors.magenta}
        />
        <GroupSearchBar
          onFocus={() => this.handleSearchFocus()}
          focused={this.state.searchingGroups}
          searching={searchingGroups}
          handleSelect={() => {}}
          onDone={() => this.setState({searchingGroups: false})}
          placeholder="Search for Groups"
          type="groups"
          location={{
            lat: this.state.latitude,
            long: this.state.long,
            chapter_id: this.state.chapter_id,
          }}
          updateJoined={this.loadMyGroups}
          updateFavorite={this.handleUpdateFavoriteGroups}
        />
        <ScrollView
          alwaysBounceVertical={false}
          bounces={false}
          style={{
            backgroundColor: RWBColors.white,
            width: '100%',
            height: '100%',
          }}>
          {/* <GroupContainer title="favorites" /> */}
          {this.state.admin.length > 0 && (
            <GroupContainer
              title="admin groups"
              updateJoined={this.loadMyGroups}
              updateFavorite={this.handleUpdateFavoriteGroups}
              data={this.state.admin}
              isLoading={this.state.adminGroupsLoading}
            />
          )}
          <GroupContainer
            title="my groups"
            updateJoined={this.loadMyAndNearbyGroups}
            updateFavorite={this.handleUpdateFavoriteGroups}
            data={this.state.my}
            isLoading={this.state.myGroupsLoading}
          />
          {this.state.newToGroups && <GroupMessages />}
          {/* <GroupContainer title="featured groups" /> */}
          <GroupContainer
            title="activity groups"
            updateJoined={this.loadMyGroups}
            updateFavorite={this.handleUpdateFavoriteGroups}
            data={this.state.activity}
            isLoading={this.state.activityGroupsLoading}
          />
          {this.state.nearby.length > 0 && (
            <GroupContainer
              title="nearby groups"
              updateJoined={this.loadMyAndNearbyGroups}
              updateFavorite={this.handleUpdateFavoriteGroups}
              data={this.state.nearby}
              isLoading={this.state.nearbyGroupsLoading}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: RWBColors.magenta,
  },
});
