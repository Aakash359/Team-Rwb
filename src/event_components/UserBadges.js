import React, {Component} from 'react';
import {Animated} from 'react-native';

import globalStyles, {RWBColors} from '../styles';

export default class UserBadges extends Component {
  constructor(props) {
    super(props);
    this.fadeAnimation = new Animated.Value(0);
  }

  componentDidMount() {
    Animated.timing(this.fadeAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }

  render() {
    let userIcons = [];
    let userList = this.props.userList;
    if (userList.length > 0) {
      userIcons = userList.slice(0, 9).map((user, index, array) => {
        return (
          <Animated.Image
            key={user.id.toString().concat(index.toString())}
            style={[
              globalStyles.smallProfileImage,
              {left: index * -10, opacity: this.fadeAnimation},
            ]}
            source={
              user.profile_photo_url
                ? {uri: user.profile_photo_url}
                : require('./../../shared/images/DefaultProfileImg.png')
            }
            resizeMethod={'resize'}
          />
        );
      });
    }
    return userIcons;
  }
}
