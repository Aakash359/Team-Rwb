import React from 'react';
import {View, TouchableOpacity, Image} from 'react-native';
import globalStyles, {RWBColors} from '../styles';

export default class NotificationCard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.onPress();
        }}
        accessible={true}
        accessibilityRole={'button'}
        accessibilityLabel={this.props.accessibilityLabel}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 20,
            paddingHorizontal: '5%',
            borderBottomColor: RWBColors.grey20,
            borderBottomWidth: 1,
          }}>
          <Image
            style={globalStyles.mediumProfileImage}
            source={
              this.props.userIcon
                ? {uri: this.props.userIcon}
                : require('../../shared/images/DefaultProfileImg.png')
            }
            accessible
            accessibilityLabel={`profile`}
            accessibilityRole={'image'}
          />
          <View style={{marginLeft: 10, flexShrink: 1}}>{this.props.text}</View>
        </View>
      </TouchableOpacity>
    );
  }
}
