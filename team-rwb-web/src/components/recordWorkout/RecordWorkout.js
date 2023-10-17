import React, {useEffect, useState} from 'react';
import styles from './RecordWorkout.module.css';
import Header from '../Header';
import {useHistory, useLocation} from 'react-router-dom';
import TextInput from '../TextInput';
import RWBButton from '../RWBButton';
import CalendarIcon from '../svgs/CalenderIcon';
import {rwbApi} from '../../../../shared/apis/api';
import Loading from '../Loading';
import {isWorkoutValid} from '../../../../shared/utils/WorkoutValidationHelper';
import {isNullOrEmpty} from '../../../../shared/utils/Helpers';
import {WORKOUT_WARNINGS} from '../../../../shared/constants/OtherMessages';
import {CHALLENGE_TYPES} from '../../../../shared/constants/ChallengeTypes';

export default function RecordWorkout() {
  const [miles, setMiles] = useState('');
  const [milesErrorText, setMilesErrorText] = useState('');
  const [stepsErrorText, setStepsErrorText] = useState('');
  const [timeErrorText, setTimeErrorText] = useState('');
  const [steps, setSteps] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [loading, setLoading] = useState(false);

  const history = useHistory();

  const location = useLocation();

  const clearErrorWarnings = () => {
    setMilesErrorText('');
    setStepsErrorText('');
    setTimeErrorText('');
  };

  const handleBack = () => {
    if (location.state.goBack) {
      history.goBack();
    } else {
      history.push({
        pathname: location.state.pathName,
        state: {from: 'record-workout', eventFrom: location.state.from}, //inform the event detail that it came from this workout and return where it was previously from for proper back press handling
      });
    }
  };

  const submitHandler = () => {
    clearErrorWarnings();

    const {miles_error, steps_error, time_error} = isWorkoutValid(
      location.state.requiredUnit,
      miles.toString(),
      steps.toString(),
      hours.toString(),
      minutes.toString(),
      seconds.toString(),
    );

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

    if (
      isNullOrEmpty(miles.toString()) &&
      isNullOrEmpty(steps.toString()) &&
      isNullOrEmpty(hours.toString()) &&
      isNullOrEmpty(minutes.toString()) &&
      isNullOrEmpty(seconds.toString())
    ) {
      alert('Team RWB: ' + WORKOUT_WARNINGS.emptyWorkout);
      return;
    }

    if (miles_error || steps_error || time_error) {
      setMilesErrorText(miles_error);
      setStepsErrorText(steps_error);
      setTimeErrorText(time_error);
      return;
    } else {
      setLoading(true);

      rwbApi
        .putWorkout(location.state.id, data)
        .then(() => {
          setLoading(false);
          handleBack();
        })
        .catch((err) => {
          setLoading(false);
          alert('Team RWB: Error Recording Workout');
        });
    }
  };

  return (
    <>
      {loading && (
        <Loading size={100} color={'var(--white)'} loading={true} right />
      )}
      <div className={styles.rootContainer}>
        <Header title={'Record Workout'} onBack={() => handleBack()} />
        <div className={styles.contentContainer}>
          <div className={styles.eventNameAndChapterContainer}>
            <h1>{location.state.eventName}</h1>
            <h5 className={styles.chapterName}>
              {location.state.eventChapterName}
            </h5>
          </div>

          <div className={styles.calendarContainer}>
            <CalendarIcon tintColor={'var(--magenta)'} height={20} />
            <div>
              <p>{location.state.eventStartTime}</p>
            </div>
          </div>
          <TextInput
            type="number"
            label={`Miles ${
              location.state.requiredUnit === 'miles' ? 'Required' : ''
            }`}
            placeholder={' '}
            value={miles && Math.max(0, miles)}
            onValueChange={(e) =>
              setMiles(e.target.value ? Number(e.target.value) : e.target.value)
            }
            error={milesErrorText}
            onEnter={submitHandler}
            min={0}
          />
          <TextInput
            type="number"
            label={`Steps ${
              location.state.requiredUnit === 'steps' ? 'Required' : ''
            }`}
            placeholder={' '}
            value={steps && Math.max(0, steps)}
            onValueChange={(e) =>
              setSteps(e.target.value ? Number(e.target.value) : e.target.value)
            }
            className={styles.stepsInput}
            error={stepsErrorText}
            onEnter={submitHandler}
            min={0}
          />
          {location.state.requiredUnit === CHALLENGE_TYPES.minutes ||
            (location.state.requiredUnit === CHALLENGE_TYPES.leastMinutes && (
              <p
                style={{
                  fontFamily: 'OpenSans',
                  fontSize: 16,
                  color: 'var(--grey)',
                  textTransform: 'uppercase',
                }}>
                Required:
              </p>
            ))}
          <div className={styles.timeInputsContainer}>
            <TextInput
              type="number"
              label={'Hours'}
              placeholder={' '}
              value={hours && Math.max(0, hours)}
              onValueChange={(e) =>
                setHours(
                  e.target.value ? Number(e.target.value) : e.target.value,
                )
              }
              min={0}
            />
            <TextInput
              type="number"
              label="Minutes"
              placeholder={' '}
              value={minutes && Math.max(0, minutes)}
              onValueChange={(e) =>
                setMinutes(
                  e.target.value ? Number(e.target.value) : e.target.value,
                )
              }
              className={styles.inputMinutes}
              min={0}
            />
            <TextInput
              type="number"
              label="Seconds"
              placeholder={' '}
              value={seconds && Math.max(0, seconds)}
              onValueChange={(e) =>
                setSeconds(
                  e.target.value ? Number(e.target.value) : e.target.value,
                )
              }
              min={0}
            />
          </div>
          <div>
            <p className="errorMessage">{timeErrorText}</p>
          </div>

          <div className={styles.submitButtonWrapper}>
            <RWBButton
              label={'Submit'}
              onClick={() => submitHandler()}
              buttonStyle={'primary'}
            />
          </div>
        </div>
      </div>
    </>
  );
}
