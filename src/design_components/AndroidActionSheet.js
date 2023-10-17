import React, {Component} from 'react';
import {View, StyleSheet, Modal} from 'react-native';

import RWBSheetButton from './RWBSheetButton';

export default class AndroidAction extends Component {
  constructor(props) {
    super(props);
  }

  hideSheet = () => {
    this.props.hide();
  };

  render() {
    const {cancelable} = this.props;
    return (
      <Modal transparent>
        <View style={styles.actionSheet}>
          {this.props.children}
          {cancelable ? (
            <RWBSheetButton text="Cancel" onPress={this.hideSheet} />
          ) : null}
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  actionSheet: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    paddingHorizontal: '10%',
    paddingBottom: '5%',
    backgroundColor: 'rgba(0,0,0,0.75)',
    bottom: 0,
    justifyContent: 'flex-end',
  },
});
