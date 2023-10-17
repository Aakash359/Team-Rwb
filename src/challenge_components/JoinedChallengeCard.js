import React from 'react';
import {Text, View, StyleSheet, Image} from 'react-native';
import {userProfile} from '../../shared/models/UserProfile';
import {capitalizeFirstLetter} from '../../shared/utils/Helpers';
import globalStyles, {RWBColors} from '../styles';
import ChallengeProgressBar from './ChallengeProgressBar';
import {rwbApi} from '../../shared/apis/api';
import {
  insertLocaleSeperator,
  hoursMinutesSecondsFromMinutes,
} from '../../shared/utils/ChallengeHelpers';
import {CHALLENGE_TYPES} from '../../shared/constants/ChallengeTypes';

export default class JoinedChallengeCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      challengeId: this.props.challengeId || 0,
      progress: 0,
      place: 0,
    };
  }

  componentDidMount() {
    this.loadProgress();
  }

  loadProgress = () => {
    const {challengeId} = this.state;
    rwbApi
      .getLeaderboardRank(challengeId)
      .then((result) => {
        this.setState({
          place: result.rank || 0,
          progress: result.score || 0,
        });
      })
      .catch((err) => {
        //TODO: Error Message
      });
  };

  render() {
    const {progress, place} = this.state;
    const {goal, metric} = this.props;
    return (
      <View>
        {goal && goal > 0 && metric !== CHALLENGE_TYPES.leastMinutes ? (
          <ChallengeProgressBar
            progress={progress || 0}
            goal={goal}
            metric={metric}
            place={place}
          />
        ) : progress != 0 && place != 0 ? (
          <View style={styles.bottomContainer}>
            <View style={styles.placeContainer}>
              <Text style={[globalStyles.h4, {color: RWBColors.navy}]}>
                {place}.
              </Text>
              <Image
                style={[
                  globalStyles.smallProfileImage,
                  {marginLeft: 5, marginRight: 5},
                ]}
                source={
                  userProfile.getUserProfile().profile_photo_url
                    ? {uri: userProfile.getUserProfile().profile_photo_url}
                    : require('../../shared/images/DefaultProfileImg.png')
                }
              />
              <Text style={[globalStyles.h4, {color: RWBColors.navy}]}>
                You
              </Text>
            </View>
            <Text style={[globalStyles.h4, {color: RWBColors.navy}]}>
              {metric !== CHALLENGE_TYPES.leastMinutes
                ? `${insertLocaleSeperator(
                    parseFloat(progress),
                  )} ${capitalizeFirstLetter(metric)}`
                : `${hoursMinutesSecondsFromMinutes(progress).hours}:${
                    hoursMinutesSecondsFromMinutes(progress).minutes
                  }:${hoursMinutesSecondsFromMinutes(progress).seconds}`}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  placeContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
