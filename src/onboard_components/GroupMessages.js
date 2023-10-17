import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  CHAPTER_GROUP,
  MORE_GROUPS,
} from '../../shared/constants/OnboardingMessages';
import HandPointerIcon from '../../svgs/HandPointerIcon';
import globalStyles, {RWBColors} from '../styles';
// SVGS

export default class GroupMessages extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View style={{paddingLeft: 20, paddingRight: 20}}>
        <View
          style={[
            styles.handContainer,
            {marginBottom: 10, transform: [{rotate: '180deg'}]},
          ]}>
          <HandPointerIcon style={styles.handIcon} />
        </View>
        <Text style={[globalStyles.h2, {textAlign: 'center'}]}>
          {CHAPTER_GROUP}
        </Text>
        <View style={{height: 20}} />
        <Text style={[globalStyles.h2, {textAlign: 'center'}]}>
          {MORE_GROUPS}
        </Text>
        <View style={[styles.handContainer, {marginTop: 10}]}>
          <HandPointerIcon style={styles.handIcon} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  handContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handIcon: {
    width: 44,
    height: 44,
  },
});
