import React, {PureComponent} from 'react';
import {
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Keyboard,
} from 'react-native';

import globalStyles, {RWBColors} from '../styles';

// SVGs
import SearchIcon from '../../svgs/SearchIcon';
import ClearSearchIcon from '../../svgs/ClearSearchIcon';
import LocationIcon from '../../svgs/LocationIcon';

// To avoid multiple ternaries in search box with more styles, this component exists with the same functionality but already stylized in the format for two searchboxes together
class DualSearchBar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      leftClearSearchShowing: false,
      rightClearSearchShowing: false,
    };
  }

  leftClearSearch = () => {
    const {leftOnClearSearchPressed} = this.props;
    Keyboard.dismiss();
    this.setState({leftClearSearchShowing: false}, () =>
      leftOnClearSearchPressed(),
    );
  };

  rightClearSearch = () => {
    const {rightOnClearSearchPressed} = this.props;
    Keyboard.dismiss();
    this.setState({rightClearSearchShowing: false}, () =>
      rightOnClearSearchPressed(),
    );
  };

  leftOnSubmitSearch = () => {
    const {leftSearchSubmit} = this.props;
    this.setState({leftClearSearchShowing: true}, () => leftSearchSubmit());
  };

  rightOnSubmitSearch = () => {
    const {rightSearchSubmit} = this.props;
    this.setState({rightClearSearchShowing: true}, () => rightSearchSubmit());
  };

  leftonFocus = () => {
    this.props.leftFocusedEvent();
  };

  rightOnFocus = () => {
    // NOTE: this will need fine tuning when not using the event location elsewhere
    this.props.rightOnClearSearchPressed('');
    this.props.rightFocusedEvent();
  };

  render() {
    const {
      leftSearch,
      leftOnSearchTextChange,
      leftOnFocus,
      leftPropClearSearchShowing,
      leftClearText,
      leftPlaceholder,

      rightSearch,
      rightOnSearchTextChange,
      rightOnFocus,
      rightPropClearSearchShowing,
      rightClearText,
      rightPlaceholder,
    } = this.props;
    const {leftClearSearchShowing, rightClearSearchShowing} = this.state;
    return (
      <View style={{flexDirection: 'row', justifyContent: 'center'}}>
        {/* Left input */}
        <View style={[styles.inputContainer, styles.leftContainer]}>
          <SearchIcon style={[styles.icon, {marginRight: 5, marginLeft: 5}]} />
          <TextInput
            style={[globalStyles.formInput, {width: '80%', height: 34, top: 2}]}
            autoCorrect={false}
            placeholder={leftPlaceholder || 'Search'}
            placeholderTextColor={RWBColors.grey40}
            clearTextOnFocus={
              leftClearText !== undefined ? leftClearText : true
            }
            returnKeyType={'search'}
            onSubmitEditing={this.leftOnSubmitSearch}
            onChangeText={leftOnSearchTextChange}
            value={leftSearch}
            onFocus={this.leftOnFocus}
          />
          {(leftClearSearchShowing || leftPropClearSearchShowing) && (
            <View style={styles.clearContainer}>
              <TouchableOpacity
                style={{height: 24, width: 24}}
                onPress={this.leftClearSearch}>
                <ClearSearchIcon style={{height: 24, width: '100%'}} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        {/* Right input */}
        <View style={[styles.inputContainer, styles.rightContainer]}>
          <LocationIcon style={styles.icon} />
          <TextInput
            style={[
              globalStyles.formInput,
              {width: '100%', height: 34, top: 2},
            ]}
            autoCorrect={false}
            placeholder={rightPlaceholder || 'Search'}
            placeholderTextColor={RWBColors.grey40}
            clearTextOnFocus={
              rightClearText !== undefined ? rightClearText : true
            }
            returnKeyType={'search'}
            onSubmitEditing={this.rightOnSubmitSearch}
            onChangeText={rightOnSearchTextChange}
            value={rightSearch}
            onFocus={this.rightOnFocus}
          />
          {(rightClearSearchShowing || rightPropClearSearchShowing) && (
            <View style={styles.clearContainer}>
              <TouchableOpacity
                style={{height: 24, width: 24}}
                onPress={this.rightClearSearch}>
                <ClearSearchIcon style={{height: 24, width: '100%'}} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: RWBColors.white,
    padding: 4,
    borderRadius: 2,
    width: '45%',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  leftContainer: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 1,
    borderRightColor: RWBColors.grey20,
  },
  rightContainer: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  icon: {
    height: 24,
    width: '20%',
    top: 2,
  },
  clearContainer: {
    height: 24,
    width: '100%',
    zIndex: 2,
    position: 'absolute',
    flexDirection: 'row-reverse',
  },
});

export default DualSearchBar;
