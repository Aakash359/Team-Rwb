import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import CreatePost from './CreatePostView';
import PeopleSearchBar from '../design_components/ElasticSearchBar';
import {userProfile} from '../../shared/models/UserProfile';

import globalStyles, {RWBColors} from '../styles';
import UpdateProfileModal from '../onboard_components/UpdateProfileModal';
import {rwbApi} from '../../shared/apis/api';
import AddIcon from '../../svgs/AddIcon';
import NavigationService from '../models/NavigationService';
import AggregatedFeedCard from './AggregatedFeedCard';
import {filters} from '../models/Filters';
import {isUpdateNeeded} from '../../shared/utils/Helpers';
import {FEED_VERSION} from '../../shared/constants/OnboardingVersions';
import {GET_VERSION_ERROR} from '../../shared/constants/ErrorMessages';
import {FEED_INSTRUCTIONS} from '../../shared/constants/OtherMessages';
import {version as currentVersion} from '../../package.json';
import UpdateAppModal from '../onboard_components/UpdateAppModal';
import {updateUserTokens} from '../onLogin';
import {isPostVisible} from '../../shared/utils/FeedHelpers';
import NotificationTabIcon from '../../svgs/NotificationTabIcon';
import {logAccessNotifications} from '../../shared/models/Analytics';
import {handleInitialURL} from '../../shared/utils/HandleInitialURL';
export default class FeedTab extends React.Component {
  constructor(props) {
    super(props);
    this.closeCreateModal = this.closeCreateModal.bind(this);
    this.closeUpdateModal = this.closeUpdateModal.bind(this);
    this.retrievedLastPost = false;
    this.firstLaunch = true;
    this.state = {
      createVisible: false,
      updateProfileVisible: false,
      refreshing: false,
      searchingUsers: false,
      isLoadingMore: false,
      retrievedLastPost: false,
      showUpdateAppModal: false,
      pinnedPost: [],
      unseenNotifications: false,
    };
    this.incompleteSections = [];
    this.user = userProfile.getUserProfile();
    // Have the app check every three minutes to see if there are unread notifications
    setInterval(() => {
      this.getUnseenNotifications();
    }, 60 * 3000);
  }

  componentDidMount() {
    updateUserTokens();
    this.isAppAtLeastRequiredVersion()
      .then((needsUpdate) => {
        if (needsUpdate) {
          this.setState({showUpdateAppModal: true});
        } else {
          this.initializeFeedTab();
        }
      })
      .catch((err) => {
        this.initializeFeedTab();
      });
    // on Android this is not executed until the user is returned to the feed tab and is unneeded for initial android launch
    if (Platform.OS === 'ios') {
      if (this.firstLaunch) {
        this.firstLaunch = false;
        handleInitialURL();
      }
    }
  }

  initializeFeedTab = () => {
    // get filters when the logged in user opens the app, allowing filters to be used in the events tab
    filters.getFilters();
    this.getFeed();
    this.checkAnonymousUser();
    this.updateSavedAppVersion();
  };

  getUnseenNotifications = () => {
    const userID = userProfile.getUserProfile().id;
    if (userID) {
      rwbApi.getUnseenNotifications().then((result) => {
        this.setState({unseenNotifications: result.data > 0});
      });
    }
  };

  navToNotification = () => {
    NavigationService.navigate('Notifications');
    this.setState({unseenNotifications: false});
    logAccessNotifications();
  };

