import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  PermissionsAndroid,
  Alert,
  Platform,
} from 'react-native';

import {RNCamera} from 'react-native-camera';
import XIcon from '../../svgs/XIcon';
import {RWBColors} from '../styles';
import CameraRollModal from './CameraRollModal';
import RWBModal from './RWBModal';
import FlipCameraIcon from '../../svgs/FlipCameraIcon';
import FlashOffIcon from '../../svgs/FlashOffIcon';
import FlashOnIcon from '../../svgs/FlashOnIcon';
import FlashAutoIcon from '../../svgs/FlashAutoIcon';

const DESIRED_RATIO = '3:4';

export default class FullscreenCameraModal extends React.Component {
  constructor() {
    super();
    this.state = {
      flashMode: RNCamera.Constants.FlashMode.off,
      type: RNCamera.Constants.Type.back,
      galleryVisible: false,
    };
  }

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

  takePicture = async () => {
    if (this.camera) {
      const options = {
        pauseAfterCapture: true,
      };
      this.setState({isLoading: true});
      let data = await this.camera.takePictureAsync(options);
      this.props.onGetPhoto(data);
      this.setState({isLoading: false});
      this.props.closeModal();
    }
  };

  openGallery = () => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      )
        .then((granted) => {
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            this.setState({
              galleryVisible: true,
            });
          } else {
            throw new Error('Permissions not granted');
          }
        })
        .catch((error) => {
          Alert.alert(
            'Team RWB',
            "Team RWB needs your permission to access your photo library.\nPlease change your permissions in Android's settings.",
          );
        });
    } else if (Platform.OS === 'ios') {
      this.setState({
        galleryVisible: true,
      });
    }
  };

  toggleFlash = () => {
    this.setState({
      flashMode:
        this.state.flashMode === RNCamera.Constants.FlashMode.off
          ? RNCamera.Constants.FlashMode.on
          : RNCamera.Constants.FlashMode.off,
    });
  };

  toggleCameraType = () => {
    this.setState({
      type:
        this.state.type === RNCamera.Constants.Type.back
          ? RNCamera.Constants.Type.front
          : RNCamera.Constants.Type.back,
    });
  };

  onGetGalleryPhoto = (photo) => {
    if (!photo) {
      return;
    }
    this.props.onGetPhoto(photo);
    this.props.closeModal();
  };

  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          ref={(cam) => (this.cam = cam)}
          onCameraReady={this.prepareRatio} // You can only get the supported ratios when the camera is mounted
          ratio={this.state.ratio}
          style={styles.preview}
          captureAudio={false}
          type={this.state.type}
          flashMode={this.state.flashMode}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera phone',
          }}
          ref={(ref) => {
            this.camera = ref;
          }}
        />

        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel={'Close Camera'}
            accessibilityRole={'button'}
            onPress={() => this.props.closeModal()}
            style={{height: 24, width: 24, left: 0}}>
            <XIcon
              tintColor={RWBColors.white}
              style={{height: 24, width: 24}}
            />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel={'Toggle Flash'}
            accessibilityRole={'button'}
            onPress={this.toggleFlash}
            style={{height: 24, width: 24, right: 0}}>
            {this.state.flashMode === RNCamera.Constants.FlashMode.off && (
              <FlashOffIcon
                tintColor={RWBColors.white}
                style={{height: 24, width: 24}}
              />
            )}
            {this.state.flashMode === RNCamera.Constants.FlashMode.on && (
              <FlashOnIcon
                tintColor={RWBColors.white}
                style={{height: 24, width: 24}}
              />
            )}
            {this.state.flashMode === RNCamera.Constants.FlashMode.auto && (
              <FlashAutoIcon
                tintColor={RWBColors.white}
                style={{height: 24, width: 24}}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            accessibilityLabel={'Flip Camera View'}
            accessibilityRole={'button'}
            onPress={this.toggleCameraType}
            style={{height: 36, width: 36}}>
            <FlipCameraIcon
              tintColor={RWBColors.white}
              style={{height: 36, width: 36}}
            />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel={'Take Picture'}
            accessibilityRole={'button'}
            onPress={this.takePicture}
            style={{height: 80, width: 80}}>
            <View
              style={{
                backgroundColor: RWBColors.magenta,
                height: 80,
                width: 80,
                borderRadius: 40,
              }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel={'View Gallery'}
            accessibilityRole={'button'}
            onPress={() => this.openGallery()}
            style={{
              height: 36,
              width: 36,
              borderWidth: 4,
              borderColor: RWBColors.white,
              borderRadius: 8,
            }}>
            {/* Gallery Img */}
          </TouchableOpacity>
        </View>
        <RWBModal visible={this.state.galleryVisible}>
          <CameraRollModal
            onGetPhoto={this.onGetGalleryPhoto}
            closeModal={() => this.setState({galleryVisible: false})}
          />
        </RWBModal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  header: {
    position: 'absolute',
    top: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    flex: 1,
    width: '90%',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
