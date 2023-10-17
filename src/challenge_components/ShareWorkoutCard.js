import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  ActionSheetIOS,
  Alert,
} from 'react-native';

import {rwbApi} from '../../shared/apis/api';
import globalStyles, {RWBColors} from '../styles';
import moment from 'moment';
import PostOptionIcon from '../../svgs/PostOptionIcon';
import CreatePost from '../post_components/CreatePostView';
import AndroidAction from '../design_components/AndroidActionSheet';
import RWBSheetButton from '../design_components/RWBSheetButton';
import {WORKOUT_DELETE_WARNING} from '../../shared/constants/OtherMessages';
import {insertLocaleSeperator} from '../../shared/utils/ChallengeHelpers';

export default class ShareWorkoutCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      eventID: this.props.eventID || 0,
      eventName: this.props.eventName || '',
      chapterName: this.props.chapterName || '',
      eventStartTime: this.props.eventStartTime || '',
      miles: this.props.miles || 0,
      steps: this.props.steps || 0,
      hours: this.props.hours || 0,
      minutes: this.props.minutes || 0,
      seconds: this.props.seconds || 0,
      shareAndDeleteModal: this.props.shareAndDeleteModal || 0,
      workoutActionsheetVisible: false,
      createPostVisible: false,
      deletingWorkout: false,
    };
  }

  deleteWorkout = (id) => {
    this.setState({workoutActionsheetVisible: false});
    const serverDelete = () => {
      this.setState({deletingWorkout: true});
      rwbApi
        .deleteWorkout(id)
        .then(() => {
          this.setState({
            deletingWorkout: false,
          });
          this.props.getUserWorkouts();
        })
        .catch((err) => {
          this.setState({deletingWorkout: false});
          Alert.alert('Team RWB', 'Error Deleting Workout');
        });
    };

    Alert.alert('Delete Workout', WORKOUT_DELETE_WARNING, [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => null,
      },
      {
        text: 'Yes',
        onPress: () => serverDelete(),
      },
    ]);
  };

  shareAndDeleteModal = () => {
    const id = this.state.eventID;
    Platform.OS === 'ios'
      ? ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', `Share Workout`, `Delete Workout`],
            cancelButtonIndex: 0,
            destructiveButtonIndex: 2,
          },
          (buttonIndex) => {
            if (buttonIndex === 1) {
              this.setState({createPostVisible: true});
            } else if (buttonIndex === 2) {
              this.deleteWorkout(id);
            }
          },
        )
      : this.setState({workoutActionsheetVisible: true});
  };

  render() {
    const {
      eventID,
      eventName,
      chapterName,
      eventStartTime,
      miles,
      steps,
      hours,
      minutes,
      seconds,
      shareAndDeleteModal,
      deletingWorkout,
    } = this.state;
    return (
      <View
        style={[
          styles.container,
          this.props.backgroundColor && {
            borderWidth: 1,
            borderColor: RWBColors.grey20,
            backgroundColor: this.props.backgroundColor,
          },
          {opacity: deletingWorkout ? 0.5 : 1},
        ]}>
        <View style={styles.contentContainer}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View style={{flex: 1}}>
              <Text
                style={[globalStyles.eventCardTitle, {color: RWBColors.navy}]}>
                {eventName?.toUpperCase()}
              </Text>
            </View>
            {shareAndDeleteModal ? (
              <TouchableOpacity
                style={styles.shareAndDeleteContainer}
                onPress={() => this.shareAndDeleteModal()}>
                <PostOptionIcon height="24" width="24" />
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={globalStyles.h5}>{chapterName}</Text>
          <Text style={globalStyles.formLabel}>
            {moment(eventStartTime).format('dddd, MMMM DD').toUpperCase()}
          </Text>
          <View style={styles.textContainer}>
            <View style={styles.textBlock}>
              <Text numberOfLines={1} style={globalStyles.h1}>
                {insertLocaleSeperator(parseFloat(miles))}
              </Text>
              <Text style={globalStyles.formLabel}>
                {'Miles'.toUpperCase()}
              </Text>
            </View>
            <View style={styles.textBlock}>
              <Text numberOfLines={1} style={globalStyles.h1}>
                {insertLocaleSeperator(parseInt(steps))}
              </Text>
              <Text style={globalStyles.formLabel}>
                {'Steps'.toUpperCase()}
              </Text>
            </View>
            <View style={styles.textBlock}>
              <Text numberOfLines={1} style={globalStyles.h1}>
                {`${hours}:${minutes}:${seconds}`}
              </Text>
              <Text style={globalStyles.formLabel}>
                {'Duration'.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        {this.state.workoutActionsheetVisible ? (
          <AndroidAction
            cancelable={true}
            hide={() => this.setState({workoutActionsheetVisible: false})}>
            {
              <>
                <RWBSheetButton
                  text={`Share Workout`}
                  onPress={() =>
                    this.setState({
                      createPostVisible: true,
                      workoutActionsheetVisible: false,
                    })
                  }
                />
                <RWBSheetButton
                  text={`Delete Workout`}
                  onPress={() => this.deleteWorkout(eventID)}
                />
              </>
            }
          </AndroidAction>
        ) : null}
        <Modal
          visible={this.state.createPostVisible}
          onRequestClose={() => this.setState({createPostVisible: false})}>
          <CreatePost
            type="user"
            onClose={() => {
              this.setState({createPostVisible: false});
            }}
            challengeId={true}
            eventID={eventID}
            eventName={eventName}
            chapterName={chapterName}
            eventStartTime={eventStartTime}
            miles={miles}
            steps={steps}
            hours={hours}
            minutes={minutes}
            seconds={seconds}
          />
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 130,
    backgroundColor: RWBColors.grey20,
    borderRadius: 10,
    marginTop: 10,
    justifyContent: 'center',
  },
  contentContainer: {
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  textBlock: {
    alignItems: 'flex-start',
    width: '34%',
  },
  shareAndDeleteContainer: {
    zIndex: 1,
    alignSelf: 'flex-end',
  },
});
