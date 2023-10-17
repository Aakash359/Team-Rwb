import React from 'react';
import {Text, StyleSheet, View} from 'react-native';

import globalStyles, {RWBColors} from '../styles';

export default class RegisterHeader extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.headerBar}>
        <Text
          style={[globalStyles.title, {textAlign: 'center', marginBottom: 5}]}>
          {this.props.headerText}
        </Text>
        <Text style={[globalStyles.titleSubheader, {textAlign: 'center'}]}>
          {this.props.stepText}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerBar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RWBColors.magenta,
    height: '100%',
    marginHorizontal: 0,
    marginTop: 0,
  },
});
