import React, {Component} from 'react';
import AggregateFeedList from './AggregateFeedList';
import SearchBar from '../SearchBar';
import styles from './Feed.module.css';
import CreatePostButton from './CreatePostButton';
import {Switch, Route, withRouter} from 'react-router-dom';
import {userProfile} from '../../../../shared/models/UserProfile';
import {rwbApi} from '../../../../shared/apis/api';
import Loading from '../Loading';
import {logAccessNotifications} from '../../../../shared/models/Analytics';
import NotificationIcon from '../svgs/NotificationIcon';
import {Grid} from '@material-ui/core';
import PostView from './PostView';
import UsersList from './UsersList';
import debounce from 'lodash.debounce';
import {hasReachedBottom} from '../../BrowserUtil';
import UpdateProfileOverlay from '../profile/UpdateProfileOverlay';
import {isUpdateNeeded} from '../../../../shared/utils/Helpers';
import {
  FEED_VERSION,
  UPDATED_FEED_VERSION,
} from '../../../../shared/constants/OnboardingVersions';
import {
  GET_VERSION_ERROR,
  USER_SEARCH_ERROR,
} from '../../../../shared/constants/ErrorMessages';
import {getMissingInfoSections} from '../../../../shared/utils/OnboardingChecks';
import {FEED_INSTRUCTIONS} from '../../../../shared/constants/OtherMessages';
import AggregateFeedListItem from './AggregateFeedListItem';
const pJSON = require('../../../package.json');

const DEBOUNCE_MS = 500;

