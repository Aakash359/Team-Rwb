import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {rwbApi} from '../../../../shared/apis/api';
import styles from './GroupDetail.module.css';
import ExpandingText from '../ExpandingText';
import Loading from '../Loading';
import {
  capitalizeFirstLetter,
  putUserFirst,
} from '../../../../shared/utils/Helpers';
import AvatarList from '../AvatarList';
import {userProfile} from '../../../../shared/models/UserProfile';
import {isDev} from '../../../../shared/utils/IsDev';
import {GROUP_FEED_ERROR} from '../../../../shared/constants/ErrorMessages';
import CreatePostButton from '../feed/CreatePostButton';
import {hasReachedBottom} from '../../BrowserUtil';
import FeedList from '../feed/FeedList';

// SVGs
import AccountIcon from '../svgs/MyProfileIcon';
import CheckIcon from '../svgs/CheckIcon';
import EventsIcon from '../svgs/EventsIcon';
import DetailHeader from '../DetailHeader';

class GroupDetail extends Component {
  constructor(props) {
    super(props);
    const {groupId} = props.match?.params;
    this.user = userProfile.getUserProfile();

    this.state = {
      groupId,
      isLoading: true,
      joinedGroup: false,
      favoritedGroup: false,
      photo: '',
      name: '',
      type: '',
      description: '',
      eventCount: 0,
      memberCount: 0,
      eventsVisible: false,
      photo_url: '',
      sponsored_photo_url: '',
      members: [],
      copyMessage: '',
      groupLat: '',
      groupLong: '',
      groupFeed: [],
      createPostVisible: false,
      isLoadingMore: false,
      retrievedLastPost: false,
      joinStatusChanging: false,
      activeGroup: true,
    };
  }

  componentDidMount = () => {
    this.loadGroupAndFeed();

    window.addEventListener('scroll', this.trackScrolling);
  };

  componentWillUnmount() {
    window.removeEventListener('scroll', this.trackScrolling);
  }

  trackScrolling = (event) => {
    event.preventDefault();

    const wrappedElement = document.getElementById('root');
    if (hasReachedBottom(wrappedElement)) {
      this.handleLoadMore();
      window.removeEventListener('scroll', this.trackScrolling);
    }
  };

  loadGroupAndFeed = () => {
    if (!this.state.isLoading) this.setState({isLoading: true}); // this function will be called after adding a new post, in that case set isLoading to true
    Promise.all([this.loadGroup(), this.getFeed()]).then(
      ([groupResult, feedResult]) => {
        this.setState({
          photo_url: groupResult.header_image_url_large,
          sponsored_photo_url: groupResult.sponsored_photo_url, // TODO: figure out actual response name
          name: groupResult.name,
          type: groupResult.type,
          description: groupResult.description,
          memberCount: groupResult.member_count,
          members: putUserFirst(groupResult.members, groupResult.joined),
          eventCount: groupResult.event_count,
          groupLat: groupResult.location.latitude,
          groupLong: groupResult.location.longitude,
          joinedGroup: groupResult.joined,
          activeGroup: groupResult.chapter_active,
          isLoading: false,
          groupFeed: feedResult,
        });
      },
    );
  };

  loadGroup = () =>
    rwbApi
      .getGroup(this.state.groupId)
      .then((result) => result)
      .catch((err) => {
        alert('Team RWB: Unable to load the group. Please try again later.');
        this.props.history.goBack();
      });

  getFeed = () =>
    rwbApi
      .getGroupFeed(this.state.groupId)
      .then((result) => result.data.results)
      .catch((err) => {
        alert(`Team RWB: ${GROUP_FEED_ERROR}`);
      });

  handleLoadMore = () => {
    const {isLoadingMore, retrievedLastPost, groupId, groupFeed} = this.state;
    if (!isLoadingMore && !retrievedLastPost && groupFeed.length > 0) {
      this.setState({isLoadingMore: true});
      const lastPost = groupFeed[groupFeed.length - 1].id;
      rwbApi
        .getGroupFeed(groupId, lastPost)
        .then((result) => {
          this.setState({
            groupFeed: [...groupFeed, ...result.data.results],
            isLoadingMore: false,
            retrievedLastPost: result.data.results.length !== 10,
          });
        })
        .catch((err) => {
          alert(`Team RWB: ${GROUP_FEED_ERROR}`);
        });
    }
  };

  changeJoinStatus = () => {
    if (this.state.joinedGroup) this.leaveGroup();
    else this.joinGroup();
  };

  joinGroup = () => {
    this.userJoined();
    this.setState({joinStatusChanging: true});
    rwbApi
      .joinGroup(this.state.groupId)
      .then(() => {
        this.props.updateJoined();
        this.setState({joinStatusChanging: false});
      })
      .catch((err) => {
        this.userLeft();
        this.setState({joinStatusChanging: false});
        alert(
          'Team RWB: Unable to join the group at this time. Please try again later',
        );
      });
  };

  leaveGroup = () => {
    this.userLeft();
    this.setState({joinStatusChanging: true});
    rwbApi
      .leaveGroup(this.state.groupId)
      .then(() => {
        this.props.updateJoined();
        this.setState({joinStatusChanging: false});
      })
      .catch(() => {
        this.userJoined();
        this.setState({joinStatusChanging: false});
        alert(
          'Team RWB: Unable to leave the group at this time. Please try again later',
        );
      });
  };

  userJoined = () => {
    const user = userProfile.getUserProfile();
    let membersList = Array.from(this.state.members);
    membersList.unshift(user);
    this.setState({
      joinedGroup: true,
      memberCount: this.state.memberCount + 1,
      members: membersList,
    });
  };

