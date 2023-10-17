import React from 'react';
import {Text, StyleSheet, View, TouchableOpacity} from 'react-native';

// SVGs
import ChevronRightIcon from '../../svgs/ChevronRightIcon';

import globalStyles, {RWBColors} from '../styles';

export default class RWBChevronButton extends React.Component {
  render() {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={this.props.accessibilityLabel || null}
        style={[styles.chevronButton, this.props.customStyles]}
        onPress={this.props.onPress}>
        <View style={{flexDirection: 'row'}}>
          {this.props.icon}
          <Text style={globalStyles.h2}>{this.props.text}</Text>
        </View>
        {this.props.buttonStyle === 'chevron' && (
          <ChevronRightIcon style={styles.iconView} />
        )}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  chevronButton: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: RWBColors.grey8,
    marginTop: -1,
    paddingVertical: 15,
    paddingHorizontal: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconView: {
    top: 1,
    width: 16,
    height: 16,
  },
});
