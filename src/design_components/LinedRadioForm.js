import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import RadioForm, {RadioButton} from 'react-native-simple-radio-button';

import globalStyles, {RWBColors} from '../styles';

export default class LinedRadioForm extends RadioForm {
  // override this method so we can add wrapStyle prop, and do other styling
  _renderButton(obj, i) {
    return (
      <View key={i}>
        {this.props.error != '' && this.props.error != null && (
          <View style={styles.errorBar}></View>
        )}
        <RadioButton
          accessible={this.props.accessible}
          accessibilityLabel={`${obj.label} `}
          testID={
            this.props.testID
              ? this.props.testID + '|' + i
              : 'radioButton' + '|' + i
          }
          isSelected={this.state.is_active_index === i}
          obj={obj}
          key={i}
          index={i}
          initial={this.props.initial}
          buttonColor={
            this.state.is_active_index === i ? RWBColors.grey : RWBColors.grey
          }
          buttonSize={12}
          buttonOuterSize={12}
          buttonStyle={{borderWidth: 1, top: 6, marginVertical: 8}}
          wrapStyle={
            this.props.arrayLength - 1 === i
              ? styles.lastWrapper
              : styles.wrapper
          }
          labelHorizontal={this.props.labelHorizontal}
          labelColor={
            this.state.is_active_index === i
              ? this.props.selectedLabelColor
              : this.props.labelColor
          }
          labelStyle={[
            globalStyles.bodyCopyForm,
            this.props.labelStyle,
            {flex: 1, paddingVertical: 8, top: 2},
          ]}
          style={this.props.radioStyle}
          // animation={this.props.animation}
          // this setting turns on LayoutAnimation for the whole project and fubars everything
          animation={false}
          disabled={this.props.disabled}
          onPress={(value, index) => {
            this.props.onPress(value, index);
            this.setState({is_active_index: index});
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  errorBar: {
    position: 'absolute',
    left: Dimensions.get('window').width * -0.05,
    top: -24,
    backgroundColor: RWBColors.magenta,
    width: 7,
    height: 94,
  },
  wrapper: {
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: RWBColors.grey8,
  },
  lastWrapper: {
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: RWBColors.grey8,
    marginBottom: 10,
  },
});