  userLeft = () => {
    let membersList = Array.from(this.state.members);
    // will server always return this user in the badges, and will they always be first?
    membersList.shift();
    this.setState({
      joinedGroup: false,
      memberCount: this.state.memberCount - 1,
      members: membersList,
    });
  };

  changeFavoriteStatus = () => {
    // this.setState((prevState) => ({favoritedGroup: !prevState.favoritedGroup}));
  };

  // determine if user has joined and favorited the group
  getGroupStatus = () => {
    rwbApi.getGroupRelation().then((result) => {
      this.setState({
        joinedGroup: result.joined,
        favoritedGroup: result.favorited,
      });
    });
  };

  copyGroupURL = () => {
    const {groupId} = this.state;
    // logShare(); // TODO: Add Groups logs
    navigator.clipboard.writeText(
      isDev()
        ? `https://members-staging.teamrwb.org/groups/${groupId}`
        : `https://members.teamrwb.org/groups/${groupId}`,
    );
    this.setState({copyMessage: 'Copied!'});
    setTimeout(() => {
      this.setState({copyMessage: ''});
    }, 3000);
  };

  render() {
    const {
      groupId,
      isLoading,
      photo_url,
      sponsored_photo_url,
      name,
      type,
      description,
      joinedGroup,
      favoritedGroup,
      copyMessage,
      memberCount,
      members,
      eventCount,
      isLoadingMore,
      groupFeed,
    } = this.state;
    const {history} = this.props;

    return (
      <div id="root">
        {isLoading ? (
          <Loading size={100} color={'var(--white)'} loading={true} right />
        ) : (
          <>
            <DetailHeader
              imageAlt={'Group Banner'}
              primaryImg={photo_url}
              backupImg={null}
              goBack={history.goBack}
              copyClick={this.copyGroupURL}
              copyMessage={copyMessage}
            />
            <div className={styles.groupDetailsContainer}>
              {sponsored_photo_url && (
                <img
                  src={sponsored_photo_url || null}
                  className={styles.sponsoredIcon}
                />
              )}
              <h1>{name}</h1>
              <h5 className={styles.groupType}>{`${capitalizeFirstLetter(
                type,
              )} Group`}</h5>
              <div className={styles.buttonsContainer}>
                <div className={styles.likeJoinContainer}>
                  {/* <div
                    className={`${styles.likeIconContainer} ${
                      favoritedGroup && styles.likedIconContainer
                    }`}
                    onClick={this.changeFavoriteStatus}>
                    <LikeIcon
                      width={20}
                      height={20}
                      strokeColor={
                        favoritedGroup ? 'var(--white)' : 'var(--grey80)'
                      }
                      tintColor={
                        favoritedGroup ? 'var(--white)' : 'var(--grey80)'
                      }
                    />
                  </div> */}
                  <div
                    style={{
                      opacity:
                        this.state.joinStatusChanging ||
                        (!this.state.activeGroup && !joinedGroup)
                          ? 0.5
                          : 1,
                    }}
                    className={`${styles.joinIconContainer} ${
                      joinedGroup
                        ? styles.joinedIconContainer
                        : styles.joinIconContainer
                    } 
                    ${!this.state.activeGroup ? styles.inactiveGroup : null}
                    `}
                    onClick={
                      // prevent clicking while the join status is changing or the group is inactive and the user has not joined it
                      this.state.joinStatusChanging ||
                      (!this.state.activeGroup && !joinedGroup)
                        ? null
                        : this.changeJoinStatus
                    }>
                    {joinedGroup ? (
                      <CheckIcon tintColor={'var(--white)'} />
                    ) : (
                      <AccountIcon
                        strokeColor={'var(--grey80)'}
                        tintColor={'var(--grey80)'}
                        filledIcon={true}
                      />
                    )}
                    <p>{joinedGroup ? 'Joined' : 'Join'}</p>
                  </div>
                </div>
                <div
                  className={styles.eventCountContainer}
                  onClick={() => {
                    history.push({
                      pathname: `/groups/${groupId}/events`,
                      state: {
                        groupName: name,
                        groupType: type,
                        groupLat: this.state.groupLat,
                        groupLong: this.state.groupLong,
                        joinedGroup: this.state.joinedGroup,
                      },
                    });
                  }}>
                  <EventsIcon filledIcon={true} tintColor={'var(--white)'} />
                  <p>{`${eventCount} ${
                    eventCount === 1 ? 'Event' : 'Events'
                  }`}</p>
                </div>
              </div>
              <Link
                // onClick={logMembers}
                to={{
                  pathname: `/groups/${groupId}/members`,
                  state: {groupName: name, groupType: type},
                }}>
                <AvatarList
                  avatars={members}
                  total_count={`${memberCount} ${
                    memberCount === 1 ? 'Member' : 'Members'
                  }`}
                />
              </Link>
              <ExpandingText
                text={description}
                containerStyle={styles.descriptionContainer}
              />
            </div>
            <div className={styles.groupFeedContainer}>
              {groupFeed.length > 0 && (
                <FeedList
                  userFeed={groupFeed}
                  type="group"
                  isSponsor={type === 'sponsor'}
                  mergeNewPost={this.loadGroupAndFeed}
                />
              )}
              {isLoadingMore && (
                <Loading
                  size={60}
                  color={'var(--grey20)'}
                  loading={true}
                  footerLoading
                />
              )}
            </div>
            {!this.user.anonymous_profile &&
              joinedGroup &&
              this.state.activeGroup && (
                <CreatePostButton
                  groupID={groupId}
                  type={'group'}
                  mergeNewPost={this.loadGroupAndFeed}
                />
              )}
          </>
        )}
      </div>
    );
  }
}

export default withRouter(GroupDetail);
