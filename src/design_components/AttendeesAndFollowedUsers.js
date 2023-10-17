import React from 'react';
import {Text, View} from 'react-native';
import UserBadges from '../event_components/UserBadges';
import globalStyles, {RWBColors} from '../styles';

displayFollowingAttendees = (followingAttendees) => {
  if (followingAttendees.length === 1)
    return (
      <Text style={globalStyles.bodyCopy}>
        <Text
          style={{
            color: RWBColors.navy,
          }}>{`${followingAttendees[0].first_name} ${followingAttendees[0].last_name}`}</Text>{' '}
        is going
      </Text>
    );
  else if (followingAttendees.length === 2)
    return (
      <Text style={globalStyles.bodyCopy}>
        <Text
          style={{
            color: RWBColors.navy,
          }}>{`${followingAttendees[0].first_name} ${followingAttendees[0].last_name} and ${followingAttendees[1].first_name} ${followingAttendees[1].last_name}`}</Text>{' '}
        are going
      </Text>
    );
  else if (followingAttendees.length > 2)
    return (
      <Text style={globalStyles.bodyCopy}>
        <Text
          style={{
            color: RWBColors.navy,
          }}>{`${followingAttendees[0].first_name} ${followingAttendees[0].last_name}, ${followingAttendees[1].first_name} ${followingAttendees[1].last_name}`}</Text>{' '}
        and{' '}
        <Text style={{color: RWBColors.navy}}>
          {followingAttendees.length - 2}{' '}
          {followingAttendees.length === 2 ? 'other' : 'others'}{' '}
        </Text>{' '}
        {followingAttendees.length === 2 ? 'is going' : 'are going'}
      </Text>
    );
};

const AttendeesAndFollowedUsers = ({
  attendees,
  followingAttendees,
  totalCount,
}) => (
  <>
    <View
      style={{
        flexDirection: 'row',
        marginTop: 10,
        alignItems: 'center',
      }}>
      <UserBadges userList={attendees} />
      {totalCount > 0 ? (
        <Text
          style={[
            globalStyles.link,
            {
              left: totalCount >= 9 ? -55 : totalCount * -10 + 15,
            },
          ]}>
          {totalCount}
        </Text>
      ) : null}
    </View>

    {followingAttendees && followingAttendees.length ? (
      <View>{this.displayFollowingAttendees(followingAttendees)}</View>
    ) : (
      // placeholder
      <View style={{paddingBottom: 10}} />
    )}
  </>
);

export default AttendeesAndFollowedUsers;
