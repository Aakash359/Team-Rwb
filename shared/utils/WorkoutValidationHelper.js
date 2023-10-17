import {WORKOUT_WARNINGS} from '../constants/OtherMessages';
import {isNullOrEmpty} from '../../shared/utils/Helpers';
import {CHALLENGE_TYPES} from '../constants/ChallengeTypes';

export function isWorkoutValid(
  requiredUnit,
  miles,
  steps,
  hours,
  minutes,
  seconds,
) {
  let miles_error = '';
  let steps_error = '';
  let time_error = '';

  const duration = (
    parseInt(hours || 0) * 60 +
    parseInt(minutes || 0) +
    parseInt(seconds || 0) / 60
  ).toString();

  const required_field = 'THIS FIELD IS REQUIRED';
  const number_required = 'PLEASE ENTER A NUMBER';

  if (isNaN(miles)) {
    miles_error = number_required;
  }
  if (requiredUnit === 'miles' && isNullOrEmpty(miles)) {
    miles_error = required_field;
  }
  if (requiredUnit === 'steps' && isNullOrEmpty(steps)) {
    steps_error = required_field;
  }

  if (miles && miles.length > 7) {
    miles_error = WORKOUT_WARNINGS.milesDigit;
  }

  if (miles && parseFloat(miles) > 999.99) {
    miles_error = WORKOUT_WARNINGS.milesLength;
  }

  if (miles && miles.includes('.') && miles.split('.')[1].length > 2) {
    miles_error = WORKOUT_WARNINGS.milesDecimals;
  }

  if (isNaN(steps)) {
    steps_error = number_required;
  }

  if (steps && parseInt(steps) > 99999) {
    steps_error = WORKOUT_WARNINGS.stepsLength;
  }

  if (
    (requiredUnit === CHALLENGE_TYPES.minutes ||
      requiredUnit === CHALLENGE_TYPES.leastMinutes) &&
    duration === '0'
  ) {
    time_error = WORKOUT_WARNINGS.timeRequired;
  }

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    time_error = number_required;
  }

  if (duration && parseFloat(duration) > 1440) {
    time_error = WORKOUT_WARNINGS.timeLength;
  }
  return {
    miles_error: miles_error,
    steps_error: steps_error,
    time_error: time_error,
  };
}
