import React from 'react';
import {StyleSheet, Dimensions, SafeAreaView, Animated} from 'react-native';
import gobalStyles, {RWBColors} from '../styles';

export default class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.animatedModal = this.animatedModal.bind(this);
  }

  componentDidMount() {
    this.animatedTopPosition = new Animated.Value(
      Dimensions.get('window').height,
    );
  }

  animatedModal() {
    Animated.timing(this.animatedTopPosition, {
      toValue: 0,
      duration: 65,
    }).start();
  }

  render() {
    const animatedStyle = {top: this.animatedTopPosition};
    return (
      <SafeAreaView style={[{flex: 1}, this.props.style]}>
        <Animated.View
          style={[styles.modalWindow, animatedStyle]}
          onLayout={this.animatedModal}>
          {this.props.children}
        </Animated.View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  modalWindow: {
    flex: 1,
    justifyContent: 'flex-end',
    margin: 25,
    padding: 16,
    backgroundColor: RWBColors.white,
  },
});
