import React, {Component} from 'react';
import {View, Text, FlatList, ActivityIndicator} from 'react-native';
import UserCard from './UserCard';
import globalStyles, {RWBColors} from '../styles';

export default class FollowList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {data, refreshing, onRefresh, emptyMessage, type} = this.props;
    return (
      <View style={{height: '100%', width: '100%'}}>
        <FlatList
          data={data}
          extraData={this.props.extraData}
          keyExtractor={(item, index) => {
            return `${item.id}`;
          }}
          renderItem={({item}) =>
            // users follow events when they set a status on one
            /* in order to keep the offset proper for loading more events, these event follows
             will still be saved, but not displayed */
            item.first_name ? (
              <UserCard
                user={item}
                // hide the follow button if the user is the logged in user, or if it is an anonymous account
                followable={
                  this.props.loggedInID !== item.id && item.public_profile
                }
              />
            ) : null
          }
          refreshing={refreshing}
          onEndReached={({distanceFromEnd}) => {
            if (distanceFromEnd < 0) return;
            this.props.onEnd();
          }}
          onRefresh={() => onRefresh(type)}
          ListFooterComponent={
            this.props.isLoadingMore ? (
              <View>
                <ActivityIndicator size="large" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={{height: '100%', padding: '5%', alignItems: 'center'}}>
              <Text style={[globalStyles.bodyCopy, {textAlign: 'center'}]}>
                {emptyMessage}
              </Text>
            </View>
          }
        />
      </View>
    );
  }
}
