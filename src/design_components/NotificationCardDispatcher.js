import React, {Component} from 'react';
import {View, Text, Alert, Dimensions} from 'react-native';
import NotificationCard from './NotificationCard';
import NavigationService from '../models/NavigationService';
import {howLongAgo} from '../../shared/utils/Helpers';
import FollowButton from './FollowButton';
import globalStyles, {RWBColors} from '../styles';
import {userProfile} from '../../shared/models/UserProfile';
import {rwbApi} from '../../shared/apis/api';
import {logAccessNotification} from '../../shared/models/Analytics';

export default class NotificationCardDispatcher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
      isFollowing: this.props.data.is_following || null,
    };
    this.currentUser = userProfile.getUserProfile();
  }

  dispatchedOnPress = () => {
    const data = this.state.data;
    // actor_user.id or user.id could be null because of a deleted account
    if (
      (!data.actor_user?.id &&
        (data.verb === 'follow' || data.verb === 'tag')) ||
      (!data.user?.id &&
        (data.verb === 'update' ||
          data.verb === 'cancel' ||
          data.verb === 'like' ||
          data.verb === 'comment' ||
          data.verb === 'replied' ||
          data.verb === 'post'))
    ) {
      return;
    }
    logAccessNotification();
    if (data.verb === 'follow') {
      // going to have to add a notification stack or make some changes (or not do infinite nav stack...?)
      return NavigationService.navigateIntoInfiniteStack(
        'MyProfileProfileAndEventDetailsStack',
        'profile',
        {id: data.actor_user.id},
      );
    }
    // both update and cancel navigate to an event
    else if (data.verb === 'update' || data.verb === 'cancel') {
      // Do infinite nav stack...? (currently not the correct stack)
      return NavigationService.navigate(
        'EventView',
        {value: {event: {id: data.event.id}}}, // not sure if this is how the data will be received
      );
    } else if (
      data.verb === 'like' ||
      data.verb === 'comment' ||
      data.verb === 'replied'
    ) {
      return NavigationService.navigate('Post', {
        poster: this.currentUser,
        streamID: data.object.split(':')[1],
        time: data.time,
        postID: data.id,
        previousScreen: 'notifications',
      });
    } else if (data.verb === 'tag') {
      if (data.event_id) {
        return NavigationService.navigate('EventView', {
          id: data.event_id,
        });
      }
      return NavigationService.navigate('Post', {
        poster: data.comment_id ? {id: data.author_id} : data.actor_user,
        streamID: data.post_id,
        time: data.time,
        postID: data.id,
        previousScreen: 'notifications',
      });
    } else if (data.verb === 'post') {
      return NavigationService.navigate('Post', {
        poster: data.user,
        streamID: data.post_id,
        time: data.time,
        postID: data.id,
        previousScreen: 'notifications',
      });
    }
  };

  dispatchedOnPressLabel = () => {
    const data = this.state.data;
    if (data.verb === 'follow') {
      // Need check on if following or not
      return `Follow/Unfollow ${data.actor_user.first_name} ${data.actor_user.last_name}`;
    } else if (
      data.verb === 'update' ||
      data.verb === 'cancel' ||
      data.verb === 'post'
    ) {
      return `Navigate to ${data.event.name}`;
    } else if (data.verb === 'like' || data.verb === 'replied') {
      return `View the post that ${data.actor.first_name} ${
        data.actor.last_name
      } ${data.verb === 'like' ? 'liked' : 'replied to'}`;
    } else if (data.verb === 'tag') {
      return `View the post that ${data.actor_user.first_name} ${data.actor_user.last_name} mentioned you on`;
    }
  };

  dispatchedText = () => {
    const data = this.state.data;
    const actorUserName = data.actor_user?.first_name
      ? `${data.actor_user.first_name} ${data.actor_user.last_name}`
      : 'Deleted Member';
    const userName = data.user?.first_name
      ? `${data.user.first_name} ${data.user.last_name}`
      : 'Deleted Member';
    if (data.verb === 'follow') {
      return (
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View
            style={{
              width: Dimensions.get('window').width * 0.9 - 165,
              justifyContent: 'center',
            }}>
            <Text style={[globalStyles.bodyCopy, {paddingBottom: 0}]}>
              <Text style={globalStyles.h3}>{actorUserName} </Text>
              started following you &middot; {howLongAgo(data.time)}
            </Text>
          </View>
          {data.actor_user.public_profile ? (
            <FollowButton
              onPress={() => this.updateFollowState(data.actor_user)}
              isFollowing={this.state.isFollowing}
            />
          ) : (
            // empty view to help keep positioning
            <View style={{width: 144}} />
          )}
        </View>
      );
    }
    // update and cancel are basically the same, minus the verb usage
    else if (
      data.verb === 'update' ||
      data.verb === 'cancel' ||
      data.verb === 'post'
    ) {
      let message;
      if (data.verb !== 'post') {
        message = data.verb === 'update' ? 'updated' : 'canceled';
        message += ' the event';
      } else {
        message = 'posted on your event';
      }
      return (
        <Text style={globalStyles.bodyCopy}>
          <Text style={globalStyles.h3}>{userName} </Text>
          {`${message} `}
          <Text style={globalStyles.h3}>{data.event.name}</Text> &middot;{' '}
          {howLongAgo(data.time)}
        </Text>
      );
    } else if (data.verb === 'like' || data.verb === 'comment') {
      return (
        <Text style={globalStyles.bodyCopy}>
          <Text style={globalStyles.h3}>{userName} </Text>
          {data.verb === 'like' ? 'liked' : 'commented on'} your post &middot;{' '}
          {howLongAgo(data.time)}
        </Text>
      );
    } else if (data.verb === 'tag') {
      const type = data.comment_id ? 'comment' : 'post';
      let mentionText;
      if (data.event_id) mentionText = 'on an event';
      else if (data.group_id) mentionText = 'in a group';
      else mentionText = `in a ${type}`;
      return (
        <Text style={globalStyles.bodyCopy}>
          <Text style={globalStyles.h3}>{actorUserName} </Text>
          mentioned you {mentionText + ' '}
          &middot; {howLongAgo(data.time)}
        </Text>
      );
    } else {
    }
  };

  // Only used if the verb is follow
  updateFollowState = (user) => {
    const isFollowing = this.state.isFollowing;
    if (isFollowing) {
      this.setState({isFollowing: false});
      rwbApi
        .unfollowUser(user.id)
        .then(() => {})
        .catch((error) => {
          this.setState({isFollowing: true});
          Alert.alert(
            'Team RWB',
            'Error unfollowing user, please try again later.',
          );
          console.error(error);
        })
        .finally(() => {
          this.setState({isLoading: false});
        });
    } else {
      this.setState({isFollowing: true});
      rwbApi
        .followUser(user.id)
        .then(() => {})
        .catch((error) => {
          this.setState({isFollowing: false});
          Alert.alert(
            'Team RWB',
            'Error following user, please try again later.',
          );
          console.error(error);
        })
        .finally(() => {
          this.setState({isLoading: false});
        });
    }
  };

  render() {
    return (
      <NotificationCard
        userIcon={
          this.state.data.actor_user
            ? this.state.data.actor_user.profile_photo_url
            : this.state.data.user.profile_photo_url
        }
        text={this.dispatchedText()}
        onPress={() => this.dispatchedOnPress()}
        accessibilityLabel={this.dispatchedOnPressLabel()}
      />
    );
  }
}
