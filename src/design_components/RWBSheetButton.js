import React from 'react';
import {Text, StyleSheet, TouchableHighlight} from 'react-native';
import {RWBColors} from '../styles';

export default class RWBSheetButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TouchableHighlight
        style={styles.button}
        onPress={this.props.onPress}
        underlayColor="rgba(0,0,0,0.5)">
        <Text style={styles.buttonText}>{this.props.text}</Text>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: RWBColors.white,
    padding: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
