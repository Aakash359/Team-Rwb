import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import globalStyles, {RWBColors} from '../styles';
import {rwbApi} from '../../shared/apis/api';
import RankingRow from './RankingRow';
import ChevronRightIcon from '../../svgs/ChevronRightIcon';
import {userProfile} from '../../shared/models/UserProfile';
import {getChallengeStatusText} from '../../shared/utils/ChallengeHelpers';
import NavigationService from '../models/NavigationService';
import {ActivityIndicator} from 'react-native';
import ChallengeProgressBar from './ChallengeProgressBar';
import {CHALLENGE_TYPES} from '../../shared/constants/ChallengeTypes';

export default class EventChallengeCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
      place: 0,
      name: '',
      end_date: '',
      start_date: '',
      loading: false,
      metric: '',
    };
  }

  viewChallenge = () => {
    NavigationService.navigate('ChallengeView', {
      challengeId: this.props.challengeId,
      progress: this.props.progress,
      place: this.props.place,
    });
  };

  render() {
    const {
      name,
      end_date,
      start_date,
      progress,
      place,
      loading,
      metric,
      goal,
    } = this.props;
    return (
      <TouchableOpacity style={styles.container} onPress={this.viewChallenge}>
        {loading ? (
          <View
            style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <View style={styles.topContainer}>
            <View style={styles.titleAndTimeContainer}>
              <Text style={[globalStyles.h1, styles.title]}>
                {name.toUpperCase()}
              </Text>
              <Text style={globalStyles.h5}>
                {getChallengeStatusText(start_date, end_date)}
              </Text>
            </View>
            <View style={styles.iconContainer}>
              <ChevronRightIcon style={styles.iconView} />
            </View>
          </View>
        )}
        {progress &&
        place &&
        progress !== 0 &&
        place !== 0 &&
        metric !== CHALLENGE_TYPES.checkins ? (
          <RankingRow
            user={userProfile.getUserProfile()}
            progress={progress}
            place={place}
            metric={metric}
            ignoreEmphasis={true}
          />
        ) : progress &&
          progress !== 0 &&
          metric === CHALLENGE_TYPES.checkins ? (
          <ChallengeProgressBar
            progress={progress}
            metric={metric}
            place={place}
            goal={goal}
          />
        ) : null}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 10,
    padding: 10,
    borderColor: RWBColors.grey20,
    borderWidth: 1,
    borderRadius: 5,
  },
  topContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  titleAndTimeContainer: {
    flex: 1,
  },
  iconContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
  },
  iconView: {
    width: 16,
    height: 16,
  },
});
