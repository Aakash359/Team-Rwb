import React from 'react';
import {Text, StyleSheet, TouchableHighlight, View} from 'react-native';
import {RWBColors} from '../styles';

export default class RWBButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var buttonStyling, labelStyling;
    if (this.props.buttonStyle === 'primary') {
      buttonStyling = styles.primaryButton;
      labelStyling = styles.primaryButtonLabel;
    } else if (this.props.buttonStyle === 'primaryDisabled') {
      buttonStyling = styles.primaryButtonDisabled;
      labelStyling = styles.primaryButtonLabelDisabled;
    } else if (this.props.buttonStyle === 'secondary') {
      buttonStyling = styles.secondaryButton;
      labelStyling = styles.secondaryButtonLabel;
    } else {
      buttonStyling = styles.defaultButton;
      labelStyling = styles.defaultButtonLabel;
    }

    return (
      <TouchableHighlight
        style={[buttonStyling, this.props.customStyles]}
        onPress={this.props.onPress}
        underlayColor="rgba(0,0,0,0.5)"
        disabled={this.props.disabled}
        accessibilityRole="button"
        accessibilityLabel={this.props.accessibilityLabel}>
        <View style={this.props.children ? styles.svgTextContainer : null}>
          {/* expected children is an svg, and if it is there, give it some spacing */}
          {this.props.children && (
            <View style={{marginRight: 5}}>{this.props.children}</View>
          )}
          <Text style={labelStyling}>{this.props.text}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  // Button Styling
  primaryButton: {
    padding: 20,
    marginBottom: 10,
    borderRadius: 2,
    backgroundColor: RWBColors.magenta,
  },
  primaryButtonLabel: {
    fontFamily: 'OpenSans-Extrabold',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: RWBColors.white,
  },

  primaryButtonDisabled: {
    padding: 20,
    marginBottom: 10,
    borderRadius: 2,
    backgroundColor: RWBColors.grey20,
  },
  primaryButtonLabelDisabled: {
    fontFamily: 'OpenSans-Extrabold',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: RWBColors.grey,
  },

  secondaryButton: {
    padding: 20,
    marginBottom: 10,
    borderRadius: 2,
    backgroundColor: RWBColors.grey20,
  },
  secondaryButtonLabel: {
    fontFamily: 'OpenSans-Semibold',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: RWBColors.grey,
  },

  defaultButton: {
    padding: 20,
    marginBottom: 10,
    borderRadius: 2,
    backgroundColor: 'black',
  },
  defaultButtonLabel: {
    fontFamily: 'OpenSans-Semibold',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: RWBColors.white,
  },
  svgTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
