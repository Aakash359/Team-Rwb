import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {
  CHALLENGE_DISPLAY,
  CHALLENGE_TYPES,
} from '../../shared/constants/ChallengeTypes';
import {insertLocaleSeperator} from '../../shared/utils/ChallengeHelpers';
import {getPercentage, ordinalIndicator} from '../../shared/utils/Helpers';
import globalStyles, {RWBColors} from '../styles';

const ChallengeProgressBar = ({progress, goal, metric, place}) => (
  <>
    <View style={styles.progressBarWrapper}>
      <View
        style={[
          styles.progressBarWrapper,
          {
            marginTop: 0,
            backgroundColor: RWBColors.navy,
            width: getPercentage(progress, goal),
          },
        ]}>
        {parseFloat(progress) >= parseFloat(goal) && (
          <Text style={styles.percentageText}>100%</Text>
        )}
      </View>
    </View>
    <View style={styles.bottomContainer}>
      <Text style={[globalStyles.h4, {color: RWBColors.navy}]}>
        {progress > goal
          ? insertLocaleSeperator(parseFloat(progress))
          : `${insertLocaleSeperator(parseFloat(progress))}/${goal}`}
        {` ${CHALLENGE_DISPLAY[metric]}`}
      </Text>
      {place && metric !== CHALLENGE_TYPES.checkins ? (
        <Text style={[globalStyles.h4, {color: RWBColors.navy}]}>
          {ordinalIndicator(place)} Place
        </Text>
      ) : null}
    </View>
  </>
);

const styles = StyleSheet.create({
  progressBarWrapper: {
    marginTop: 5,
    marginBottom: 5,
    height: 10,
    borderRadius: 5,
    backgroundColor: RWBColors.grey20,
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentageText: {
    color: RWBColors.white,
    fontSize: 9,
    fontFamily: 'OpenSans-Bold',
    lineHeight: 11,
    paddingRight: 2,
    textAlign: 'right',
  },
});

export default ChallengeProgressBar;
