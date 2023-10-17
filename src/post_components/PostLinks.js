import React, {Component} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import AggregatedPostTitle from './AggregatedPostTitle';
import NavigationService from '../models/NavigationService';
import {howLongAgo} from '../../shared/utils/Helpers';
import globalStyles, {RWBColors} from '../styles';
import EagleLeaderIcon from '../../svgs/EagleLeaderIcon';
import AdminIcon from '../../svgs/AdminIcon';

// Shared clickable texts that link to the appropriate group/event for post titles

const navLink = (name, navEvent) => {
  return (
    <Text
      accessibilityRole={'button'}
      accessible={true}
      accessibilityLabel={`Visit ${name}'s Page`}
      onPress={navEvent}
      style={globalStyles.h3}>
      {'\u25B6\uFE0E '}
      {name}
    </Text>
  );
};

class EventLink extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const event = this.props.event;
    const navEvent = () =>
      NavigationService.navigateIntoInfiniteStack(
        'EventsProfileAndEventDetailsStack',
        'event',
        {
          id: event.id,
        },
      );
    return navLink(event.name, navEvent);
  }
}

class GroupLink extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {group} = this.props;
    const navEvent = () =>
      NavigationService.navigate('GroupView', {
        group_id: group.id,
      });
    return navLink(group.name, navEvent);
  }
}

class ChallengeLink extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {challenge} = this.props;
    const navEvent = () =>
      NavigationService.navigate('ChallengeView', {
        challengeId: challenge.id,
      });
    return navLink(challenge.name, navEvent);
  }
}

class NameLink extends Component {
  constructor(props) {
    super(props);
  }

  getCurrentStack = () => {
    // choose the stack based off the current tab
    const curView = NavigationService.getCurrentTab();
    if (curView === 'Groups') return 'GroupProfileAndEventDetailsStack';
    else if (curView === 'Events') return 'EventsProfileAndEventDetailsStack';
    else if (curView === 'Challenges')
      return 'ChallengeProfileAndEventDetailsStack';
    else if (curView === 'My Profile')
      return 'MyProfileProfileAndEventDetailsStack';
    // no real point to navigate to your own profile from my profile, but it is doable
    else return 'FeedProfileAndEventDetailsStack';
  };

  render() {
    const {
      user,
      time,
      title,
      disabled,
      isFlat,
      reactable,
      activities,
      edited,
    } = this.props;
    return (
      <TouchableOpacity
        style={{flex: 1}}
        onPress={() =>
          NavigationService.navigateIntoInfiniteStack(
            this.getCurrentStack(),
            'profile',
            {id: user.id},
          )
        }
        disabled={disabled}
        accessibilityRole={'button'}
        accessible={true}
        accessibilityLabel={`Go to ${user.first_name} ${user.last_name}'s profile`}>
        <View
          style={{
            flex: 1,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <Image
            style={[globalStyles.mediumProfileImage, {marginRight: 10}]}
            source={
              user.profile_photo_url
                ? {uri: user.profile_photo_url}
                : require('../../shared/images/DefaultProfileImg.png')
            }
          />
          {NavigationService.getCurrentTab() === 'Groups' &&
            user?.is_sponsor_admin &&
            this.props.isGroupSponsor && (
              <View style={{position: 'absolute', bottom: 0, left: 40}}>
                <AdminIcon height={14} width={14} />
              </View>
            )}
          <View style={{flexShrink: 1, flexDirection: 'row'}}>
            <Text style={globalStyles.bodyCopyForm}>
              {isFlat ? (
                <>
                  <>
                    <Text
                      style={
                        globalStyles.h3
                      }>{`${user.first_name} ${user.last_name}`}</Text>{' '}
                  </>
                  {title}
                </>
              ) : reactable ? (
                <Text>
                  <Text style={globalStyles.h3}>
                    {`${user.first_name} ${user.last_name} `}
                  </Text>
                  <Text style={globalStyles.bodyCopyForm}>{title}</Text>
                </Text>
              ) : (
                <AggregatedPostTitle activities={activities} />
              )}
              <Text style={{fontWeight: 'bold'}}> &middot;</Text>{' '}
              {howLongAgo(time)}
              {edited && (
                <Text style={{color: RWBColors.grey20, fontStyle: 'italic'}}>
                  {' '}
                  Edited
                </Text>
              )}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

export {EventLink, GroupLink, NameLink, ChallengeLink};
