import React, {Component} from 'react';
import {View, ActivityIndicator} from 'react-native';

export default class FooterSpinner extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View
        style={{
          paddingVertical: 20,
          borderTopWidth: 1,
          borderColor: '#CED0CE', //a gray
        }}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }
}
