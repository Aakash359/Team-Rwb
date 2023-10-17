import React from 'react';
import {View, Keyboard, Dimensions, Platform} from 'react-native';

export default class KeyboardAvoidScrollview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keyboardIsShowing: false,
    };
    this._keyboardDidHide = this._keyboardDidHide.bind(this);
    this._keyboardDidShow = this._keyboardDidShow.bind(this);
  }

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide,
    );
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow() {
    this.setState({keyboardIsShowing: true});
  }

  _keyboardDidHide() {
    this.setState({keyboardIsShowing: false});
  }

  render() {
    let screenHeight = Math.round(Dimensions.get('window').height);
    var keyboardAvoid;
    if (screenHeight >= 800) {
      keyboardAvoid = screenHeight / 3;
    } else if (screenHeight >= 690 && screenHeight < 800) {
      keyboardAvoid =
        Platform.OS === 'ios'
          ? screenHeight / 3.5 + 64
          : screenHeight / 3.2 + 64;
    } else {
      keyboardAvoid =
        Platform.OS === 'ios'
          ? screenHeight / 3.75 + 64
          : screenHeight / 3.2 + 64;
    }

    return (
      <View>
        {this.props.children}
        {this.state.keyboardIsShowing == true && (
          <View style={{height: keyboardAvoid}}></View>
        )}
      </View>
    );
  }
}
