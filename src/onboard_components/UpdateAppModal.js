import React, {Component} from 'react';
import {View, Text, Linking, Modal} from 'react-native';
import RWBButton from '../design_components/RWBButton';
import globalStyles, {RWBColors} from '../styles';

const GOOGLE_PACKAGE_NAME = 'com.teamrwb';

export default class UpdateAppModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  openStore = () => {
    //This is the main trick
    if (Platform.OS != 'ios') {
      Linking.openURL(
        `market://details?id=${GOOGLE_PACKAGE_NAME}`,
      ).catch((err) => alert('Please check for the Google Play Store'));
    } else {
      Linking.openURL(
        `https://apps.apple.com/us/app/id1460324981?mt=8`,
      ).catch((err) => alert('Please check for the App Store'));
    }
  };

  render() {
    return (
      <Modal visible={this.props.showUpdateModal} transparent={true}>
        <View style={globalStyles.modalWindow}>
          <View
            style={{justifyContent: 'flex-end', alignItems: 'center', flex: 1}}>
            <Text style={globalStyles.h1}>Update Required</Text>
            <Text />
            <Text style={globalStyles.bodyCopy}>
              The version of Team RWB that you are using is out of date. You
              must update your app to continue using it.
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              alignItems: 'center',
              marginBottom: 20,
            }}>
            <RWBButton
              buttonStyle="primary"
              text="Update App"
              onPress={this.openStore}
            />
          </View>
        </View>
      </Modal>
    );
  }
}
