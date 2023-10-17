import React, {Component} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {logFollow, logUnfollow} from '../../shared/models/Analytics';
import {RWBColors} from '../styles';

export default class FollowButton extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleLog = () => {
    if (this.props.isFollowing) logUnfollow();
    else logFollow();
  };

  render() {
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            this.handleLog();
            this.props.onPress();
          }}
          accessibilityRole={'button'}
          accessible={true}
          accessibilityLabel={
            !this.props.isFollowing
              ? `Follow ${this.props.name}`
              : `Unfollow ${this.props.name}`
          }
          style={{
            width: this.props.width ? this.props.width : 96,
            paddingVertical: 12,
            marginBottom: 0,
            backgroundColor: this.props.isFollowing
              ? RWBColors.magenta
              : RWBColors.grey20,
            borderRadius: 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={[
              {
                color: this.props.isFollowing
                  ? RWBColors.white
                  : RWBColors.grey80,
              },
              styles.Label,
            ]}>
            {this.props.isFollowing ? 'Unfollow' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  Label: {
    fontFamily: 'OpenSans-Extrabold',
    fontSize: 12,
    lineHeight: 14,
    textAlign: 'center',
  },
});
