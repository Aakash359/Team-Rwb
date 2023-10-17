import React from 'react';
import {Text, StyleSheet, View, TouchableOpacity, Image} from 'react-native';

import globalStyles, {RWBColors} from '../styles';
import NavigationService from '../models/NavigationService';
import ChevronRightIcon from '../../svgs/ChevronRightIcon';
import badgePhotos from '../../shared/images/badgePhotos';
import {PROFILE_TAB_LABELS} from '../../shared/constants/Labels';

export default class ChallengeBadgesView extends React.Component {
  render() {
    const {userBadges, myProfile, isLoading} = this.props;
    return (
      <View style={{marginTop: myProfile ? 18 : 0}}>
        {userBadges.length > 0 ? (
          <TouchableOpacity
            style={[styles.linkTextContainer]}
            onPress={() => {
              NavigationService.navigate('TrophiesAndBadges', {
                badges: userBadges,
              });
            }}>
            <Text style={styles.linkText}>
              {PROFILE_TAB_LABELS.CHALLENGE_BADGES.toUpperCase()}
            </Text>
            <View>
              <ChevronRightIcon style={styles.iconView} />
            </View>
          </TouchableOpacity>
        ) : (
          myProfile && (
            <View style={[styles.linkTextContainer]}>
              <Text style={styles.linkText}>
                {PROFILE_TAB_LABELS.CHALLENGE_BADGES.toUpperCase()}
              </Text>
            </View>
          )
        )}
        <View style={{flexDirection: 'row'}}>
          {userBadges.length > 0
            ? userBadges.slice(0, 5).map((badge, i) => (
                <View
                  style={{marginTop: 5}}
                  key={`${badge.name}-${badge.received_datetime}`}>
                  <Image
                    key={badge.name}
                    style={styles.badgeImage}
                    source={{uri: badge.image_url}}
                  />
                </View>
              ))
            : !isLoading &&
              myProfile && (
                <TouchableOpacity
                  onPress={() => {
                    NavigationService.navigate('Challenges');
                  }}
                  style={styles.joinChallengesEarnBadgeContainer}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <View style={{flexDirection: 'row'}}>
                      <View
                        style={[
                          styles.badgesStackImageContainer,
                          {marginLeft: 0},
                        ]}>
                        <Image
                          style={styles.badgesStackImage}
                          source={badgePhotos.oldGlory}
                        />
                      </View>
                      <View style={styles.badgesStackImageContainer}>
                        <Image
                          style={styles.badgesStackImage}
                          source={badgePhotos.ruckIt}
                        />
                      </View>
                      <View style={styles.badgesStackImageContainer}>
                        <Image
                          style={styles.badgesStackImage}
                          source={badgePhotos.fireStarter}
                        />
                      </View>
                    </View>
                    <Text style={[globalStyles.h3, {marginLeft: 10}]}>
                      {PROFILE_TAB_LABELS.JOIN_CHALLENGES_EARN_BADGES}
                    </Text>
                  </View>
                  <ChevronRightIcon style={styles.iconView} />
                </TouchableOpacity>
              )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
  badgeImage: {
    height: 68,
    width: 68,
    borderRadius: 34,
  },
  badgesStackImageContainer: {
    height: 50,
    width: 50,
    marginLeft: -25,
    backgroundColor: RWBColors.grey20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: RWBColors.white,
  },
  badgesStackImage: {
    width: 50,
    height: 50,
  },
  iconView: {
    width: 16,
    height: 16,
    top: 0.5,
  },
  joinChallengesEarnBadgeContainer: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 13,
    marginBottom: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
