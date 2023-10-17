import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  Share,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import globalStyles, {RWBColors} from '../styles';
import FullscreenSpinner from '../design_components/FullscreenSpinner';
import ChevronBack from '../../svgs/ChevronBack';
import NavigationService from '../models/NavigationService';
import ShareIcon from '../../svgs/ShareIcon';
import RWBButton from '../design_components/RWBButton';
import UserBadgesContainer from '../event_components/UserBadgesContainer';
import {rwbApi} from '../../shared/apis/api';
import ChallengeProgressBar from './ChallengeProgressBar';
import {JOIN_CHALLENGE_ERROR} from '../../shared/constants/ErrorMessages';
import {isDev} from '../../shared/utils/IsDev';
import CompressedLeaderboard from './CompressedLeaderboard';
import {userProfile} from '../../shared/models/UserProfile';
import FeedCard from '../post_components/FeedCard';
import AddIcon from '../../svgs/AddIcon';
import CreatePost from '../post_components/CreatePostView';
import {NavigationEvents} from 'react-navigation';

import {getIndexFromID} from '../../shared/utils/Helpers';
import {getChallengeStatusText} from '../../shared/utils/ChallengeHelpers';
import RankingRow from './RankingRow';
import {CHALLENGE_TYPES} from '../../shared/constants/ChallengeTypes';
import MobileLinkHandler from '../design_components/MobileLinkHandler';
import {CHALLENGE_EVENT_TAB_TYPES} from '../../shared/constants/EventTabs';
import { EXECUTION_STATUS, logJoinChallenge, logLeaveChallenge, logViewChallengeEvents } from '../../shared/models/Analytics';

