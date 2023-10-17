import React, {PureComponent} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';

import attendeeCardStyles from './attendeeCardStyles';
import NavigationService from '../models/NavigationService';

import globalStyles, {RWBColors} from '../styles';

// SVGs
import EagleLeaderIcon from '../../svgs/EagleLeaderIcon';

export default class EventHostCard extends PureComponent {
  render() {
    const {host} = this.props;
    const {first_name, last_name, is_eagle_leader, photo_url, title} = host;

    return (
      <TouchableOpacity
        style={attendeeCardStyles.eagleContainer}
        accessible={true}
        accessibilityLabel={`View ${first_name} ${last_name}'s profile`}
        accessibilityRole="button"
        onPress={() =>
          NavigationService.navigateIntoInfiniteStack(
            'EventsProfileAndEventDetailsStack',
            'profile',
            {id: host.id},
          )
        }>
        <Image
          style={globalStyles.mediumProfileImage}
          source={
            photo_url
              ? {uri: photo_url}
              : require('./../../shared/images/DefaultProfileImg.png')
          }
        />
        <View style={[attendeeCardStyles.details]}>
          <Text
            style={[
              globalStyles.h3,
              attendeeCardStyles.titleOverride,
            ]}>{`${first_name} ${last_name}`}</Text>
          <View>
            {is_eagle_leader ? (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <EagleLeaderIcon style={attendeeCardStyles.iconContainer} />
                <Text
                  style={[globalStyles.h5, attendeeCardStyles.bodyOverride]}>
                  Eagle Leader
                </Text>
              </View>
            ) : null}
            {/* POTENTIAL TODO: HAVE SERVER RETURN MORE INFORMATION ABOUT HOST TO DISPLAY FOR MEMBER HOSTED EVENTS */}
            {is_eagle_leader ? (
              <Text style={[globalStyles.h5, attendeeCardStyles.bodyOverride]}>
                {title}
              </Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}
