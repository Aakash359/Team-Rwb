import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import globalStyles from '../styles';
import {PROFILE_TAB_LABELS} from '../../shared/constants/Labels';
import {RWBColors} from '../styles';
import {insertLocaleSeperator} from '../../shared/utils/ChallengeHelpers';

const MetricsYTD = ({
  expanded,
  allTimeChallenges,
  yearToDateEvents,
  monthToDateEvents,
}) => (
  <View
    style={[
      styles.container,
      expanded ? styles.expandedMetricsContainer : null,
    ]}>
    <View>
      <Text style={styles.metricText}>
        {insertLocaleSeperator(parseInt(allTimeChallenges))}
      </Text>
      <Text style={[globalStyles.formLabel, styles.metricLabelText]}>
        {PROFILE_TAB_LABELS.ALL_TIME_CHALLENGES}
      </Text>
    </View>
    <View style={styles.metricBlock}>
      <Text style={styles.metricText}>
        {insertLocaleSeperator(parseInt(yearToDateEvents))}
      </Text>
      <Text style={[globalStyles.formLabel, styles.metricLabelText]}>
        {PROFILE_TAB_LABELS.YTD_EVENTS}
      </Text>
    </View>
    <View style={styles.metricBlock}>
      <Text style={styles.metricText}>
        {insertLocaleSeperator(parseInt(monthToDateEvents))}
      </Text>
      <Text style={[globalStyles.formLabel, styles.metricLabelText]}>
        {PROFILE_TAB_LABELS.MTD_EVENTS}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  expandedMetricsContainer: {
    justifyContent: 'space-between',
    paddingRight: 30,
  },
  metricBlock: {
    marginLeft: 10,
  },
  metricText: {
    fontFamily: 'ChangaOne-Italic',
    fontSize: 24,
    lineHeight: 22,
    color: RWBColors.navy,
    paddingBottom: 4,
  },
  metricLabelText: {
    marginTop: -3,
  },
});

export default MetricsYTD;
