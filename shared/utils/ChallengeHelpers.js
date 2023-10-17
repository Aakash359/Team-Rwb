import moment from 'moment';
import {capitalizeFirstLetter} from './Helpers';

export function challengeParams(tab) {
  const today = moment().toISOString().split('T')[0];
  const yesterday = moment().subtract(1, 'days').toISOString().split('T')[0];
  if (tab === 'active') {
    return `?end_date_after=${today}&sort_order=asc`;
  } else if (tab === 'past') {
    return `?end_date_before=${yesterday}&sort_order=desc`;
  } else throw new Error('"active" or "past" required');
}

export function separateUnjoinedChallenges(unjoinedChallenges) {
  let availableChallenges = [];
  let upcomingChallenges = [];

  for (let i = 0; i < unjoinedChallenges.length; i++) {
    const challenge = unjoinedChallenges[i];
    if (isUpcomingChallenge(challenge.start_date))
      upcomingChallenges.push(challenge);
    else availableChallenges.push(challenge);
  }

  // upcoming challenges are ordered by starting sooner to starting later
  const sortedUpcoming = upcomingChallenges.sort((a, b) => {
    return moment(a.start_date).diff(moment(b.start_date));
  });
  return {availableChallenges, upcomingChallenges: sortedUpcoming};
}

export function isUpcomingChallenge(challengeStartDate) {
  const today = moment();
  return moment(challengeStartDate).isAfter(today);
}

export function formatMetric(metric) {
  if (metric === 'miles') return 'Mi';
  else if (metric === 'minutes') return 'Min.';
  else if (metric === 'check-in' || metric === '') return 'Events';
  else return capitalizeFirstLetter(metric);
}

export function isChallengeOver(challengeEndDate) {
  // add one day to ensure we count the last day of the challenge
  const today = moment();
  return moment(challengeEndDate).subtract(1, 'day').isBefore(today, 'day');
}

export function challengeEndsToday(challengeEndDate) {
  const today = moment();
  return moment(today).startOf('day').isSame(challengeEndDate);
}

// returns a string for when a challenge ends
export function howLongUntil(endTime) {
  // add one day to ensure we count the last day of the challenge
  return moment(endTime).add(1, 'day').fromNow();
}

// TODO use this in more places
export function hoursMinutesSecondsFromMinutes(minutes) {
  return {
    hours: Math.floor(minutes / 60) || 0,
    minutes: Math.floor(minutes % 60) || 0,
    seconds: Math.round((minutes % 1) * 60) || 0,
  };
}

export function getChallengeStatusText(challengeStartDate, challengeEndDate) {
  if (challengeEndsToday(challengeEndDate)) {
    return 'Ends Today';
  } else if (isChallengeOver(challengeEndDate)) {
    return 'Ended ' + moment(challengeEndDate).format('MMM DD, YYYY');
  } else if (isUpcomingChallenge(challengeStartDate)) {
    return 'Starts ' + moment(challengeStartDate).format('MMM DD, YYYY');
  } else {
    return 'Ends ' + howLongUntil(challengeEndDate);
  }
}

export function insertLocaleSeperator(metricValue) {
  // the android javascript core does not support toLocaleString, preventing prod releases from utilizing it
  // instead, add a comma after every three numbers before decimal points
  return metricValue.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}
