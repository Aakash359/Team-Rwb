import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import FollowButton from '../design_components/FollowButton';
import NavigationService from '../models/NavigationService';
import {rwbApi} from '../../shared/apis/api';

import globalStyles, {RWBColors} from '../styles';

import AdminIcon from '../../svgs/AdminIcon';
import EagleLeaderIcon from '../../svgs/EagleLeaderIcon';

export default class UserCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false, // add a spinner after choosing to follow someone or not?
      isFollowing: this.props.user.following,
    };
  }

  updateFollowState = () => {
    const {user} = this.props;
    const {isFollowing} = this.state;
    this.setState({isLoading: true});
    if (isFollowing) {
      this.setState({isFollowing: false});
      rwbApi
        .unfollowUser(user.id)
        .then(() => {})
        .catch((error) => {
          Alert.alert(
            'Team RWB',
            'Error unfollowing user, please try again later.',
          );
          this.setState({isFollowing: true});
          console.error(error);
        })
        .finally(() => {
          this.setState({isLoading: false});
        });
    } else {
      this.setState({isFollowing: true});
      rwbApi
        .followUser(user.id)
        .then(() => {})
        .catch((error) => {
          this.setState({isFollowing: false});
          Alert.alert(
            'Team RWB',
            'Error following user, please try again later.',
          );
          console.error(error);
        })
        .finally(() => {
          this.setState({isLoading: false});
        });
    }
  };

  insideOfTouchable = () => {
    const {
      eagle_leader,
      first_name,
      last_name,
      military_branch,
      military_status,
      preferred_chapter,
      profile_photo_url,
    } = this.props.user;
    return (
      <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
        <View style={{marginRight: 10, position: 'relative'}}>
          <Image
            style={[globalStyles.mediumProfileImage]}
            source={
              profile_photo_url
                ? {uri: profile_photo_url}
                : require('../../shared/images/DefaultProfileImg.png')
            }
          />
          {this.props.isSponsor && (
            <View style={{position: 'absolute', bottom: 0, left: 40}}>
              <AdminIcon height={14} width={14} />
            </View>
          )}
        </View>
        <View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={[
                globalStyles.h3,
                {paddingBottom: 0},
              ]}>{`${first_name} ${last_name}`}</Text>
            {eagle_leader ? <EagleLeaderIcon height={20} width={20} /> : null}
          </View>
          {this.props.isSponsor && (
            <Text style={[globalStyles.h5, styles.userInfo]}>Group Leader</Text>
          )}
          {eagle_leader ? (
            <Text style={[globalStyles.h5, styles.userInfo]}>Eagle Leader</Text>
          ) : null}

          {preferred_chapter.name ? (
            <Text
              style={[
                globalStyles.bodyCopyForm,
                styles.userInfo,
                {letterSpacing: Platform.OS === 'android' ? -0.2 : 0},
              ]}>
              {preferred_chapter.name}
            </Text>
          ) : null}
          {military_status && military_status !== 'Unknown' ? (
            <Text style={[globalStyles.bodyCopyForm, styles.userInfo]}>
              {military_status !== 'Civilian'
                ? `${military_status}/${military_branch}`
                : military_status !== 'Unknown' && military_status !== null
                ? military_status
                : null}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  render() {
    const {first_name, last_name, id} = this.props.user;
    const {isFollowing} = this.state;
    return (
      <View style={styles.container}>
        <View
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          {this.props.onPress ? (
            <TouchableOpacity
              style={{flex: 1, flexDirection: 'row'}}
              onPress={() =>
                this.props.onPress({name: `${first_name} ${last_name}`, id})
              }
              accessibilityRole={'button'}
              accessible={true}
              accessibilityLabel={`Select ${first_name} ${last_name}`}>
              {this.insideOfTouchable()}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{flex: 1, flexDirection: 'row'}}
              onPress={() =>
                NavigationService.navigateIntoInfiniteStack(
                  this.props.stack === 'group'
                    ? 'GroupProfileAndEventDetailsStack'
                    : 'EventsProfileAndEventDetailsStack',
                  'profile',
                  {id},
                )
              }
              accessibilityRole={'button'}
              accessible={true}
              accessibilityLabel={`Go to ${first_name} ${last_name}'s profile`}>
              {this.insideOfTouchable()}
            </TouchableOpacity>
          )}

          {this.props.followable ? (
            <View style={{flexDirection: 'row-reverse'}}>
              <FollowButton
                isFollowing={isFollowing}
                name={`${first_name} ${last_name}`}
                onPress={this.updateFollowState}
              />
            </View>
          ) : null}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomColor: RWBColors.grey40,
    borderBottomWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: '5%',
    width: '100%',
  },
  userInfo: {
    width: Dimensions.get('window').width * 0.9 - 165,
    margin: 0,
    padding: 0,
  },
});
