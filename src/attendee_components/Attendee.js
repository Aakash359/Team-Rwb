import React, {PureComponent} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import attendeeCardStyles from './attendeeCardStyles';

import {MILITARY_STATUSES} from '../../shared/constants/MilitaryStatusSlugs';

import globalStyles, {RWBColors} from '../styles';
import NavigationService from '../models/NavigationService';
import {userProfile} from '../../shared/models/UserProfile';
import RWBMark from '../../svgs/RWBMark';
import RWBButton from '../design_components/RWBButton';

export default class Attendee extends PureComponent {
  render() {
    const {user} = this.props;
    const name = `${user.first_name} ${user.last_name}`;
    const photo = user.profile_photo_url;
    const currentUser = userProfile.getUserProfile();

    let militaryInfo = `${user.military_status}`;
    if (
      user.military_branch &&
      user.military_status !== MILITARY_STATUSES.civilian
    ) {
      militaryInfo += ` / ${user.military_branch}`;
    }

    return (
      <TouchableOpacity
        style={attendeeCardStyles.container}
        accessible={true}
        accessibilityLabel={`View ${name}'s profile`}
        accessibilityRole="button"
        onPress={() =>
          NavigationService.navigateIntoInfiniteStack(
            this.props.challengeName
              ? 'ChallengeProfileAndEventDetailsStack'
              : 'EventsProfileAndEventDetailsStack',
            'profile',
            {id: user.id},
          )
        }
        disabled={!currentUser.eagle_leader && !user.public_profile}>
        <Image
          style={globalStyles.mediumProfileImage}
          source={
            photo
              ? {uri: photo}
              : require('./../../shared/images/DefaultProfileImg.png')
          }
        />
        <View
          style={[
            attendeeCardStyles.details,
            this.props.canBlock ? {width: '45%'} : null,
          ]}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={[globalStyles.h3, attendeeCardStyles.titleOverride]}>
              {name}&nbsp;
            </Text>
            {this.props.isEagleLeader && (
              <RWBMark style={{width: 28, height: 14}} fill={RWBColors.white} />
            )}
          </View>
          <View>
            {this.props.isEagleLeader && (
              <Text style={[globalStyles.h5, attendeeCardStyles.bodyOverride]}>
                Eagle Leader
              </Text>
            )}
            {user.preferred_chapter.name ? (
              <Text
                style={[
                  globalStyles.bodyCopy,
                  attendeeCardStyles.bodyOverride,
                ]}>
                {user.preferred_chapter.name}
              </Text>
            ) : null}
            {user.military_status ? (
              <Text
                style={[
                  globalStyles.bodyCopy,
                  attendeeCardStyles.bodyOverride,
                ]}>
                {militaryInfo}
              </Text>
            ) : null}
          </View>
        </View>
        {this.props.canBlock && (
          <View style={attendeeCardStyles.unblockContainer}>
            <RWBButton
              onPress={() => {
                this.props.unBlockUser(user.id);
              }}
              text={'Unblock User'.toUpperCase()}
              buttonStyle="primary"
            />
          </View>
        )}
      </TouchableOpacity>
    );
  }
}
