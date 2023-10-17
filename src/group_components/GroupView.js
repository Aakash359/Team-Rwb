import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import ExpandingText from '../design_components/ExpandingText';
import NavigationService from '../models/NavigationService';
import {rwbApi} from '../../shared/apis/api';
import globalStyles, {RWBColors} from '../styles';
import {capitalizeFirstLetter, putUserFirst} from '../../shared/utils/Helpers';
import FullscreenSpinner from '../design_components/FullscreenSpinner';
import UserBadgesContainer from '../event_components/UserBadgesContainer';
import {isDev} from '../../shared/utils/IsDev';
import RWBButton from '../design_components/RWBButton';
import {userProfile} from '../../shared/models/UserProfile';
import FooterSpinner from '../design_components/FooterSpinner';
import {GROUP_FEED_ERROR} from '../../shared/constants/ErrorMessages';
import CreatePost from '../post_components/CreatePostView';

// SVGS
import ChevronBack from '../../svgs/ChevronBack';
import ShareIcon from '../../svgs/ShareIcon';
import CheckIcon from '../../svgs/CheckIcon';
import ProfileIcon from '../../svgs/MyProfileIcon';
import HeartIcon from '../../svgs/LikeIcon';
import EventsIcon from '../../svgs/EventsIcon';
import AddIcon from '../../svgs/AddIcon';
import FeedCard from '../post_components/FeedCard';

const COVER_HEIGHT = (Dimensions.get('window').width * 2) / 3;
export default class GroupView extends Component {
  constructor(props) {
    super(props);
    this.updateJoined = this.props.navigation.getParam('updateJoined', null);
    this.updateFavorited = this.props.navigation.getParam(
      'updateFavorited',
      null,
    );
    this.group_id = this.props.navigation.getParam('group_id', null);
    this.state = {
      isLoading: true,
      refreshing: false,
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
      groupFeed: [],
      createPostVisible: false,
      isLoadingMore: false,
      retrievedLastPost: false,
      createPostVisible: false,
      activeGroup: true,
      groupLat: '',
      groupLong: '',
      groupLink: isDev()
        ? `https://members-staging.teamrwb.org/groups/${this.group_id}`
        : `https://members.teamrwb.org/groups/${this.group_id}`,
      joinStatusChanging: false,
    };
  }

  componentDidMount = () => {
    this.loadGroupAndFeed();
  };

