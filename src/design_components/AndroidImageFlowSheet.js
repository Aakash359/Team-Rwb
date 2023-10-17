import React, {Component} from 'react';
import {View, Alert, StyleSheet, PermissionsAndroid} from 'react-native';

import RWBSheetButton from './RWBSheetButton';

import NavigationService from '../models/NavigationService';

export default class AndroidImageFlowSheet extends Component {
  constructor(props) {
    super(props);
  }

  requestAndroidPerms = () => {
    return PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );
  };

  onCameraDismiss = (photo) => {
    this.props.save(photo);
  };

  hideSheet = () => {
    this.props.hide();
  };

  removeImage = () => {
    this.props.removeImage();
  };

  render() {
    const {showDelete} = this.props;
    return (
      <View style={styles.actionSheet}>
        <RWBSheetButton
          text="Take Photo"
          onPress={() => {
            NavigationService.navigate('CameraModal', {
              onCameraDismiss: (photo) => this.onCameraDismiss(photo),
              facing: this.props.facing,
            });
          }}
        />
        <RWBSheetButton
          text="Choose From Library"
          onPress={() => {
            this.requestAndroidPerms()
              .then((granted) => {
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                  NavigationService.navigate('CameraRollModal', {
                    onCameraRollDismiss: (photo) => this.onCameraDismiss(photo),
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
          }}
        />
        {showDelete ? (
          <RWBSheetButton
            text="Remove Photo"
            onPress={() => {
              this.removeImage();
              this.hideSheet();
            }}
          />
        ) : null}
        <RWBSheetButton text="Cancel" onPress={this.hideSheet} />
      </View>
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
