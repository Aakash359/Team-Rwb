import React from 'react';
import {Image, Text, View} from 'react-native';
import {CHALLENGE_TYPES} from '../../shared/constants/ChallengeTypes';
import {userProfile} from '../../shared/models/UserProfile';
import {
  formatMetric,
  insertLocaleSeperator,
  hoursMinutesSecondsFromMinutes,
} from '../../shared/utils/ChallengeHelpers';
import globalStyles, {RWBColors} from '../styles';

const isCurrentUser = (userId) => {
  const curUser = userProfile.getUserProfile();
  return curUser.id === userId;
};

const RankingRow = ({place, user, progress, metric, ignoreEmphasis}) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Text
        style={[
          globalStyles.h3,
          {
            color:
              isCurrentUser(user.id) && !ignoreEmphasis
                ? RWBColors.magenta
                : RWBColors.navy,
          },
        ]}>{`${place}. `}</Text>
      <View
        style={{
          marginRight: 3,
          height: 40,
          width: 40,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            isCurrentUser(user.id) && !ignoreEmphasis
              ? RWBColors.magenta
              : null,
          borderRadius: 20,
        }}>
        <Image
          style={[globalStyles.smallProfileImage]}
          source={
            user.profile_photo_url
              ? {uri: user.profile_photo_url}
              : require('../../shared/images/DefaultProfileImg.png')
          }
        />
      </View>
      <Text
        style={[
          globalStyles.h3,
          {
            color:
              isCurrentUser(user.id) && !ignoreEmphasis
                ? RWBColors.magenta
                : RWBColors.navy,
          },
        ]}>
        {isCurrentUser(user.id)
          ? 'You'
          : `${user.first_name} ${user.last_name}`}
      </Text>
    </View>
    <View>
      <Text
        style={[
          globalStyles.h3,
          {
            color:
              isCurrentUser(user.id) && !ignoreEmphasis
                ? RWBColors.magenta
                : RWBColors.navy,
          },
        ]}>
        {metric !== CHALLENGE_TYPES.leastMinutes
          ? `${insertLocaleSeperator(parseFloat(progress))} ${formatMetric(
              metric,
            )}`
          : `${hoursMinutesSecondsFromMinutes(progress).hours}:${
              hoursMinutesSecondsFromMinutes(progress).minutes
            }:${hoursMinutesSecondsFromMinutes(progress).seconds}`}
      </Text>
    </View>
  </View>
);

export default RankingRow;
