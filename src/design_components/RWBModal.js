import React, {PureComponent} from 'react';
import {View, Text, SafeAreaView, Modal} from 'react-native';

import globalStyles, {RWBColors} from '../styles';

export default class RWBModal extends PureComponent {
  render() {
    return (
      <Modal
        visible={this.props.visible}
        onRequestClose={this.props.onRequestClose}
        onDismiss={this.props.onDismiss}
        onShow={this.props.onShow}>
        <SafeAreaView style={{flex: 1, backgroundColor: '#FFFB'}}>
          <View
            style={[
              globalStyles.scrollArea,
              globalStyles.modalWindow,
              {backgroundColor: '#0008'},
            ]}>
            <View style={{flex: 1, backgroundColor: RWBColors.white}}>
              {this.props.header ? (
                <Text
                  style={[
                    globalStyles.h2,
                    {paddingBottom: 12, paddingTop: 12, textAlign: 'center'},
                  ]}>
                  {this.props.header}
                </Text>
              ) : null}
              {this.props.children}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }
}