export default class ChallengeDetailView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isLoadingMore: false,
      isRefreshing: false,
      eventCount: 0,
      joined: false,
      joining: false,
      badge_image_url: 'badge_image',
      badgeLoaded: false,
      badge_name: '',
      description: '',
      end_date: '',
      name: '',
      start_date: '',
      status: '',
      cover_image_url: 'cover_photo',
      progress: this.props.navigation.getParam('progress', 0),
      goal: 0,
      metric: '',
      place: this.props.navigation.getParam('place', 0),
      challengeId: 0,
      joinedUsers: [],
      numberOfUsers: 0,
      leaderboard: this.props.navigation.getParam('leaderboard', []),
      feed: [],
      createPostVisible: false,
      earnedBadge: false,
    };
    this.user = userProfile.getUserProfile();
  }

  loadChallenge = (refreshing, tab) => {
    if (refreshing) this.setState({isRefreshing: true});
    else this.setState({isLoading: true});
    Promise.all([
      this.getChallenge(),
      this.userJoinedChallenge(),
      this.getChallengeParticipants(),
      this.getLeaderboardRank(),
      this.getLeaderboardTop(),
      this.loadChallengeFeed(),
      this.getBadgeStatus(),
    ])
      .then(
        ([
          challenge,
          joined,
          participants,
          rank,
          leaderboard,
          feed,
          badgeStatus,
        ]) => {
          if (tab) {
            this.viewEvents(tab);
          }
          this.setState({
            badge_image_url: challenge.badge_image_url,
            badge_name: challenge.badge_name,
            description: challenge.description,
            end_date: challenge.end_date,
            name: challenge.name,
            start_date: challenge.start_date,
            status: challenge.status,
            cover_image_url: challenge.cover_image_url,
            eventCount: challenge.event_count,
            goal: challenge.goal,
            metric: challenge.required_unit,
            links: challenge.links || [],
            joined,
            joinedUsers: participants.participants,
            numberOfUsers: participants.total_count,
            place: rank.rank || 0,
            progress: rank.score || 0,
            leaderboard: leaderboard.data || [],
            feed: feed.data?.results,
            earnedBadge: badgeStatus,
          });
        },
      )
      .catch((err) => {})
      .finally(() => {
        this.setState({isLoading: false, isRefreshing: false});
      });
  };

  userJoinedChallenge = () => {
    return rwbApi
      .hasJoinedChallenge(this.state.challengeId)
      .then((response) => {
        return response;
      });
  };

  getChallenge = () => {
    return rwbApi.getChallenge(this.state.challengeId).then((result) => {
      return result;
    });
  };

  getBadgeStatus = () => {
    return rwbApi.getBadgeStatus(this.state.challengeId).then((result) => {
      return result;
    });
  };

  getChallengeParticipants = () => {
    return rwbApi
      .getChallengeParticipants(this.state.challengeId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        Alert.alert('Team RWB', 'Error Loading Challenge Participants');
      });
  };

  getLeaderboardRank = () => {
    return rwbApi
      .getLeaderboardRank(this.state.challengeId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        Alert.alert('Team RWB', 'Error Loading User Ranking');
      });
  };

  getLeaderboardTop = () => {
    return rwbApi
      .getLeaderboardTop(this.state.challengeId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        Alert.alert('Team RWB', 'Error Loading Leaderboard Top 25');
      });
  };

  loadChallengeFeed = () => {
    return rwbApi
      .getChallengeFeed(this.state.challengeId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        Alert.alert('Team RWB', 'Error Loading Challenge Feed');
      });
  };

  // used when a user deletes/creates a workout on an event and navigates to the challenge
  handleWillFocus = () => {
    // urlParams could be either a challenge id, or a challenge id with event list suffix '17/events' or '17/events/past'
    const urlParams = this.props.navigation.getParam('challengeId', 0);
    const deepLinkingTab = this.props.navigation.getParam(
      'deepLinkingTab',
      null,
    );
    let navChallengeId;
    let additionalParams;
    if (typeof urlParams === 'string' && urlParams.includes('/')) {
      navChallengeId = urlParams.split('/')[0];
      additionalParams = urlParams.slice(navChallengeId.length);
    } else {
      navChallengeId = urlParams;
    }
    // takes care of the nav tab having a challenge view already and ensuring it is updated
    // get the initial tab requested for event list or set it to upcoming
    let initialTab = null;
    if (additionalParams && additionalParams.includes('events')) {
      initialTab =
        additionalParams.split('events/')[1] ||
        CHALLENGE_EVENT_TAB_TYPES.upcoming;
    } else if (deepLinkingTab) {
      initialTab = deepLinkingTab;
    }
    if (navChallengeId !== 0 && navChallengeId !== this.state.challengeId) {
      this.setState(
        {
          challengeId: navChallengeId,
          feed: [], // prevents visual issues
        },
        () => {
          this.loadChallenge(false, initialTab);
        },
      );
    } else {
      Promise.all([this.getLeaderboardRank(), this.getLeaderboardTop()]).then(
        ([rank, leaderboard]) => {
          this.setState({
            place: rank.rank || 0,
            progress: rank.score || 0,
            leaderboard: leaderboard.data || [],
          });
        },
      );
    }
  };

  handleLoadMore = () => {
    // only try to retrieve more from the feed if it is not already retrieving
    if (!this.state.isLoadingMore) {
      const posts = this.state.feed;
      const lastPost = posts[posts.length - 1];
      this.setState({isLoadingMore: true});
      if (!this.state.retrievedLastPost) {
        rwbApi
          .getChallengeFeed(this.state.challengeId, lastPost.id)
          .then((result) => {
            if (result.data.results.length > 0)
              this.setState({
                feed: [...this.state.feed, ...result.data.results],
                isLoadingMore: false,
              });
            else this.setState({isLoadingMore: false, retrievedLastPost: true});
          });
      } else this.setState({isLoadingMore: false});
    }
  };

  shareButton = () => {
    const challengeLink = isDev()
      ? `https://members-staging.teamrwb.org/challenges/${this.state.challengeId}`
      : `https://members.teamrwb.org/challenges/${this.state.challengeId}`;
    const challengeName = this.state.name;
    return (
      <TouchableOpacity
        style={globalStyles.coverShareButton}
        onPress={() => {
          Share.share(
            {
              message:
                Platform.OS === 'android' ? challengeLink : challengeName,
              title: 'Share This Challenge',
              url: challengeLink,
            },
            {
              dialogTitle: 'Share This Challenge',
            },
          );
        }}
        accessibilityRole={'button'}
        accessible={true}
        accessibilityLabel={'Share this Challenge.'}>
        <ShareIcon tintColor={RWBColors.magenta} style={styles.iconView} />
      </TouchableOpacity>
    );
  };

  onJoinedUserPressed = () => {
    // load joined users
    this.addToParticipants();
    this.setState({joining: true});
    let analyticsObj = {
      'challenge_id': `${this.state.challengeId}`,
    };
    analyticsObj.previous_view = 'hub';
    rwbApi
      .joinChallenge(this.state.challengeId)
      .then(() => {
        analyticsObj.execution_status = EXECUTION_STATUS.success;
        logJoinChallenge(analyticsObj);
        Promise.all([this.getLeaderboardRank(), this.getLeaderboardTop()]).then(
          ([rank, leaderboard]) => {
            this.setState({
              joining: false,
              place: rank.rank || 0,
              progress: rank.score || 0,
              leaderboard: leaderboard.data || [],
            });
          },
        );
        const refreshChallenges = this.props.navigation.getParam(
          'onChallengeJoined',
          () => {},
        );
        refreshChallenges();
      })
      .catch((e) => {
        analyticsObj.execution_status = EXECUTION_STATUS.failure;
        logJoinChallenge(analyticsObj);
        this.removeFromParticipants();
        Alert.alert('Team RWB', JOIN_CHALLENGE_ERROR);
        this.setState({joining: false});
      });
  };

  onLeaveChallengePressed = () => {
    // load joined users
    this.removeFromParticipants();
    this.setState({joining: true});
    let analyticsObj = {
      'challenge_id': `${this.state.challengeId}`,
    };
    analyticsObj.previous_view = 'hub';
    rwbApi
      .leaveChallenge(this.state.challengeId)
      .then(() => {
        analyticsObj.execution_status = EXECUTION_STATUS.success;
        logLeaveChallenge(analyticsObj);
        this.getLeaderboardTop().then((leaderboard) => {
          this.setState({
            joining: false,
            leaderboard: leaderboard.data || [],
          });
        });
        const refreshChallenges = this.props.navigation.getParam(
          'onChallengeJoined',
          () => {},
        );
        refreshChallenges();
      })
      .catch(() => {
        analyticsObj.execution_status = EXECUTION_STATUS.failure;
        logLeaveChallenge(analyticsObj);
        this.addToParticipants();
        Alert.alert(
          'Team RWB',
          'Unable to leave this challenge. Please try again later.',
        );
        this.setState({joining: false});
      });
  };

  addToParticipants = () => {
    const user = userProfile.getUserProfile();
    let participantList = Array.from(this.state.joinedUsers);
    participantList.unshift(user);
    this.setState({
      numberOfUsers: this.state.numberOfUsers + 1,
      joinedUsers: participantList,
      joined: true,
    });
  };

  removeFromParticipants = () => {
    const user = userProfile.getUserProfile();
    let participantList = Array.from(this.state.joinedUsers);
    const index = getIndexFromID(user.id, participantList);
    let list = participantList;
    list.splice(index, 1);
    participantList = list;
    this.setState({
      numberOfUsers: this.state.numberOfUsers - 1,
      joinedUsers: participantList,
      joined: false,
    });
  };

  closePostView = (updated) => {
    this.setState({createPostVisible: false});
    if (updated) this.refreshFeed();
  };

  viewEvents = (tab) => {
    const analyticsObj = {
      'challenge_id': `${this.state.challengeId}`,
      previous_view: 'hub',
      click_text: `${this.state.eventCount} ${this.state.eventCount !== 1 ? 'Events' : 'Event'}`,
    }
    logViewChallengeEvents(analyticsObj);
    NavigationService.navigate('ChallengeEventList', {
      challengeName: this.state.name,
      challengeId: this.state.challengeId,
      initialTab: tab,
    });
  };

  viewParticipants = () => {
    NavigationService.navigate('ChallengeParticipantList', {
      challengeName: this.state.name,
      challengeId: this.state.challengeId,
      participants: this.state.joinedUsers,
      numberOfUsers: this.state.numberOfUsers,
    });
  };

  viewLeaderboard = () => {
    NavigationService.navigate('ChallengeLeaderboardStack', {
      challengeId: this.state.challengeId,
      challengeName: this.state.name,
      data: this.state.leaderboard,
      rank: this.state.place,
      metric: this.state.metric,
    });
  };

  refreshFeed = () => {
    this.loadChallengeFeed().then((result) => {
      this.setState({feed: result.data.results});
    });
  };

  render() {
    const {
      joined,
      eventCount,
      badge_image_url,
      badgeLoaded,
      badge_name,
      description,
      links,
      end_date,
      name,
      start_date,
      status,
      cover_image_url,
      progress,
      goal,
      metric,
      place,
      isRefreshing,
      joinedUsers,
      leaderboard,
      feed,
      numberOfUsers,
      earnedBadge,
    } = this.state;
    return (
      <View style={{flex: 1, backgroundColor: RWBColors.white}}>
        <NavigationEvents onWillFocus={this.handleWillFocus} />
        <FlatList
          refreshing={isRefreshing}
          onRefresh={() => this.loadChallenge(true)}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={false}
          ListHeaderComponent={
            this.state.isLoading ? (
              <FullscreenSpinner />
            ) : (
              <>
                <View>
                  <TouchableOpacity
                    style={globalStyles.coverBackButton}
                    accessibilityRole={'button'}
                    accessible={true}
                    accessibilityLabel={'Go back to challenges list.'}
                    onPress={NavigationService.back}>
                    <ChevronBack
                      tintColor={RWBColors.magenta}
                      style={globalStyles.chevronBackImage}
                    />
                  </TouchableOpacity>
                  {this.shareButton()}
                  <Image
                    style={{
                      width: '100%',
                      height: (Dimensions.get('window').width * 2) / 3,
                    }}
                    source={{uri: cover_image_url}}
                  />
                </View>
                <View style={styles.badgeContainer}>
                  <Image
                    style={
                      badgeLoaded
                        ? [
                            styles.badgeImageLoaded,
                            {
                              borderColor: earnedBadge
                                ? RWBColors.gold
                                : RWBColors.greySilver,
                              backgroundColor: earnedBadge
                                ? RWBColors.gold
                                : RWBColors.greySilver,
                            },
                          ]
                        : styles.badgeImageStillLoading
                    }
                    source={{uri: badge_image_url}}
                    onLoad={() => {
                      this.setState({badgeLoaded: true});
                    }}
                  />
                </View>
                <View style={styles.detailContainer}>
                  {joined &&
                  goal &&
                  goal > 0 &&
                  metric !== CHALLENGE_TYPES.leastMinutes ? (
                    <View style={{width: '50%'}}>
                      <ChallengeProgressBar
                        progress={progress}
                        goal={goal}
                        metric={metric}
                        place={place}
                      />
                    </View>
                  ) : null}
                  <View
                    style={
                      joined && goal && goal > 0
                        ? styles.detailBlock
                        : styles.detailBlockIndent
                    }>
                    <Text style={globalStyles.h1}>{name?.toUpperCase()}</Text>
                    <Text style={globalStyles.h5}>
                      {getChallengeStatusText(start_date, end_date)}
                    </Text>
                  </View>
                  <View style={styles.descriptionContainer}>
                    <Text style={globalStyles.bodyCopyForm}>{description}</Text>
                  </View>
                  {links && links.length > 0 ? (
                    <View style={{marginBottom: 30}}>
                      <Text style={globalStyles.h3}>Challenge Links:</Text>
                      <MobileLinkHandler links={links} />
                    </View>
                  ) : null}
                  <View style={styles.buttonContainer}>
                    {joined ? (
                      <RWBButton
                        onPress={this.onLeaveChallengePressed}
                        text={'Leave Challenge'.toUpperCase()}
                        buttonStyle="primary"
                        disabled={this.state.joining}
                        customStyles={{
                          width: '48%',
                          backgroundColor: RWBColors.navy,
                          opacity: this.state.joining ? 0.5 : null,
                        }}
                      />
                    ) : (
                      <RWBButton
                        onPress={this.onJoinedUserPressed}
                        text={'Join Challenge'.toUpperCase()}
                        buttonStyle="primary"
                        disabled={this.state.joining}
                        customStyles={{
                          width: '48%',
                          opacity: this.state.joining ? 0.5 : null,
                        }}
                      />
                    )}
                    <RWBButton
                      onPress={this.viewEvents}
                      text={
                        eventCount + ` ${eventCount !== 1 ? 'Events' : 'Event'}`
                      }
                      buttonStyle="primary"
                      customStyles={{
                        width: '48%',
                      }}
                    />
                  </View>
                  <UserBadgesContainer
                    usersLoading={false}
                    onPress={this.viewParticipants}
                    numberOfUsers={numberOfUsers}
                    userList={joinedUsers}
                  />
                  {joined &&
                  place &&
                  goal === '0' &&
                  metric !== CHALLENGE_TYPES.checkins ? (
                    <View style={styles.userRankContainer}>
                      <RankingRow
                        user={this.user}
                        progress={progress}
                        place={place}
                        metric={metric}
                        ignoreEmphasis={true}
                      />
                    </View>
                  ) : null}
                  {leaderboard.length > 0 &&
                  metric !== CHALLENGE_TYPES.checkins ? (
                    <CompressedLeaderboard
                      data={leaderboard.slice(0, 5)}
                      metric={metric}
                      seeMore={this.viewLeaderboard}
                    />
                  ) : null}
                </View>
              </>
            )
          }
          data={feed}
          onEndReached={this.handleLoadMore}
          renderItem={({item}) => (
            <FeedCard
              type="post"
              navigation={this.props.navigation}
              data={item}
              challengeID={this.state.challengeId}
              refreshFeed={this.refreshFeed}
            />
          )}
          ListFooterComponent={
            this.state.isLoadingMore ? (
              <View>
                <ActivityIndicator size="large" />
              </View>
            ) : null
          }
        />
        <View>
          {!this.state.createPostVisible && !this.user.anonymous_profile ? (
            <View style={globalStyles.addButtonContainer}>
              <View>
                <TouchableOpacity
                  onPress={() => this.setState({createPostVisible: true})}
                  style={globalStyles.addButton}>
                  <AddIcon style={{height: 24, width: 24}} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* Adding a post to an challenge */}
          <Modal
            visible={this.state.createPostVisible}
            onRequestClose={() => this.setState({createPostVisible: false})}>
            <CreatePost
              type="challenge"
              id={this.state.challengeId}
              onClose={this.closePostView}
              refreshFeed={this.refreshFeed}
            />
          </Modal>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  iconView: {
    width: 16,
    height: 16,
  },
  badgeContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    top: -45,
    right: 25,
  },
  detailContainer: {
    paddingHorizontal: 20,
    top: -70,
  },
  detailBlock: {
    marginBottom: 15,
  },
  detailBlockIndent: {
    marginBottom: 15,
    width: '73%',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  userRankContainer: {
    borderTopColor: RWBColors.grey8,
    borderTopWidth: 1,
    borderBottomColor: RWBColors.grey8,
    borderBottomWidth: 1,
    paddingVertical: 10,
    marginBottom: 15,
  },
  rankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 40,
    alignItems: 'center',
  },
  leaderboardAvatar: {
    marginRight: 10,
    marginLeft: 20,
  },
  badgeImageLoaded: {
    width: 90,
    height: 90,
    borderRadius: 55,
    borderWidth: 5,
  },
  badgeImageStillLoading: {
    width: 90,
    height: 90,
    borderRadius: 55,
    borderWidth: 5,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
});
