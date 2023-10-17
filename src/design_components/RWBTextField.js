import React from 'react';
import {View, StyleSheet, Dimensions, Platform} from 'react-native';
import {TextField} from 'rn-material-ui-textfield';

import globalStyles, {RWBColors} from '../styles';

export default class RWBTextField extends React.Component {
  constructor(props) {
    super(props);
    state = {
      text: null,
    };
    this.onChangeText = this.onChangeText.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }
  onBlur(value) {
    let {onBlur} = this.props;

    if ('function' === typeof onBlur) {
      onBlur();
    }
  }
  onChangeText(text) {
    let {onChangeText} = this.props;

    this.setState({text});

    if ('function' === typeof onChangeText) {
      onChangeText(text);
    }
  }

  render() {
    return (
      <View>
        {this.props.error != '' && this.props.error != null && (
          <View style={styles.errorBar}></View>
        )}
        <TextField
          label={this.props.label}
          title={this.props.title}
          autoFocus={this.props.autoFocus}
          value={this.props.value}
          error={this.props.error}
          autoCapitalize={this.props.autoCapitalize}
          ref={this.props.refProp}
          onBlur={this.onBlur}
          onChangeText={this.onChangeText}
          returnKeyType={this.props.returnKeyType}
          secureTextEntry={this.props.secureTextEntry}
          keyboardType={this.props.keyboardType}
          formatText={this.props.formatText}
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          textColor="black"
          errorColor={RWBColors.magenta}
          lineWidth={1.0}
          labelTextStyle={globalStyles.formLabel}
          titleTextStyle={globalStyles.errorMessage}
          style={globalStyles.formInput}
          tintColor="black"
          selectionColor={Platform.OS === 'ios' ? 'black' : RWBColors.grey20}
          multiline={this.props.multiline}
          fontSize={12}
          titleFontSize={9}
          labelFontSize={9}
          onSubmitEditing={
            this.props.onSubmitEditing
              ? this.props.onSubmitEditing
              : () => {
                  return;
                }
          }
          blurOnSubmit={this.props.blurOnSubmit}
          characterRestriction={this.props.characterRestriction}
          lineType={this.props.lineType}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  errorBar: {
    position: 'absolute',
    left: Dimensions.get('window').width * -0.05,
    top: '20%',
    backgroundColor: RWBColors.magenta,
    width: 7,
    height: '80%',
  },
});
