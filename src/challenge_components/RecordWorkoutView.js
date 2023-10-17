import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Alert,
} from 'react-native';
import globalStyles, {RWBColors} from '../styles';
import ChevronBack from '../../svgs/ChevronBack';
import RWBButton from '../design_components/RWBButton';
import RWBTextField from '../design_components/RWBTextField';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import CalenderIcon from '../../svgs/CalenderIcon';
import moment from 'moment';
import {rwbApi} from '../../shared/apis/api';
import {isWorkoutValid} from '../../shared/utils/WorkoutValidationHelper';
import {isNullOrEmpty} from '../../shared/utils/Helpers';
import {WORKOUT_WARNINGS} from '../../shared/constants/OtherMessages';
import {CHALLENGE_TYPES} from '../../shared/constants/ChallengeTypes';

export default class RecordWorkoutView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      miles: '',
      miles_error: '',
      steps: '',
      steps_error: '',
      hours: '',
      minutes: '',
      seconds: '',
      time_error: '',
      keyboardIsShowing: false,
      event_name: this.props.eventName,
      chapter_name: this.props.chapterName,
      eventStartTime: this.props.eventStartTime,
      requiredUnit: this.props.requiredUnit,
    };
    this.keyboardHeight = 0;
  }

  componentDidMount() {
    this.keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      this._keyboardWillShow,
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this._keyboardWillHide,
    );
  }

  componentWillUnmount() {
    this.keyboardWillShowListener.remove();
    this.keyboardWillHideListener.remove();
  }

  _keyboardWillShow = (e) => {
    this.keyboardHeight = e.endCoordinates.height;
    this.setState({keyboardIsShowing: true});
    this.forceUpdate();
  };

  _keyboardWillHide = (e) => {
    this.keyboardHeight = 0;
    this.setState({keyboardIsShowing: false});
    this.forceUpdate();
  };

  clearErrors = () => {
    this.setState({
      miles_error: '',
      steps_error: '',
      time_error: '',
    });
  };

  submitPressed = () => {
    this.clearErrors();

    const {requiredUnit, miles, steps, hours, minutes, seconds} = this.state;

    const id = this.props.id;

    const duration = (
      parseInt(hours || 0) * 60 +
      parseInt(minutes || 0) +
      parseInt(seconds || 0) / 60
    ).toString();

    const payload = {
      miles: parseFloat(miles) || 0,
      steps: parseInt(steps) || 0,
      minutes: parseFloat(parseFloat(duration).toFixed(2)) || 0,
    };
    let data = JSON.stringify(payload);

    const {miles_error, steps_error, time_error} = isWorkoutValid(
      requiredUnit,
      miles,
      steps,
      hours,
      minutes,
      seconds,
    );

    if (
      isNullOrEmpty(miles) &&
      isNullOrEmpty(steps) &&
      isNullOrEmpty(hours) &&
      isNullOrEmpty(minutes) &&
      isNullOrEmpty(seconds)
    ) {
      Alert.alert('Team RWB', WORKOUT_WARNINGS.emptyWorkout);
      return;
    }

    if (miles_error || steps_error || time_error) {
      this.setState({
        miles_error: miles_error,
        steps_error: steps_error,
        time_error: time_error,
      });
      return;
    } else {
      this.setState({loading: true});
      rwbApi
        .putWorkout(id, data)
        .then(() => {
          this.setState({loading: false});
          this.closeModal();
          this.props.refreshEvent(data);
        })
        .catch((err) => {
          Alert.alert('Team RWB', 'Error Recording Workout');
          this.setState({loading: false});
        });
    }
  };

  closeModal() {
    this.props.onClose();
  }

  render() {
    const {
      loading,
      miles,
      miles_error,
      steps,
      steps_error,
      hours,
      minutes,
      seconds,
      time_error,
      event_name,
      chapter_name,
      eventStartTime,
      requiredUnit,
    } = this.state;
    const startDateTime = moment(eventStartTime);
    return (
      <View style={{flex: 1}}>
        {loading && (
          <View style={globalStyles.spinnerOverLay}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <View style={styles.header}>
              <TouchableOpacity style={{padding: 5}} onPress={() => this.closeModal()}>
                <ChevronBack
                  style={[globalStyles.chevronBackImage, {right: 10}]}
                />
              </TouchableOpacity>
              <Text style={[globalStyles.title]}>Record Workout</Text>
              {/* placeholder */}
              <View style={{width: 16, height: 16}}></View>
            </View>
          </View>

          <KeyboardAwareScrollView
            style={styles.scrollViewContainer}
            contentContainerStyle={styles.scrollViewContainerContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.formWrapper}>
              <Text style={[globalStyles.h1, {marginTop: 20}]}>
                {event_name ? event_name.toUpperCase() : ''}
              </Text>
              {chapter_name ? (
                <Text style={[globalStyles.h5, styles.detailBlock]}>
                  {chapter_name}
                </Text>
              ) : (
                // placeholder
                <View style={styles.detailBlock}></View>
              )}
              <View style={{flexDirection: 'row'}}>
                <CalenderIcon style={[styles.iconView, {marginRight: 5}]} />
                <View>
                  <Text style={globalStyles.bodyCopyForm}>
                    {startDateTime.format('ddd, MMM DD, YYYY')}
                  </Text>
                </View>
              </View>
              <RWBTextField
                refProp={(input) => {
                  this.miles = input;
                }}
                label={requiredUnit === 'miles' ? 'MILES (REQUIRED)' : 'Miles'}
                value={miles}
                error={miles_error}
                secureTextEntry={false}
                autoCapitalize="none"
                returnKeyType="next"
                onChangeText={(text) => {
                  this.setState({
                    miles: text,
                  });
                }}
                keyboardType={'decimal-pad'}
              />
              <RWBTextField
                refProp={(input) => {
                  this.steps = input;
                }}
                label={requiredUnit === 'steps' ? 'STEPS (REQUIRED)' : 'Steps'}
                value={steps}
                error={steps_error}
                secureTextEntry={false}
                autoCapitalize="none"
                returnKeyType="next"
                onChangeText={(text) => {
                  this.setState({
                    steps: text,
                  });
                }}
                keyboardType={'number-pad'}
              />
              {requiredUnit === CHALLENGE_TYPES.minutes ||
              requiredUnit === CHALLENGE_TYPES.leastMinutes ? (
                <View style={{marginTop: 10, marginBottom: -10}}>
                  <Text style={globalStyles.formLabel}>REQUIRED</Text>
                </View>
              ) : null}
              <View style={styles.textFieldContainer}>
                <View style={styles.textFieldBlock}>
                  <RWBTextField
                    refProp={(input) => {
                      this.hours = input;
                    }}
                    label={'Hours'}
                    value={hours}
                    error={time_error ? ' ' : null}
                    secureTextEntry={false}
                    autoCapitalize="none"
                    returnKeyType="next"
                    onChangeText={(text) => {
                      this.setState({
                        hours: text,
                      });
                    }}
                    keyboardType={'number-pad'}
                  />
                </View>
                <View style={styles.textFieldBlock}>
                  <RWBTextField
                    refProp={(input) => {
                      this.minutes = input;
                    }}
                    label="Minutes"
                    value={minutes}
                    error={time_error ? ' ' : null}
                    secureTextEntry={false}
                    autoCapitalize="none"
                    returnKeyType="next"
                    onChangeText={(text) => {
                      this.setState({
                        minutes: text,
                      });
                    }}
                    keyboardType={'number-pad'}
                  />
                </View>
                <View style={styles.textFieldBlock}>
                  <RWBTextField
                    refProp={(input) => {
                      this.seconds = input;
                    }}
                    label="Seconds"
                    value={seconds}
                    error={time_error ? ' ' : null}
                    secureTextEntry={false}
                    autoCapitalize="none"
                    returnKeyType="next"
                    onChangeText={(text) => {
                      this.setState({
                        seconds: text,
                      });
                    }}
                    keyboardType={'number-pad'}
                  />
                </View>
              </View>
              {time_error ? (
                <View style={{marginTop: 5}}>
                  <Text style={globalStyles.errorMessage}>{time_error}</Text>
                </View>
              ) : null}
            </View>
          </KeyboardAwareScrollView>
          <View
            style={{
              width: '90%',
              alignSelf: 'center',
              bottom: this.keyboardHeight || 20,
              marginTop: 20,
            }}>
            <RWBButton
              buttonStyle="primary"
              text="SUBMIT"
              onPress={this.submitPressed}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    backgroundColor: RWBColors.white,
  },
  scrollViewContainer: {
    width: '100%',
    height: '100%',
    paddingHorizontal: '5%',
    backgroundColor: RWBColors.white,
  },
  scrollViewContainerContent: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  headerContainer: {
    width: '100%',
    backgroundColor: RWBColors.magenta,
    padding: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    top: 20,
    right: 2,
  },
  formWrapper: {
    flex: 1,
    width: '100%',
    height: 'auto',
    marginBottom: 25,
  },
  iconView: {
    width: 16,
    height: 16,
  },
  detailBlock: {
    marginBottom: 15,
  },
  textFieldContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textFieldBlock: {
    display: 'flex',
    flex: 0.28,
  },
});
