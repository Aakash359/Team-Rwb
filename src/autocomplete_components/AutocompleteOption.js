import React, {PureComponent} from 'react';
import {Text, TouchableOpacity} from 'react-native';

import globalStyles, {RWBColors} from '../styles';

export default class AutocompleteOption extends PureComponent {
  handlePress = () => {
    const {
      onOptionPress,
      option: {key},
    } = this.props;
    onOptionPress(key);
  };

  render() {
    const {
      option: {
        key: {fullAddress, suiteName},
      },
    } = this.props;
    return (
      <TouchableOpacity style={this.props.style} onPress={this.handlePress}>
        <Text style={globalStyles.bodyCopyForm}>
          {fullAddress} {suiteName}
        </Text>
      </TouchableOpacity>
    );
  }
}