  checkAnonymousUser = () => {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      const prevAnonStatus = this.user.anonymous_profile;
      this.user = userProfile.getUserProfile();
      // in order to properly display/hide the add icon for an event post, we check if the user updated their profile and force update
      if (this.user.anonymous_profile !== prevAnonStatus) this.forceUpdate();
    });
  };

  updateSavedAppVersion = () => {
    const newAccount = this.props.navigation.getParam('newAccount', false);
    // always update mobile_version on launch
    // only modify saved_version after onboarding
    rwbApi
      .updateAppVersion(currentVersion, 'mobile')
      .then((savedAppVersion) => {
        if (savedAppVersion === GET_VERSION_ERROR) return;
        // new accounts always show the latest onboarding process
        if (newAccount) {
          this.setState({updateProfileVisible: true});
        }
        // if less than version 2.0.18 take them through the feed onboarding process
        if (isUpdateNeeded(savedAppVersion.app_version, FEED_VERSION)) {
          this.setState({updateProfileVisible: true});
        }
      });
  };

  isAppAtLeastRequiredVersion = () => {
    return rwbApi.getMinimumRequiredVersion().then((minimumVersion) => {
      return (
        isUpdateNeeded(currentVersion, minimumVersion) &&
        !minimumVersion.includes('X')
      );
    });
  };

  closeCreateModal() {
    this.setState({createVisible: false});
  }

  closeUpdateModal() {
    this.setState({updateProfileVisible: false});
  }

  getFeed = () => {
    this.setState({refreshing: true, userFeed: [], pinnedPost: []});
    Promise.all([this.getPinnedPost(), this.getTimeline()])
      .then(([pinnedPost, timeline]) => {
        this.setState({
          refreshing: false,
          pinnedPost: pinnedPost?.data?.results,
          userFeed: timeline.data.results,
        });
      })
      .catch((error) => {
        console.warn('error getting feed: ', error);
        Alert.alert('Team RWB', 'There was an error retrieving your feed.');
        this.setState({refreshing: false});
      });
  };

  getTimeline = () => {
    return rwbApi.getTimelineFeed().then((timeline) => {
      return timeline;
    });
  };

  getPinnedPost = () => {
    return rwbApi.getPinnedPost().then((pinnedPost) => {
      return pinnedPost;
    });
  };

  doneSearching = () => {
    this.setState({searchingUsers: false});
  };

  handleLoadMore = () => {
    // only try to retrieve more from the feed if it is not already retrieving
    if (!this.state.isLoadingMore && !this.state.refreshing) {
      const posts = this.state.userFeed;
      const lastPost = posts[posts.length - 1];
      this.setState({isLoadingMore: true});
      if (!this.state.retrievedLastPost && lastPost) {
        rwbApi.getTimelineFeed(lastPost.id).then((result) => {
          if (result.data.results.length > 0)
            this.setState({
              userFeed: [...this.state.userFeed, ...result.data.results],
              isLoadingMore: false,
            });
          else this.setState({isLoadingMore: false, retrievedLastPost: true});
        });
      } else this.setState({isLoadingMore: false});
    }
  };

  handleSelectedUser = (user) => {
    NavigationService.navigateIntoInfiniteStack(
      'EventsProfileAndEventDetailsStack',
      'profile',
      {id: user.id, initial: 'Feed'},
    );
  };

  notificationButton = (unseenNotifications) => {
    return (
      <TouchableOpacity
        style={styles.notificationButtonContainer}
        onPress={() => {
          this.navToNotification();
        }}>
        <NotificationTabIcon
          filledIcon={unseenNotifications}
          notification={unseenNotifications}
          tintColor={unseenNotifications ? RWBColors.magenta : RWBColors.grey80}
          style={styles.tabIcon}
        />
      </TouchableOpacity>
    );
  };

  render() {
    const {
      refreshing,
      userFeed,
      searchingUsers,
      isLoadingMore,
      pinnedPost,
      unseenNotifications,
    } = this.state;
    return (
      <View style={styles.container}>
        <SafeAreaView>
          <StatusBar
            barStyle="light-content"
            animated={true}
            translucent={false}
            backgroundColor={RWBColors.magenta}
          />
          <PeopleSearchBar
            onFocus={() => this.setState({searchingUsers: true})}
            focused={this.state.searchingUsers}
            searching={searchingUsers}
            handleSelect={this.handleSelectedUser}
            onDone={this.doneSearching}
            placeholder="Search for People"
            type="people"
            rightSibling={this.notificationButton(unseenNotifications)}
          />
        </SafeAreaView>
        {!searchingUsers ? (
          <FlatList
            onRefresh={this.getFeed}
            refreshing={refreshing}
            style={{
              flex: 1,
              height: '100%',
              width: '100%',
              backgroundColor: RWBColors.white,
            }}
            data={
              pinnedPost !== undefined && pinnedPost.length
                ? [...pinnedPost, ...userFeed]
                : userFeed
            }
            keyExtractor={(item, index) => {
              return isPostVisible(pinnedPost, item)
                ? `${item.id}`
                : 'hidden-pinned';
            }}
            renderItem={({item}) =>
              isPostVisible(pinnedPost, item) &&
              item.activities[0].user.id && (
                <AggregatedFeedCard
                  eventID={item.activities[0].event_id}
                  data={item}
                  type={item.activities[0].object.split(':')[0]} //"post" or "event"
                  refreshFeed={this.getFeed}
                />
              )
            }
            onEndReached={this.handleLoadMore}
            ListFooterComponent={
              isLoadingMore ? (
                <View>
                  <ActivityIndicator size="large" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              !refreshing ? (
                <View style={{padding: 10}}>
                  <Text style={globalStyles.bodyCopy}>{FEED_INSTRUCTIONS}</Text>
                </View>
              ) : null
            }
          />
        ) : null}
        {!searchingUsers && !this.user.anonymous_profile ? (
          <View style={globalStyles.addButtonContainer}>
            <TouchableOpacity
              style={globalStyles.addButton}
              onPress={() => this.setState({createVisible: true})}>
              <AddIcon style={{width: 24, height: 24}} />
            </TouchableOpacity>
            <Modal
              visible={this.state.createVisible}
              onRequestClose={this.closeCreateModal}>
              <CreatePost
                type="user"
                onClose={this.closeCreateModal}
                refreshFeed={this.getFeed}
              />
            </Modal>
          </View>
        ) : null}

        <Modal
          visible={this.state.updateProfileVisible}
          onRequestClose={() => {}}
          style={styles.modal}
          transparent={true}>
          <View style={styles.popupContainer}>
            <UpdateProfileModal
              user={this.user}
              incompleteSections={this.incompleteSections}
              onClose={this.closeUpdateModal}
            />
          </View>
        </Modal>
        <UpdateAppModal showUpdateModal={this.state.showUpdateAppModal} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: RWBColors.magenta,
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: RWBColors.magenta,
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  popupContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationButtonContainer: {
    backgroundColor: RWBColors.white,
    height: 45,
    width: 45,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
});
