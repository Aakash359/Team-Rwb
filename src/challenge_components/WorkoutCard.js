import React from 'react';
import {Text, StyleSheet, View, TouchableOpacity} from 'react-native';
import globalStyles, {RWBColors} from '../styles';
import PostOptionIcon from '../../svgs/PostOptionIcon';
import {insertLocaleSeperator} from '../../shared/utils/ChallengeHelpers';

export default class WorkoutCard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {miles, steps, hours, minutes, seconds, deleting, displayOnly} = this.props;
    return (
      <View
        style={[styles.workoutCardContainer, {opacity: deleting ? 0.5 : 1, borderWidth: displayOnly ? 0 : 1}]}>
        <TouchableOpacity
          disabled={displayOnly}
          style={styles.shareAndDeleteContainer}
          onPress={() => this.props.shareAndDeleteModal()}>
          {!displayOnly ? <PostOptionIcon height="24" width="24" /> : <View style={{height: 24, width: 24}} />}
        </TouchableOpacity>
        <View style={[styles.textContainer, {paddingHorizontal: displayOnly ? 0 : 30}]}>
          <View style={styles.textBlock}>
            <Text numberOfLines={1} style={globalStyles.h1}>
              {insertLocaleSeperator(parseFloat(miles))}
            </Text>
            <Text style={globalStyles.formLabel}>{'Miles'.toUpperCase()}</Text>
          </View>
          <View style={styles.textBlock}>
            <Text numberOfLines={1} style={globalStyles.h1}>
              {insertLocaleSeperator(parseInt(steps))}
            </Text>
            <Text style={globalStyles.formLabel}>{'Steps'.toUpperCase()}</Text>
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
    );
  }
}

const styles = StyleSheet.create({
  workoutCardContainer: {
    height: 70,
    width: '100%',
    borderColor: RWBColors.grey20,
    borderRadius: 10,
  },
  shareAndDeleteContainer: {
    alignSelf: 'flex-end',
    marginTop: 15,
    marginRight: 15,
    zIndex: 1,
  },
  textContainer: {
    marginTop: -20,
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textBlock: {
    alignItems: 'flex-start',
    width: '33%',
  },
});
