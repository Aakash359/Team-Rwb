import React, {PureComponent} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Alert,
  Modal,
} from 'react-native';
import ImageResizer from 'react-native-image-resizer';

import FullscreenCameraModal from './FullscreenCameraModal';
import CameraRollModal from './CameraRollModal';

import GalleryIcon from '../../svgs/GalleryIcon';
import UploadPhotoIcon from '../../svgs/UploadPhotoIcon';

import RWBModal from './RWBModal';
import {RWBColors} from '../styles';

export default class PhotoController extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      cameraVisible: false,
      galleryVisible: false,
    };
    const {type} = props;
    if (type !== 'camera' && type !== 'gallery') {
      throw new Error(
        `props.type must be one of: 'camera', 'gallery', got: ${type}`,
      );
    }
  }

  onPress = () => {
    const {type} = this.props;
    if (type === 'camera') {
      this.openCamera();
    } else if (type === 'gallery') {
      this.openGallery();
    }
  };

  onGetPhoto = (photo) => {
    if (!photo) {
      return;
    }
    const {handlePhoto} = this.props;
    this.resizePhoto(photo).then((resizedPhoto) => {
      handlePhoto(resizedPhoto);
    });
  };

  openCamera = () => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
        .then((granted) => {
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            this.setState({
              cameraVisible: true,
            });
          } else {
            throw new Error('Permissions not granted');
          }
        })
        .catch((error) => {
          Alert.alert(
            'Team RWB',
            "Team RWB needs your permission to access your camera.\nPlease change your permissions in Android's settings.",
          );
        });
    } else {
      this.setState({
        cameraVisible: true,
      });
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

  closeModal = () => {
    this.setState({
      cameraVisible: false,
      galleryVisible: false,
    });
  };

  resizePhoto = (photo) => {
    let uri;
    // select image from gallery
    if (!photo.uri) uri = photo.image.uri;
    // take picture
    else uri = photo.uri;
    return ImageResizer.createResizedImage(uri, 500, 500, 'JPEG', 85, 0);
  };

  render() {
    const {type} = this.props;
    return (
      <View>
        <TouchableOpacity style={styles.iconWrapper} onPress={this.onPress}>
          {type === 'camera' ? (
            <UploadPhotoIcon
              tintColor={RWBColors.white}
              style={styles.iconView}
            />
          ) : (
            <GalleryIcon tintColor={RWBColors.white} style={styles.iconView} />
          )}
        </TouchableOpacity>
        <Modal
          style={{width: '100%', height: '100%'}}
          visible={this.state.cameraVisible}
          onRequestClose={() => this.setState({cameraVisible: false})}>
          <FullscreenCameraModal
            onGetPhoto={this.onGetPhoto}
            closeModal={this.closeModal}
          />
        </Modal>
        <RWBModal visible={this.state.galleryVisible}>
          <CameraRollModal
            onGetPhoto={this.onGetPhoto}
            closeModal={this.closeModal}
          />
        </RWBModal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  iconWrapper: {
    padding: 10,
    margin: 10,
  },
  iconView: {
    width: 34,
    height: 32,
  },
});
