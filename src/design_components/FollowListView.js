import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';

import globalStyles, {RWBColors} from '../styles';
import {rwbApi} from '../../shared/apis/api.js';
import NavigationService from '../models/NavigationService.js';
import FollowList from '../design_components/FollowList';

// SVGS
import XIcon from '../../svgs/XIcon.js';
import {userProfile} from '../../shared/models/UserProfile.js';
import NavTabs from './NavTabs.js';
import {isValidFollowing} from '../../shared/utils/Helpers';

export default class FollowListView extends React.Component {
  constructor(props) {
    super(props);
    this.initialTab = this.props.navigation.getParam('tab', 'followers');
    this.userID = this.props.navigation.getParam(
      'id',
      userProfile.getUserProfile().id,
    );
    this.loggedInID = userProfile.getUserProfile().id;
    this.state = {
      isLoading: true,
      activeTab: this.initialTab,
      followersList: [],
      followingList: [],
      refreshing: false,
      loadedAllFollowers: false,
      loadedAllFollowing: false,
      isLoadingMoreFollowers: false,
      isLoadingMoreFollowing: false,
    };
  }

  filterFollowedEvents = (result) => {
    let followingList = [];
    for (let i = 0; i < result.length; i++) {
      const res = result[i];
      if (isValidFollowing(res)) {
        const user = res.user;
        user.following = res.following;
        followingList.push(user);
      }
      // followed events, avoiding to send excess data
      // still adding an ID to avoid the list from trying to extract nothing
      else followingList.push({id: res.created_at});
    }
    return followingList;
  };

  componentDidMount = () => {
    Promise.all([this.getFollowersList(0), this.getFollowingList(0)])
      .then(([followersResult, followingResult]) => {
        const followersList = [];
        let followingList = [];
        if (followersResult.length) {
          for (let i = 0; i < followersResult.length; i++) {
            const user = followersResult[i].user;
            user.following = followersResult[i].following;
            followersList.push(user);
          }
        }
        if (followingResult.length) {
          // just add the initial following data
          followingList = this.filterFollowedEvents(followingResult);
        }
        this.setState({
          isLoading: false,
          followersList,
          loadedAllFollowers: followersResult.length === 10 ? false : true,
          followingList,
          loadedAllFollowing: followingResult.length === 10 ? false : true,
        });
      })
      .catch((error) => {
        console.warn(error);
      });
  };

  handleLoadMore = (relation) => {
    if (relation === 'followers') {
      if (this.state.loadedAllFollowers || this.state.isLoadingMoreFollowers)
        return;
      this.setState({isLoadingMoreFollowers: true});
      this.getFollowersList(this.state.followersList.length).then((result) => {
        let followersList = [];
        for (let i = 0; i < result.length; i++) {
          const user = result[i].user;
          user.following = result[i].following;
          followersList.push(user);
        }
        this.setState({
          followersList: [...this.state.followersList, ...followersList],
          isLoadingMoreFollowers: false,
          loadedAllFollowers: result.length === 10 ? false : true,
        });
      });
    } else {
      if (this.state.loadedAllFollowing || this.state.isLoadingMoreFollowing)
        return;
      this.setState({isLoadingMoreFollowing: true});
      this.getFollowingList(this.state.followingList.length).then((result) => {
        const followingList = this.filterFollowedEvents(result);
        this.setState({
          followingList: [...this.state.followingList, ...followingList],
          isLoadingMoreFollowing: false,
          loadedAllFollowing: result.length === 10 ? false : true,
        });
      });
    }
  };

  getFollowersList = (offset) => {
    return rwbApi
      .getFollows(this.userID, 'followers', offset)
      .then((result) => {
        return result;
      });
  };

  getFollowingList = (offset) => {
    return rwbApi
      .getFollows(this.userID, 'following', offset)
      .then((result) => {
        return result;
      });
  };

  setFlag = (flag) => {
    const {activeTab} = this.state;
    if (activeTab !== flag) this.setState({activeTab: flag});
  };

  renderHeader() {
    return <View style={{color: 'rgba(0,0,0,1)'}} />;
  }