class Feed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // createVisible: false,
      updateProfileVisible: false,
      isLoading: false,
      isLoadingMore: false,
      loadingUsers: false,
      search: '',
      userFeed: [],
      retrievedLastPost: false,
      usersList: [],
      pinnedPost: [],
      unseenNotifications: false,
      intervalId: null,
    };
    this.incompleteSections = [];
    this.user = userProfile.getUserProfile();
  }

  componentDidMount() {
    this.getUnseenNotifications();

    const newAccount = this.props.location.state?.newAccount;
    this.getFeed();
    // always update web_version on launch
    // only modify saved_version after onboarding
    rwbApi.updateAppVersion(pJSON.version, 'web').then((savedAppVersion) => {
      if (savedAppVersion === GET_VERSION_ERROR) return;
      // show most recent onboard process if a new account
      if (newAccount) {
        this.setState({updateProfileVisible: true});
      }
      if (isUpdateNeeded(savedAppVersion.app_version, FEED_VERSION))
        this.setState({updateProfileVisible: true});
    });
    window.addEventListener('scroll', this.trackScrolling);

    let intervalId = setInterval(() => {
      this.getUnseenNotifications();
    }, 60 * 3000);

    this.setState({intervalId: intervalId});
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.trackScrolling);
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
    }
  }

  trackScrolling = (event) => {
    event.preventDefault();
    // if (this.props.location.pathname !== '/feed') return;

    const wrappedElement = document.getElementById('root');
    // when switching to the tab the bottom is considered reached, but there are no posts
    // this puts the app trying to load more when it should not be
    // on start loading more when the bottom is reached AND there is some data
    if (hasReachedBottom(wrappedElement) && this.state.userFeed.length > 0) {
      this.setState({retrievedLastPost: true}, this.handleLoadMore);
      window.removeEventListener('scroll', this.trackScrolling);
    }
  };

  getFeed = () => {
    this.setState({isLoading: true});
    // prepending the most recent result mixes up types, text, and reactions
    // to avoid that, clear out everything and reload everything
    const currentFeed = this.state.userFeed;
    this.setState({userFeed: []});
    Promise.all([this.getPinnedPost(), this.getTimeline()])
      .then(([pinnedPost, timeline]) => {
        this.setState({
          pinnedPost: pinnedPost?.data?.results,
          userFeed: timeline.data.results,
          isLoading: false,
        });
      })
      .catch((error) => {
        alert('Team RWB: There was an error retrieving your feed.');
        this.setState({isLoading: false, userFeed: currentFeed});
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

  handleLoadMore = () => {
    // only try to retrieve more from the feed if it is not already retrieving
    const posts = this.state.userFeed;
    const lastPost = posts[posts.length - 1];
    this.setState({isLoadingMore: true});
    //lastPost check needed because window listener is active on all pages
    if (this.state.retrievedLastPost && lastPost) {
      rwbApi.getTimelineFeed(lastPost.id).then((result) => {
        if (result.data.results.length > 0) {
          this.setState({
            userFeed: [...this.state.userFeed, ...result.data.results],
            isLoadingMore: false,
            retrievedLastPost: false,
          });
          window.addEventListener('scroll', this.trackScrolling);
        } else this.setState({isLoadingMore: false});
      });
    }
  };

  searchUsers = (text) => {
    rwbApi
      .searchUser(text)
      .then((result) => {
        this.setState({usersList: result, loadingUsers: false});
      })
      .catch(() => {
        alert(`Team RWB: ${USER_SEARCH_ERROR}`);
        this.setState({usersList: [], loadingUsers: false});
      });
  };

  debouncedSearchUsers = debounce(this.searchUsers, DEBOUNCE_MS);

  // display search text and indicate to the user that data is loading
  searchUserHandler = (text) => {
    this.setState({search: text, loadingUsers: true});
    this.debouncedSearchUsers(text);
  };

  mergeNewPost = () => this.getFeed();

  // used when finishing onboarding process
  updateProfile = () => {
    rwbApi.updateAppVersion(UPDATED_FEED_VERSION);
    this.setState({updateProfileVisible: false});
    const missingSections = getMissingInfoSections(this.user);
    if (
      !missingSections.militaryComplete ||
      !missingSections.personalComplete ||
      !missingSections.privacyComplete
    )
      this.props.history.push('/profile/edit');
  };

  getUnseenNotifications = () => {
    const userID = userProfile.getUserProfile().id;
    if (userID) {
      rwbApi.getUnseenNotifications().then((result) => {
        this.setState({unseenNotifications: result.data > 0});
      });
    }
  };

  render() {
    const {
      search,
      loadingUsers,
      isLoading,
      userFeed,
      isLoadingMore,
      usersList,
      updateProfileVisible,
      pinnedPost,
      unseenNotifications,
    } = this.state;

    const {history} = this.props;

    return (
      <div className={styles.container} id={'root'}>
        {updateProfileVisible ? (
          <UpdateProfileOverlay finishOnboarding={this.updateProfile} />
        ) : null}
        {isLoading && (
          <Loading size={100} color={'var(--white)'} loading={true} right />
        )}
        <div>
          <Switch>
            <Route path={`${this.props.match.path}/:postId`} exact>
              <PostView />
            </Route>
            <Route path={this.props.match.path}>
              <div className={styles.searchContainer}>
                <SearchBar
                  placeholder={'Search for People'}
                  value={search}
                  onChange={this.searchUserHandler}
                  onSubmit={() => {}}
                  onClearSearch={() => this.setState({search: ''})}
                />
                <button
                  onClick={() => {
                    history.push('/notifications');
                    this.setState({unseenNotifications: false});
                    logAccessNotifications();
                  }}
                  className={styles.notificationsButton}>
                  <NotificationIcon
                    className={styles.notificationIcon}
                    filledIcon={unseenNotifications}
                    notification={unseenNotifications}
                    tintColor={unseenNotifications ? '#BF0D3E' : '#828588'}
                  />
                </button>
              </div>

              {search !== '' ? (
                <UsersList
                  usersSuggestions={usersList}
                  loadingUsers={loadingUsers}
                  onSelect={(user) =>
                    this.props.history.push(`/profile/${user.id}`)
                  }
                />
              ) : (
                <>
                    <>
                      {pinnedPost !== undefined && pinnedPost?.length > 0
                        ? <AggregateFeedListItem
                          data={pinnedPost[0]}
                          type={pinnedPost[0].activities[0].object.split(':')[0]}
                          key={'pinned'}
                          origin={origin}
                          mergeNewPost={() => null}
                        />
                        : null
                      }
                      {userFeed.length > 0 &&
                        <AggregateFeedList
                          pinnedPost={pinnedPost}
                          userFeed={userFeed}
                          origin={'user'}
                          mergeNewPost={this.mergeNewPost}
                        />
                      }
                      {isLoadingMore && (
                        <Loading
                          size={60}
                          color={'var(--grey20)'}
                          loading={true}
                          footerLoading
                        />
                      )}
                    </>


                  {userFeed.length === 0 && pinnedPost?.length === 0 && !isLoading && (
                    <Grid container justify={'center'}>
                      <p className={styles.emptyListText}>
                        {FEED_INSTRUCTIONS}
                      </p>
                    </Grid>
                  )}

                  {!this.user.anonymous_profile && (
                    <CreatePostButton
                      type={'user'}
                      mergeNewPost={this.mergeNewPost}
                    />
                  )}
                </>
              )}
            </Route>
          </Switch>
        </div>
      </div>
    );
  }
}

export default withRouter(Feed);
