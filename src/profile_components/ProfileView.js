import React from 'react';
import {
  View,
  StatusBar,
  ActivityIndicator,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  FlatList,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import {NavigationEvents} from 'react-navigation';
import NavigationService from '../models/NavigationService';
import ExpandingText from '../design_components/ExpandingText';
import RWBUserImages from '../design_components/RWBUserImages';
import FeedCard from '../post_components/FeedCard';

import globalStyles, {RWBColors} from '../styles';
import {rwbApi} from '../../shared/apis/api';

import ChevronBack from '../../svgs/ChevronBack';
import {userProfile} from '../../shared/models/UserProfile';
import RWBMark from '../../svgs/RWBMark';
import ReportIcon from '../../svgs/ReportIcon';
import FollowButton from '../design_components/FollowButton';
import moment from 'moment';
import {
  logAccessFollowers,
  logAccessFollowing,
} from '../../shared/models/Analytics';
import {REPORT_ERROR} from '../../shared/constants/ErrorMessages';
import ChallengeBadges from './ChallengeBadgesView';
import AndroidAction from '../design_components/AndroidActionSheet';
import RWBSheetButton from '../design_components/RWBSheetButton';

export default class ProfileView extends React.Component {
  constructor(props) {
    super(props);
    this.loggedInUser = userProfile.getUserProfile();
    this.state = {
      isLoading: false,
      isFollowing: false, // server code to see if hte person is being followed
      followsCurrentUser: false,
      first_name: '',
      last_name: '',
      chapter: '',
      title: '',
      military_branch: '',
      military_rank: '',
      military_specialty: '',
      military_status: '',
      profile_bio: '',
      cover_photo: '',
      profile_photo: '',
      followingAmount: undefined,
      followersAmount: undefined,
      loadingMore: false,
      userBadges: [],
      actionSheetVisible: false,
    };
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      NavigationService.popStack();
      return true;
    });
    this.loadUser();
  }

  loadUser = () => {
    this.setState({isLoading: true});
    this.userID = this.props.navigation.getParam('id', null);
    Promise.all([
      this.retrieveUser(),
      this.getUsersFollowSummary(),
      this.getFollowingRelations(),
      this.getBadges(),
    ])
      .then(([user, summary, relations, badges]) => {
        this.setState({
          is_eagle_leader: user.eagle_leader,
          cover_photo: user.cover_photo_url,
          profile_photo: user.profile_photo_url,
          first_name: user.first_name,
          last_name: user.last_name,
          chapter: user.preferred_chapter.name,
          military_branch: user.military_branch,
          military_status: user.military_status,
          military_ets: user.military_ets,
          military_rank: user.military_rank,
          profile_bio: user.profile_bio,
          followingAmount: summary.following,
          followersAmount: summary.followers,
          isFollowed: relations.isFollowed,
          isFollowing: relations.isFollowing,
          isLoading: false,
          anonymous_profile: user.anonymous_profile,
          userBadges: badges.data.badges,
        });
        if (user.anonymous_profile)
          Alert.alert(
            'Team RWB',
            'This user has set their profile to private.',
          );
        else {
          this.getFeed()
            .then((feed) => {
              this.setState({userFeed: feed});
            })
            .catch((err) => {
              Alert.alert('Team RWB', 'Error retrieving the user feed');
            });
        }
      })
      .catch((error) => {
        console.warn(error);
        this.setState({isLoading: false});
        if (error.toString().includes('403')) {
          Alert.alert(
            'Team RWB',
            'This user has set their profile to private.',
            [
              {onPress: () => this.props.navigation.pop()}, //this makes non eagle leaders viewing an anonymous profile go back
            ],
          );
        } else
          Alert.alert('Team RWB', 'There was an error retrieving the user.');
      });
  };

  componentWillUnmount() {
    this.backHandler.remove();
  }

  getUsersFollowSummary = () => {
    return rwbApi.getFollowSummary(this.userID);
  };

  // see if this profile is following the logged in user
  getFollowerRelationship = () => {
    return rwbApi
      .getFollowingRelationships(this.userID, this.loggedInUser.id)
      .then((isFollowed) => {
        return isFollowed;
      });
  };

  // see if the logged in user is following this profile
  getFollowingRelationship = () => {
    return rwbApi
      .getFollowingRelationships(this.loggedInUser.id, this.userID)
      .then((isFollowing) => {
        return isFollowing;
      });
  };

  getFollowingRelations = () => {
    return Promise.all([
      this.getFollowerRelationship(),
      this.getFollowingRelationship(),
    ])
      .then((result) => {
        return {isFollowed: result[0], isFollowing: result[1]};
      })
      .catch((error) => {
        console.warn(error);
      });
  };

  retrieveUser = () => {
    return rwbApi.getUserByID(this.userID);
  };

  getFeed = () => {
    return rwbApi
      .getUserFeed(this.userID)
      .then((result) => {
        if (result.data) {
          return result.data.results;
        }
        return [];
      })
      .catch((error) => {
        console.warn('error getting feed: ', error);
      });
  };

  getBadges = () => {
    return rwbApi.getUserBadges(this.userID).then((result) => {
      return result;
    });
  };

  updateFollowState = () => {
    const {isFollowing, followersAmount} = this.state;
    this.setState({isLoading: true});
    if (isFollowing) {
      rwbApi
        .unfollowUser(this.userID)
        .then((result) => {
          this.setState({
            isFollowing: false,
            followersAmount: followersAmount - 1,
          });
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({isLoading: false});
        });
    } else {
      rwbApi
        .followUser(this.userID)
        .then((result) => {
          this.setState({
            isFollowing: true,
            followersAmount: followersAmount + 1,
          });
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({isLoading: false});
        });
    }
  };

  // Always pop the stack (reset it), and then navigate to the appropriate tab when provided
  handleBack = () => {
    const initialTab = this.props.navigation.getParam('initial', null);
    NavigationService.popStack();
    if (initialTab) NavigationService.navigate(initialTab);
  };

  loadMore = () => {
    if (!this.state.loadingMore) {
      const posts = this.state.userFeed;
      const lastPost = posts[posts.length - 1];
      this.setState({loadingMore: true});
      rwbApi
        .getUserFeed(this.userID, lastPost.id)
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

  reportUser = () => {
    this.setState({actionSheetVisible: false});
    Alert.alert('Team RWB', 'Are you sure you want to report this user?', [
      {
        text: 'Cancel',
        style: 'destructive',
      },
      {
        text: 'Yes',
        onPress: () => {
          const reporterID = JSON.stringify({reporter: this.loggedInUser.id});
          rwbApi
            .reportUser(this.userID, reporterID)
            .then(() => {
              Alert.alert('Team RWB', 'Your report has been sent', [
                {
                  text: 'Ok',
                },
              ]);
            })
            .catch((err) => {
              Alert.alert('Team RWB', REPORT_ERROR);
              console.warn(err);
            });
        },
      },
    ]);
  };

  blockUser = () => {
    this.setState({actionSheetVisible: false});
    Alert.alert('Team RWB', 'Are you sure you want to block this user?', [
      {
        text: 'Cancel',
        style: 'destructive',
      },
      {
        text: 'Yes',
        onPress: () => {
          rwbApi
            .blockUser(this.userID)
            .then(() => {
              Alert.alert(
                'Team RWB',
                'You have successfully blocked this user.',
                [
                  {
                    text: 'Ok',
                  },
                ],
              );
            })
            .catch((err) => {
              Alert.alert(
                'Team RWB',
                'There was an error blocking this user. Please try again later.',
              );
              console.warn(err);
            });
        },
      },
    ]);
  };

  render() {
    const {
      isLoading,
      first_name,
      last_name,
      chapter,
      title,
      is_eagle_leader,
      military_branch,
      military_rank,
      military_specialty,
      military_status,
      military_ets,
      profile_bio,
      cover_photo,
      profile_photo,
      userFeed,
      followersAmount,
      followingAmount,
      isFollowed,
      isFollowing,
      userBadges,
    } = this.state;
    return (
      <View style={{flex: 1}}>
        <SafeAreaView style={{flex: 0, backgroundColor: RWBColors.magenta}} />
        <SafeAreaView style={styles.masterContainer}>
          <NavigationEvents />
          <StatusBar
            barStyle="light-content"
            animated={true}
            translucent={false}
            backgroundColor={RWBColors.magenta}
          />
          {isLoading ? (
            <View style={globalStyles.spinnerOverLay}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <FlatList
              ListHeaderComponent={
                <View
                  style={{borderBottomWidth: 1, borderColor: RWBColors.grey8}}>
                  {
                    this.state.actionSheetVisible ? (
                      Platform.OS === 'ios' ? (
                        ActionSheetIOS.showActionSheetWithOptions(
                          {
                            options: ['Cancel', 'Block User', 'Report User'],
                            cancelButtonIndex: 0,
                            destructiveButtonIndex: 2,
                          },
                          (buttonIndex) => {
                            if (buttonIndex === 1) {
                              this.setState({actionSheetVisible: false});
                              this.blockUser();
                            } else if (buttonIndex === 2) {
                              this.reportUser();
                              this.setState({actionSheetVisible: false});
                            } else {
                              // clicking either cancel OR off the screen
                              // this prevents issues where other clickable interactions bring the overlay back up
                              this.setState({actionSheetVisible: false});
                            }
                          },
                        )
                      ) : (
                        <AndroidAction
                          cancelable={true}
                          hide={() =>
                            this.setState({actionSheetVisible: false})
                          }>
                          {
                            <>
                              <RWBSheetButton
                                text={'Block User'}
                                onPress={this.blockUser}
                              />
                              <RWBSheetButton
                                text={'Report User'}
                                onPress={this.reportUser}
                              />
                            </>
                          }
                        </AndroidAction>
                      )
                    ) : null // not toggled
                  }
                  <View>
                    <TouchableOpacity
                      style={styles.backIconContainer}
                      onPress={this.handleBack}>
                      <ChevronBack
                        tintColor={RWBColors.magenta}
                        style={globalStyles.chevronBackImage}
                      />
                    </TouchableOpacity>
                    {this.loggedInUser.id !== parseInt(this.userID) ? (
                      <TouchableOpacity
                        style={styles.reportIconContainer}
                        accessible={true}
                        accessibilityLabel={'Report or Block User'}
                        accessibilityRole={'button'}
                        onPress={() =>
                          this.setState({actionSheetVisible: true})
                        }>
                        <ReportIcon width="24" height="24" />
                      </TouchableOpacity>
                    ) : null}
                    <RWBUserImages
                      coverPhoto={cover_photo}
                      profilePhoto={profile_photo}
                    />
                  </View>
                  <View style={styles.childContainer}>
                    <View>
                      <View style={styles.contentWrapper}>
                        {/* Name and location */}
                        <View>
                          <View style={{flexDirection: 'row', marginTop: 10}}>
                            <View style={{flex: 1}}>
                              <Text style={globalStyles.h1}>
                                {first_name.toUpperCase()}{' '}
                                {last_name.toUpperCase()}{' '}
                                {is_eagle_leader ? (
                                  <RWBMark style={{width: 28, height: 14}} />
                                ) : null}{' '}
                              </Text>
                              {isFollowed ? (
                                <Text style={[globalStyles.h5, {marginTop: 4}]}>
                                  follows you
                                </Text>
                              ) : null}
                            </View>
                          </View>
                          <Text style={[globalStyles.h3, {}]}>{chapter}</Text>
                          {is_eagle_leader ? (
                            <View>
                              <Text style={[globalStyles.h5, {}]}>
                                Eagle Leader
                              </Text>
                              {/* title does not appear to be in the design */}
                              {/* <Text style={[globalStyles.h5, {  }]}>{title}</Text> */}
                            </View>
                          ) : null}
                        </View>
                        {/* Edit and followers */}
                        <View style={styles.followerRow}>
                          {/* Hide following self button. Currently not the best visually. */}
                          {this.loggedInUser.id !== parseInt(this.userID) &&
                          !this.state.anonymous_profile ? (
                            <FollowButton
                              onPress={this.updateFollowState}
                              isFollowing={isFollowing}
                              name={`${first_name} ${last_name}`}
                              width={144}
                            />
                          ) : (
                            <View style={{width: 144}} />
                          )}
                          <View
                            style={{
                              flexDirection: 'row',
                              height: '100%',
                              alignItems: 'center',
                            }}>
                            <View>
                              {/* Will be a different navigation list/screen, as this would navigate to the logged in users' following list */}
                              <TouchableOpacity
                                onPress={() => {
                                  logAccessFollowers();
                                  NavigationService.navigate('FollowList', {
                                    tab: 'followers',
                                    id: this.userID,
                                  });
                                }}>
                                <View style={{paddingHorizontal: 25}}>
                                  <Text
                                    style={[
                                      globalStyles.h2,
                                      {textAlign: 'center'},
                                    ]}>
                                    {followersAmount}
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
                                    id: this.userID,
                                  });
                                }}>
                                <View style={{paddingHorizontal: 25}}>
                                  <Text
                                    style={[
                                      globalStyles.h2,
                                      {textAlign: 'center'},
                                    ]}>
                                    {followingAmount}
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
                        <View style={{marginVertical: 5}}>
                          {military_status ? (
                            <Text style={globalStyles.h2}>
                              {military_status}{' '}
                              {military_status !== 'Civilian'
                                ? `/ ${military_branch}`
                                : null}
                            </Text>
                          ) : null}

                          {/* {military_status === 'Veteran' && military_ets ? (
                            <Text style={globalStyles.bodyCopyForm}>
                              ETS: {moment(military_ets).format('Y')}
                            </Text>
                          ) : null} */}
                          {/* {military_status !== 'Civilian'
                          ? <Text style={globalStyles.bodyCopyForm}>MOS: {military_specialty}</Text>
                          : null} */}
                          {/* {military_status !== 'Civilian' && military_rank ? (
                            <Text style={globalStyles.bodyCopyForm}>
                              Rank: {military_rank}
                            </Text>
                          ) : null} */}
                          <View style={{marginVertical: 5}} />
                          <ExpandingText
                            numberOfLines={2}
                            truncatedFooter={
                              <Text style={globalStyles.link}>
                                Show More...
                              </Text>
                            }
                            revealedFooter={
                              <Text style={globalStyles.link}>Show Less</Text>
                            }>
                            <Text style={globalStyles.bodyCopy}>
                              {profile_bio}
                            </Text>
                          </ExpandingText>
                        </View>
                        <ChallengeBadges
                          userBadges={userBadges}
                          myProfile={false}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              }
              data={this.state.userFeed}
              renderItem={({item}) => (
                <FeedCard data={item} type={item.object.split(':')[0]} />
              )}
              onEndReached={this.loadMore}
            />
          )}
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  masterContainer: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: RWBColors.white,
  },
  contentWrapper: {
    width: '100%',
    flex: 1,
    marginBottom: 15,
  },
  childContainer: {
    paddingHorizontal: '5%',
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    marginTop: 30,
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
  backIconContainer: {
    position: 'absolute',
    top: 10,
    left: '5%',
    zIndex: 2,
    backgroundColor: RWBColors.whiteOpacity85,
    height: 34,
    width: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportIconContainer: {
    position: 'absolute',
    top: 10,
    right: '5%',
    zIndex: 2,
    backgroundColor: RWBColors.whiteOpacity85,
    height: 34,
    width: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followerRow: {
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
