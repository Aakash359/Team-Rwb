import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import AttendeesAndFollowedUsers from '../design_components/AttendeesAndFollowedUsers';
import RWBButton from '../design_components/RWBButton';
import globalStyles, {RWBColors} from '../styles';
import {rwbApi} from '../../shared/apis/api';

export default class UnjoinedChallengeCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      challengeId: this.props.challengeId || 0,
      participants: [],
      numberOfUsers: 0,
      followingParticipants: [],
      trimmedDescription: '',
    };
  }

  componentDidMount() {
    this.loadUnjoinedChallengeCard();
  }

  loadUnjoinedChallengeCard = () => {
    Promise.all([
      this.getChallengeParticipants(),
      this.getFollowingParticipants(),
    ])
      .then(([participants, followingParticipants]) => {
        this.setState({
          participants: participants.participants,
          numberOfUsers: participants.total_count,
          followingParticipants: followingParticipants
            ? followingParticipants[0].attendees
            : [],
        });
      })
      .catch((err) => {
        //TODO: Error Message
      });
  };

  getChallengeParticipants = () => {
    return rwbApi
      .getChallengeParticipants(this.state.challengeId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        //TODO: Error Message
      });
  };

  getFollowingParticipants = () => {
    return rwbApi
      .getChallengeFollowingParticipants(this.state.challengeId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        //TODO: Error Message
      });
  };

  render() {
    const {title, description, buttonDisabled, joinChallenge} = this.props;
    const {
      participants,
      numberOfUsers,
      followingParticipants,
      trimmedDescription,
    } = this.state;
    return (
      <View>
        {trimmedDescription !== '' ? (
          <Text style={[globalStyles.bodyCopy, {marginTop: 5}]}>
            {trimmedDescription}
          </Text>
        ) : (
          <Text
            numberOfLines={4}
            style={[globalStyles.bodyCopy, {marginTop: 5}]}
            onTextLayout={(event) => {
              const lines = event.nativeEvent.lines;
              // all lines but the last are complete, so for cases where there are more than three lines of text, we ignore any lines after the third line
              // on android the lines ignore the number of lines while on iOS the numberOfLines set puts all text into the last line (5 paragraphs of text would show 4 lines on iOS but 16 on android)
              if (lines.length >= 4)
                this.setState({
                  trimmedDescription: `${lines[0].text}${lines[1].text}${lines[2].text}`,
                });
            }}>
            {description}
          </Text>
        )}
        <AttendeesAndFollowedUsers
          attendees={participants}
          followingAttendees={followingParticipants}
          totalCount={numberOfUsers}
        />
        <RWBButton
          disabled={buttonDisabled}
          text="JOIN CHALLENGE"
          buttonStyle="primary"
          accessabilityLabel={`Join ${title} challenge`}
          onPress={joinChallenge}
        />
      </View>
    );
  }
}
