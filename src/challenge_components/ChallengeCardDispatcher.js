import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {getChallengeStatusText} from '../../shared/utils/ChallengeHelpers';
import RWBMark from '../../svgs/RWBMark';
import globalStyles, {RWBColors} from '../styles';
import JoinedChallengeCard from './JoinedChallengeCard';
import UnjoinedChallengeCard from './UnjoinedChallengeCard';
import NavigationService from '../models/NavigationService';
import {rwbApi} from '../../shared/apis/api';
import {JOIN_CHALLENGE_ERROR} from '../../shared/constants/ErrorMessages';
import { EXECUTION_STATUS, logJoinChallenge } from '../../shared/models/Analytics';

/* potentially change this to a stateful component and "master" component
that determines if the the unjoined or joined is displayed and modify
the lower parts of the component instead */

class ChallengeCardDispatcher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  viewChallenge = () => {
    NavigationService.navigate('ChallengeView', {
      challengeId: this.props.challenge.id,
      onChallengeJoined: this.props.onChallengeJoined,
    });
  };

  joinChallenge = (challengeId) => {
    this.setState({loading: true});
    let analyticsObj = {
      'challenge_id': `${challengeId}`,
      'current_view': 'hub'
    };
    rwbApi
      .joinChallenge(challengeId)
      .then(() => {
        this.props.onChallengeJoined();
        analyticsObj.execution_status = EXECUTION_STATUS.success;
        logJoinChallenge(analyticsObj);
      })
      .catch((err) => {
        Alert.alert('Team RWB', JOIN_CHALLENGE_ERROR);
        analyticsObj.execution_status = EXECUTION_STATUS.failure;
        logJoinChallenge(analyticsObj);
      })
      .finally(() => {
        this.setState({loading: false});
      });
    // join the challenge
    // refresh list on successful join, alert on error. gray out while loading
  };

  render() {
    const {
      name,
      end_date,
      start_date,
      description,
      goal,
      id,
      badge_image_url,
      required_unit,
    } = this.props.challenge;
    const {joined} = this.props;
    const {loading} = this.state;
    return (
      <TouchableOpacity
        style={[styles.container, {opacity: loading ? 0.5 : null}]}
        disabled={loading}
        onPress={this.viewChallenge}>
        <View style={styles.topContainer}>
          <View style={styles.titleAndTimeContainer}>
            <Text style={[globalStyles.h1, styles.title]}>
              {name.toUpperCase()}
            </Text>
            <Text style={globalStyles.h5}>
              {getChallengeStatusText(start_date, end_date)}
            </Text>
          </View>
          {badge_image_url ? (
            <Image
              style={{width: 40, height: 40}}
              source={{uri: badge_image_url}}
            />
          ) : (
            <RWBMark style={{width: 32, height: 28}} />
          )}
        </View>
        {joined ? (
          <JoinedChallengeCard
            challengeId={id}
            goal={goal}
            metric={required_unit}
          />
        ) : (
          <UnjoinedChallengeCard
            challengeId={id}
            title={name}
            description={description}
            buttonDisabled={loading}
            joinChallenge={() => this.joinChallenge(id)}
          />
        )}
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
  },
  titleAndTimeContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
  },
});

export default ChallengeCardDispatcher;