  renderSeparator() {
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
  }

  refresh = (list) => {
    const {refreshing, isLoading} = this.state;
    if (refreshing || isLoading) return;
    if (list === 'followers') {
      this.setState({refreshing: true, followersList: []});
      this.getFollowersList(0)
        .then((result) => {
          const followersList = [];
          if (result.length) {
            for (let i = 0; i < result.length; i++) {
              const user = result[i].user;
              user.following = result[i].following;
              followersList.push(user);
            }
          }
          this.setState({
            refreshing: false,
            followersList,
            loadedAllFollowers: result.length === 10 ? false : true,
          });
        })
        .catch((error) => {
          console.warn(error);
          this.setState({refreshing: false});
          Alert.alert(
            'Server Error',
            'Unable to retrieve the list this user is following.',
          );
        });
    } else if (list === 'following') {
      this.setState({refreshing: true, followingList: []});
      this.getFollowingList(0)
        .then((result) => {
          let followingList = [];
          if (result.length) {
            followingList = this.filterFollowedEvents(result);
          }
          this.setState({
            refreshing: false,
            followingList,
            loadedAllFollowing: result.length === 10 ? false : true,
          });
        })
        .catch((error) => {
          console.warn(error);
          this.setState({refreshing: false});
          Alert.alert(
            'Server Error',
            'Unable to retrieve the list of users following this user.',
          );
        });
    } else
      console.error(
        "Must pass list with value 'followers' or 'following' to refresh",
      );
  };

  render() {
    const navElements = [
      {
        name: 'Followers',
        key: 'followers',
      },
      {
        name: 'Following',
        key: 'following',
      },
    ];

    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={[styles.headerView]}>
          <TouchableOpacity
            onPress={() => {
              NavigationService.back();
            }}
            accessibilityRole={'button'}
            accessible={true}
            accessibilityLabel={'Go Back'}>
            <XIcon tintColor={RWBColors.white} height={24} width={24} />
          </TouchableOpacity>
        </View>
        {/* Top Nav */}
        <NavTabs
          tabs={navElements}
          selected={this.state.activeTab}
          handleOnPress={this.setFlag}
        />
        <View style={styles.wrapper}>
          {this.state.isLoading || this.state.refreshing ? (
            <View
              style={{
                marginVertical: 40,
                borderTopWidth: 0,
                borderColor: '#CED0CE',
              }}>
              <ActivityIndicator animating size="large" />
            </View>
          ) : this.state.activeTab === 'followers' ? (
            <FollowList
              type={'followers'}
              data={this.state.followersList}
              emptyMessage="You currently have no followers."
              isLoadingMore={this.state.isLoadingMoreFollowers}
              refreshing={this.state.refreshing}
              onRefresh={this.refresh}
              loggedInID={this.loggedInID}
              onEnd={() => this.handleLoadMore('followers')}
            />
          ) : (
            <FollowList
              type={'following'}
              data={this.state.followingList}
              emptyMessage="You currently are not following any users."
              isLoadingMore={this.state.isLoadingMoreFollowing}
              refreshing={this.state.refreshing}
              onRefresh={this.refresh}
              loggedInID={this.loggedInID}
              onEnd={() => this.handleLoadMore('following')}
            />
          )}
        </View>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: RWBColors.white,
    height: 40,
    width: '100%',
    justifyContent: 'space-evenly',
    alignContent: 'stretch',
  },
  topTab: {
    flex: 1,
    width: Dimensions.get('window').width * 0.5 - 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  topTabSelected: {
    flex: 1,
    width: Dimensions.get('window').width * 0.5 - 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: RWBColors.magenta,
    paddingBottom: -2,
  },
  topTabText: {
    color: '#888',
  },
  topTabTextSelected: {
    color: RWBColors.magenta,
  },
  wrapper: {
    width: '100%',
    height: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: RWBColors.white,
  },
  headerView: {
    height: 50,
    width: '100%',
    backgroundColor: RWBColors.magenta,
    marginLeft: 20,
    justifyContent: 'center',
  },
});
