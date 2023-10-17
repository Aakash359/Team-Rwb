import React, {Component} from 'react';
import {
  View,
  Text,
  Modal,
  SafeAreaView,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import {rwbApi} from '../../shared/apis/api';
import {version as appVersion} from '../../package.json';
import {isUpdateNeeded} from '../../shared/utils/Helpers';
import globalStyles, {RWBColors} from '../styles';
import RWBButton from './RWBButton';
const GOOGLE_PACKAGE_NAME = 'com.teamrwb';

export default class UpdateApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      updateModalDisplayed: false,
    };
  }

  componentDidMount() {
    // load call to get minimum version
    rwbApi
      .getAppVersion()
      .then((requiredVersion) => {
        // this.setState({
        //   updateModalDisplayed: isUpdateNeeded(appVersion, requiredVersion)
        // });
      })
      .catch((err) => {
        // Do nothing on error
      });
  }

  updateButton = () => {
    if (Platform.OS != 'ios') {
      Linking.openURL(
        `market://details?id=${GOOGLE_PACKAGE_NAME}`,
      ).catch((err) => alert('Please check the Google Play Store'));
    } else {
      Linking.openURL(
        // this link opens directly to the app store link
        `itms://itunes.apple.com/us/app/apple-store/id1460324981?mt=8`,
        // this link (currently used for rate my app) opens a web page with a link
        // `https://apps.apple.com/us/app/id1460324981?mt=8`
      ).catch((err) => alert('Please check the App Store'));
    }
  };

  render() {
    return (
      <Modal visible={this.state.updateModalDisplayed} transparent={true}>
        <SafeAreaView style={styles.overlayView}>
          <View style={styles.contentContainer}>
            <Text style={[globalStyles.h2, {marginTop: 15}]}>
              Update your App
            </Text>
            <Text style={[globalStyles.bodyCopy, {marginTop: 15}]}>
              Update to the latest version of the app to get the newest
              features!
            </Text>
            <View style={styles.buttonContainer}>
              <RWBButton
                text="Update"
                buttonStyle="primary"
                customStyles={{width: '80%'}}
                accessibilityLabel="Go to update to the latest version of the app"
                onPress={this.updateButton}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  overlayView: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    backgroundColor: RWBColors.white,
    height: 350,
    width: 300,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
});