  loadGroupAndFeed = () => {
    if (!this.state.isLoading) this.setState({refreshing: true, groupFeed: []});
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
          joinedGroup: groupResult.joined,
          groupLat: groupResult.location.latitude,
          groupLong: groupResult.location.longitude,
          activeGroup: groupResult.chapter_active,
          isLoading: false,
          refreshing: false,
          groupFeed: feedResult,
          retrievedLastPost: feedResult.length !== 10,
        });
      },
    );
  };

  loadGroup = () => {
    return rwbApi
      .getGroup(this.group_id)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        Alert.alert(
          'Team RWB',
          'Unable to load the group. Please try again later.',
        );
        this.props.navigation.goBack();
      });
  };

  getFeed = () => {
    return rwbApi
      .getGroupFeed(this.group_id)
      .then((result) => {
        return result.data.results;
      })
      .catch((err) => {
        Alert.alert('Team RWB', GROUP_FEED_ERROR);
      });
  };

  refreshFeed = () => {
    this.getFeed().then((result) => {
      this.setState({groupFeed: result});
    });
  };

  changeJoinStatus = () => {
    // only able to change the join/leave if one status is not currently changing
    if (!this.state.joinStatusChanging) {
      if (this.state.joinedGroup) this.leaveGroup();
      else this.joinGroup();
    }
  };

  joinGroup = () => {
    this.userJoined();
    this.setState({joinStatusChanging: true});
    rwbApi
      .joinGroup(this.group_id)
      .then(() => {
        this.updateJoined();
        this.setState({joinStatusChanging: false});
      })
      .catch((err) => {
        this.userLeft();
        this.setState({joinStatusChanging: false});
        Alert.alert(
          'Team RWB',
          'Unable to join the group at this time. Please try again later',
        );
      });
  };

  leaveGroup = () => {
    this.userLeft();
    this.setState({joinStatusChanging: true});
    rwbApi
      .leaveGroup(this.group_id)
      .then(() => {
        this.updateJoined();
        this.setState({joinStatusChanging: false});
      })
      .catch((err) => {
        this.userJoined();
        this.setState({joinStatusChanging: false});
        Alert.alert(
          'Team RWB',
          'Unable to leave the group at this time. Please try again later',
        );
      });
  };

  changeFavoriteStatus = () => {
    // this.setState({favoritedGroup: !this.state.favoritedGroup});
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

  handleLoadMore = () => {
    if (!this.state.isLoadingMore && !this.state.retrievedLastPost) {
      this.setState({isLoadingMore: true});
      const lastPost = this.state.groupFeed[this.state.groupFeed.length - 1].id;
      rwbApi
        .getGroupFeed(this.group_id, lastPost)
        .then((result) => {
          this.setState({
            groupFeed: [...this.state.groupFeed, ...result.data.results],
            isLoadingMore: false,
            retrievedLastPost: result.data.results.length !== 10,
          });
        })
        .catch((err) => {
          Alert.alert('Team RWB', GROUP_FEED_ERROR);
        });
    }
  };

  closePostView = (updated) => {
    this.setState({createPostVisible: false});
    if (updated) this.refreshFeed();
  };

  render() {
    const {
      isLoading,
      photo_url,
      name,
      type,
      description,
      joinedGroup,
      favoritedGroup,
      sponsored_photo_url,
    } = this.state;
    return (
      <View style={{backgroundColor: RWBColors.white, flex: 1}}>
        <FlatList
          refreshing={this.state.refreshing}
          onRefresh={this.loadGroupAndFeed}
          ListHeaderComponent={
            <View
              style={{
                borderBottomColor: RWBColors.grey20,
                borderBottomWidth: 1,
              }}
              showsVerticalScrollIndicator={false}
              alwaysBounceVertical={false}>
              {isLoading && !this.state.refreshing ? (
                <FullscreenSpinner />
              ) : (
                <View style={{paddingBottom: '5%'}}>
                  {/* Cover Image */}
                  <View>
                    <TouchableOpacity
                      style={globalStyles.coverBackButton}
                      accessibilityRole={'button'}
                      accessible={true}
                      accessibilityLabel={'Go back to group list.'}
                      onPress={NavigationService.back}>
                      <ChevronBack
                        tintColor={RWBColors.magenta}
                        style={globalStyles.chevronBackImage}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={globalStyles.coverShareButton}
                      onPress={() => {
                        const {name} = this.state;
                        Share.share(
                          {
                            message:
                              Platform.OS === 'ios'
                                ? name
                                : this.state.groupLink,
                            title: 'Share This Group',
                            url: this.state.groupLink,
                          },
                          {
                            dialogTitle: 'Share This Group',
                          },
                        );
                      }}
                      accessibilityRole={'button'}
                      accessible={true}
                      accessibilityLabel={'Share this group.'}>
                      <ShareIcon
                        tintColor={RWBColors.magenta}
                        style={styles.iconView}
                      />
                    </TouchableOpacity>
                    <Image
                      style={{
                        width: '100%',
                        height: COVER_HEIGHT,
                      }}
                      source={photo_url ? {uri: photo_url} : null}
                    />
                    <View style={styles.sponsoredIconContainer}>
                      <Image
                        style={styles.sponsoredIcon}
                        // all sponsored groups will have a photo, and only sponsored groups will have a photo
                        source={
                          sponsored_photo_url
                            ? {uri: sponsored_photo_url}
                            : null
                        }
                      />
                    </View>
                  </View>
                  {/* Under Image */}
                  <View style={{padding: '5%'}}>
                    <Text style={globalStyles.h1}>{name}</Text>
                    <Text style={globalStyles.h5}>
                      {capitalizeFirstLetter(type)} Group
                    </Text>
                    {/* Join/Favorite buttons */}
                    <View
                      style={{
                        marginTop: 20,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      {/* favorite and join button */}
                      <View
                        style={{flexDirection: 'row', flex: 1, marginRight: 6}}>
                        {/* <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`${
                          favoritedGroup ? 'Unfavorite' : 'Favorite'
                        } Group`}
                        onPress={() => this.changeFavoriteStatus()}
                        style={[
                          styles.favoriteButton,
                          styles.relationButton,
                          {
                            backgroundColor: favoritedGroup
                              ? RWBColors.magenta
                              : RWBColors.grey40,
                          },
                        ]}>
                        <HeartIcon
                          style={styles.iconView}
                          tintColor={
                            favoritedGroup ? RWBColors.white : RWBColors.grey80
                          }
                          strokeColor={
                            favoritedGroup ? RWBColors.white : RWBColors.grey80
                          }
                        />
                      </TouchableOpacity> */}
                        <RWBButton
                          disabled={
                            this.state.joinStatusChanging ||
                            (!this.state.activeGroup && !joinedGroup)
                          }
                          onPress={() => this.changeJoinStatus()}
                          accessibilityLabel={`${
                            joinedGroup ? 'Unjoin' : 'Join'
                          } Group`}
                          text={joinedGroup ? 'Joined' : 'Join'}
                          buttonStyle={joinedGroup ? 'primary' : 'secondary'}
                          customStyles={[
                            joinedGroup
                              ? styles.joinedButton
                              : styles.unjoinedButton,
                            {
                              height: 40,
                              padding: 0,
                              justifyContent: 'center',
                              opacity:
                                this.state.joinStatusChanging ||
                                (!this.state.activeGroup && !joinedGroup)
                                  ? 0.5
                                  : 1,
                            },
                          ]}>
                          {joinedGroup ? (
                            <CheckIcon
                              style={styles.iconView}
                              color={RWBColors.white}
                            />
                          ) : (
                            <ProfileIcon
                              style={styles.iconView}
                              tintColor={RWBColors.grey80}
                              filledIcon={true}
                            />
                          )}
                        </RWBButton>
                      </View>
                      <RWBButton
                        buttonStyle="primary"
                        customStyles={styles.eventButton}
                        text={`${this.state.eventCount} ${
                          this.state.eventCount === 1 ? 'Event' : 'Events'
                        }`}
                        onPress={() => {
                          this.props.navigation.navigate('GroupEventList', {
                            name: this.state.name,
                            group_id: this.group_id,
                            groupType: type,
                            groupLat: this.state.groupLat,
                            groupLong: this.state.groupLong,
                            joinedGroup: this.state.joinedGroup,
                          });
                        }}>
                        <EventsIcon
                          style={styles.iconView}
                          tintColor={RWBColors.white}
                          filledIcon={true}
                        />
                      </RWBButton>
                    </View>
                    <View style={{marginTop: 10}}>
                      <UserBadgesContainer
                        usersLoading={false}
                        onPress={() =>
                          this.props.navigation.navigate('GroupMemberList', {
                            groupName: name,
                            groupId: this.group_id,
                            groupType: type,
                          })
                        }
                        numberOfUsers={this.state.memberCount}
                        userList={[...this.state.members]}
                        text="Members"
                      />
                      <ExpandingText
                        numberOfLines={2}
                        truncatedFooter={
                          <Text style={globalStyles.link}>Show More...</Text>
                        }
                        revealedFooter={
                          <Text style={globalStyles.link}>Show Less</Text>
                        }>
                        <Text>{description}</Text>
                      </ExpandingText>
                    </View>
                  </View>
                </View>
              )}
              {/*
                Look into custom modal/how it is used elsewhere
                does not work immediately
              */}
            </View>
          }
          data={this.state.groupFeed}
          renderItem={({item}) => (
            <FeedCard
              data={item}
              type={'group'}
              refreshFeed={this.refreshFeed}
            />
          )}
          onEndReached={this.handleLoadMore}
          ListFooterComponent={this.state.isLoadingMore && <FooterSpinner />}
        />
        {!userProfile.getUserProfile().anonymous_profile &&
        this.state.joinedGroup &&
        this.state.activeGroup ? (
          <View style={globalStyles.addButtonContainer}>
            <TouchableOpacity
              style={globalStyles.addButton}
              onPress={() => this.setState({createPostVisible: true})}>
              <AddIcon style={{width: 24, height: 24}} />
            </TouchableOpacity>
            <Modal
              visible={this.state.createPostVisible}
              onRequestClose={() => this.setState({createPostVisible: false})}>
              <CreatePost
                type="group"
                onClose={this.closePostView}
                id={this.group_id}
                refreshFeed={this.refreshFeed}
              />
            </Modal>
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  iconView: {
    width: 16,
    height: 16,
  },
  joinedButton: {
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    backgroundColor: RWBColors.magenta,
    flex: 2,
  },
  unjoinedButton: {
    borderTopRightRadius: 3,
    borderTopLeftRadius: 3,
    borderBottomRightRadius: 3,
    borderBottomLeftRadius: 3,
    flex: 2,
  },
  favoriteButton: {
    flex: 1,
    borderRightColor: RWBColors.white,
    borderRightWidth: 1,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  relationButton: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventButton: {
    height: 40,
    padding: 0,
    justifyContent: 'center',
    flex: 1,
    marginLeft: 6,
    borderRadius: 3,
  },
  sponsoredIconContainer: {
    top: COVER_HEIGHT - 40,
    position: 'absolute',
    right: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  sponsoredIcon: {
    height: 80,
    width: 80,
    borderRadius: 5,
  },
});
