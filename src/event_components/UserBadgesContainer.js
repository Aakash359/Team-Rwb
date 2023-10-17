import React, {Component} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import ThumbnailLoading from './ThumbnailLoading';
import UserBadges from './UserBadges';

import globalStyles, {RWBColors} from '../styles';
// SVGs
import ChevronRightIcon from '../../svgs/ChevronRightIcon';

export default class UserBadgesContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {usersLoading, onPress, numberOfUsers, text} = this.props;
    return usersLoading ? (
      <View style={{marginBottom: 15}}>
        <ThumbnailLoading />
      </View>
    ) : (
      <TouchableOpacity
        disabled={usersLoading}
        onPress={onPress}
        style={usersLoading ? {opacity: 0.5} : {opacity: 1}}>
        <View style={styles.detailBlock}>
          <View style={styles.badgeContainer}>
            <UserBadges userList={this.props.userList} />
          </View>
          {numberOfUsers > 0 ? (
            <View style={styles.textContainer}>
              <Text style={[globalStyles.link]}>
                {numberOfUsers}
                {text && ` ${text}`}
              </Text>
              <View>
                <ChevronRightIcon style={styles.iconView} />
              </View>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  detailBlock: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconView: {
    width: 16,
    height: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
