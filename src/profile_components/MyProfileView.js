import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';

import NavigationService from '../models/NavigationService';
import ExpandingText from '../design_components/ExpandingText';
import RWBButton from '../design_components/RWBButton';
import {rwbApi} from '../../shared/apis/api';
import FeedCard from '../post_components/FeedCard';
import moment from 'moment';

// SVGs
import RWBMark from '../../svgs/RWBMark';

import globalStyles, {RWBColors} from '../styles';
import {userProfile} from '../../shared/models/UserProfile';
import {
  logAccessFollowers,
  logAccessFollowing,
} from '../../shared/models/Analytics';
import MetricsYTD from '../challenge_components/MetricsYTD';
import {PROFILE_TAB_LABELS} from '../../shared/constants/Labels';
import ChevronRightIcon from '../../svgs/ChevronRightIcon';
import ChallengeBadges from './ChallengeBadgesView';

export default class MyProfileView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      photoIsLoading: false,
      searchVisible: false,
      userFeed: [],
      refreshing: false,
      loadingMore: false,
      userBadges: [],
      userMetrics: {
        all_time_challenges_participated: 0,
        ytd_events_participated: 0,
        mtd_events_participated: 0,
      },
    };
    this.toggleEdit = this.toggleEdit.bind(this);
  }

  componentDidMount = () => {
    this.loadUserProfile();
  };

  loadUserProfile = () => {
    // clear out the userFeed to ensure cards get the reactions
    this.setState({
      refreshing: true,
      userFeed: [],
    });
    Promise.all([
      this.getFeed(userProfile.getUserProfile().id),
      this.getBadges(),
      this.getUserMetrics(),
    ])
      .then(([feed, badges, metrics]) => {
        this.setState({
          userFeed: feed.data.results,
          userBadges: badges.data.badges,
          userMetrics: metrics.data,
        });
      })
      .catch((error) => {
        console.warn('error loading profile: ', error);
        Alert.alert('Team RWB', 'There was an error loading profile.');
      })
      .finally(() => {
        this.setState({refreshing: false, isLoading: false});
      });
  };

  getFeed = () => {
    return rwbApi
      .getUserFeed(userProfile.getUserProfile().id)
      .then((result) => {
        return result;
      });
  };

  getBadges = () => {
    return rwbApi
      .getUserBadges(userProfile.getUserProfile().id)
      .then((result) => {
        return result;
      });
  };

  getUserMetrics = () => {
    return rwbApi.getUserMetrics().then((result) => {
      return result;
    });
  };

  loadMore = () => {
    if (!this.state.loadingMore) {
      const posts = this.state.userFeed;
      const lastPost = posts[posts.length - 1];
      this.setState({loadingMore: true});
      rwbApi
        .getUserFeed(userProfile.getUserProfile().id, lastPost.id)
        .then((result) => {
          if (result.data.results.length > 0)
            this.setState({
              userFeed: [...this.state.userFeed, ...result.data.results],
              loadingMore: false,
            });
          else this.setState({loadingMore: false});
        })
        .catch((error) => {
          console.warn('error getting feed: ', error);
          Alert.alert('Team RWB', 'There was an error retrieving your feed.');
          this.setState({refreshing: false});
        });
    }
  };

  toggleEdit() {
    this.props.onEdit();
  }

  render() {
    const {
      first_name,
      last_name,
      title,
      eagle_leader,
      profile_bio,
      military_branch,
      military_status,
      military_ets,
      military_specialty,
      military_rank,
    } = this.props.user;
    const {userFeed, userBadges, userMetrics} = this.state;
    return (
      <View style={styles.container}>
        {this.state.isLoading && (
          <View style={globalStyles.spinnerOverLay}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <FlatList
          ListHeaderComponent={
            <View>
              <View
                style={{borderBottomWidth: 1, borderColor: RWBColors.grey8}}>
                <View style={styles.contentWrapper}>
                  {/* Name and location */}
                  <View>
                    <Text style={globalStyles.h1}>
                      {first_name.toUpperCase()} {last_name.toUpperCase()}{' '}
                      {eagle_leader ? (
                        <RWBMark style={{width: 28, height: 14}} />
                      ) : null}
                    </Text>
                    <Text style={[globalStyles.h3, {}]}>
                      {this.props.userChapter.name}
                    </Text>
                    {eagle_leader ? (
                      <Text style={globalStyles.h5}>Eagle Leader</Text>
                    ) : null}
                  </View>
                  {/* Edit and followers */}
                  <View style={styles.editFollowerRow}>
                    <View>
                      <RWBButton
                        onPress={this.toggleEdit}
                        text={'Edit'}
                        buttonStyle="primary"
                        customStyles={{
                          paddingHorizontal: 60,
                          paddingVertical: 12,
                          marginBottom: 0,
                        }}
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        height: '100%',
                        alignItems: 'center',
                      }}>
                      <View>
                        <TouchableOpacity
                          onPress={() => {
                            logAccessFollowers();
                            NavigationService.navigate('FollowList', {
                              tab: 'followers',
                            });
                          }}>
                          <View style={{paddingHorizontal: 25}}>
                            <Text
                              style={[globalStyles.h2, {textAlign: 'center'}]}>
                              {this.props.followersAmount}
                            </Text>
                            <Text style={globalStyles.formLabel}>
                              followers
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={{
                          width: 2,
                          height: '100%',
                          backgroundColor: RWBColors.grey8,
                        }}
                      />
                      <View>
                        <TouchableOpacity
                          onPress={() => {
                            logAccessFollowing();
                            NavigationService.navigate('FollowList', {
                              tab: 'following',
                            });
                          }}>
                          <View style={{paddingHorizontal: 25}}>
                            <Text
                              style={[globalStyles.h2, {textAlign: 'center'}]}>
                              {this.props.followingAmount}
                            </Text>
                            <Text style={globalStyles.formLabel}>
                              following
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  {/* Rank and summary */}
                  <View>
                    <Text style={globalStyles.h2}>
                      {military_status}{' '}
                      {military_status !== 'Civilian'
                        ? `/ ${military_branch}`
                        : null}
                    </Text>
                    {/* {military_status === 'Veteran' ? (
                      <Text style={globalStyles.bodyCopyForm}>
                        ETS: {moment(military_ets).format('Y')}
                      </Text>
                    ) : null} */}
                    {/* {military_status !== 'Civilian'
                    ? <Text style={globalStyles.bodyCopyForm}>MOS: {military_specialty}</Text>
                    : null} */}
                    {/* {military_status !== 'Civilian' ? (
                      <Text style={globalStyles.bodyCopyForm}>
                        Rank: {military_rank}
                      </Text>
                    ) : null} */}
                    <View style={{marginVertical: 5}} />
                    <ExpandingText
                      numberOfLines={2}
                      truncatedFooter={
                        <Text style={globalStyles.link}>Show More...</Text>
                      }
                      revealedFooter={
                        <Text style={globalStyles.link}>Show Less</Text>
                      }>
                      <Text>{profile_bio}</Text>
                    </ExpandingText>
                  </View>
                  <View style={{marginTop: 5}}>
                    <TouchableOpacity
                      style={[styles.linkTextContainer, {marginBottom: 10}]}
                      onPress={() => {
                        NavigationService.navigate('MyProfileWorkoutLog');
                      }}>
                      <Text style={styles.linkText}>
                        {PROFILE_TAB_LABELS.EVENT_AND_WORKOUT_STATS}
                      </Text>
                      <View>
                        <ChevronRightIcon style={styles.iconView} />
                      </View>
                    </TouchableOpacity>
                    <MetricsYTD
                      expanded={true}
                      allTimeChallenges={
                        userMetrics.all_time_challenges_participated
                      }
                      yearToDateEvents={userMetrics.ytd_events_participated}
                      monthToDateEvents={userMetrics.mtd_events_participated}
                    />
                  </View>
                  <ChallengeBadges
                    userBadges={userBadges}
                    myProfile={true}
                    isLoading={this.state.isLoading}
                  />
                </View>
              </View>
              {this.state.refreshing ? (
                <ActivityIndicator animating size="large" />
              ) : null}
            </View>
          }
          onRefresh={this.loadUserProfile}
          refreshing={this.state.refreshing}
          onEndReached={this.loadMore}
          style={{
            flex: 1,
            height: '100%',
            width: '100%',
            backgroundColor: RWBColors.white,
          }}
          data={userFeed}
          keyExtractor={(item, index) => {
            return `${item.id}`;
          }}
          renderItem={({item}) => (
            <FeedCard
              eventID={item?.event?.id}
              navigation={this.props.navigation}
              data={item}
              type={item.object.split(':')[0]}
            />
          )}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  contentWrapper: {
    paddingHorizontal: '5%',
    width: '100%',
    flex: 1,
    marginBottom: 15,
  },
  profileImageView: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 25,
  },
  profileImage: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  uploadPhotoIconWrapper: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: RWBColors.white,
    width: 24,
    padding: 4,
    justifyContent: 'center',
  },
  iconView: {
    width: 16,
    height: 16,
  },
  spinnerOverLay: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  editFollowerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 24,
  },
  linkTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 11,
    lineHeight: 16,
    color: RWBColors.magenta,
  },
});
