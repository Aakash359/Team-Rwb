import React, {PureComponent} from 'react';
import {View, Image, TouchableOpacity} from 'react-native';

import UploadPhotoIcon from '../../svgs/UploadPhotoIcon';
import globalStyles, {RWBColors} from '../styles';

export default class RWBUserImages extends PureComponent {
  render() {
    const {
      editable,
      coverPhoto,
      editCoverPhoto,
      profilePhoto,
      editProfilePhoto,
    } = this.props;
    return (
      <View style={globalStyles.imageContainer}>
        <View style={globalStyles.coverImageContainer}>
          <Image
            style={globalStyles.coverImage}
            source={coverPhoto ? {uri: coverPhoto} : null}
          />
          {editable ? (
            <TouchableOpacity
              style={globalStyles.coverEditContainer}
              onPress={editCoverPhoto}>
              <UploadPhotoIcon
                tintColor={RWBColors.white}
                style={globalStyles.editImageIcon}
              />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={globalStyles.profileImageContainer}>
          <Image
            style={globalStyles.profileImage}
            source={
              profilePhoto
                ? {uri: profilePhoto}
                : require('../../shared/images/DefaultProfileImg.png')
            }
          />
          {editable ? (
            <TouchableOpacity
              style={globalStyles.profileEditContainer}
              onPress={editProfilePhoto}>
              <UploadPhotoIcon
                tintColor={RWBColors.white}
                style={globalStyles.editImageIcon}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }
}
