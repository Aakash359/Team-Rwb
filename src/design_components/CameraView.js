import React from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import RWBButton from './RWBButton';
import {RNCamera} from 'react-native-camera';
import Modal from './Modal';

const DESIRED_RATIO = '3:4';
export default class CameraView extends React.Component {
  constructor() {
    super();
    this.state = {};
    this.takePicture = this.takePicture.bind(this);
  }

  takePicture = async function () {
    if (this.camera) {
      const options = {
        width: 300,
        quality: 0.5,
        base64: true,
        fixOrientation: true,
        orientation: 'portrait',
      };
      const data = await this.camera.takePictureAsync(options);
      this.capturedPhoto = data;
      this.props.navigation.state.params.onCameraDismiss(this.capturedPhoto);
      this.props.navigation.goBack();
    }
  };

  prepareRatio = async () => {
    if (Platform.OS === 'android' && this.cam) {
      const ratios = await this.cam.getSupportedRatiosAsync();

      // See if the current device has your desired ratio, otherwise get the maximum supported one
      // Usually the last element of "ratios" is the maximum supported ratio
      const ratio =
        ratios.find((ratio) => ratio === DESIRED_RATIO) ||
        ratios[ratios.length - 1];

      this.setState({ratio});
    }
  };

  render() {
    return (
      <Modal>
        <View style={{flex: 1}}>
          <RNCamera
            ref={(cam) => (this.cam = cam)}
            onCameraReady={this.prepareRatio} // You can only get the supported ratios when the camera is mounted
            ratio={this.state.ratio}
            style={styles.preview}
            captureAudio={false}
            type={
              this.props.navigation.state.params.facing &&
              this.props.navigation.state.params.facing === 'back'
                ? RNCamera.Constants.Type.back
                : RNCamera.Constants.Type.front
            }
            androidCameraPermissionOptions={{
              title: 'Permission to use camera',
              message: 'We need your permission to use your camera phone',
            }}
            ref={(ref) => {
              this.camera = ref;
            }}
          />

          <View style={styles.fixedFooter}>
            <RWBButton
              buttonStyle="primary"
              text="TAKE PHOTO"
              onPress={() => {
                this.takePicture();
              }}
            />
            <RWBButton
              buttonStyle="secondary"
              text="Cancel"
              onPress={() => {
                this.props.navigation.goBack();
              }}
            />
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  fixedFooter: {
    flex: 0,
    margin: 0,
    paddingTop: 25,
    paddingHorizontal: 25,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
