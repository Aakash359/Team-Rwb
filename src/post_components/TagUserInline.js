import React, {Component} from 'react';
import {View, Text, ActivityIndicator, FlatList} from 'react-native';
import globalStyles, {RWBColors} from '../styles';
import UserCard from '../design_components/UserCard';

// this file is for the "box" that appears when typing an "@"
export default class TagUserInline extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return this.props.searchingUsers ? (
      this.props.userSearchLoading ? (
        <View
          style={{
            height: 390,
            width: '100%',
            backgroundColor: RWBColors.grey8,
            borderRadius: 5,
            justifyContent: 'center',
          }}>
          <ActivityIndicator animating size="large" />
        </View>
      ) : (
        <FlatList
          keyboardShouldPersistTaps={'always'}
          style={{
            height: 390,
            width: '100%',
            backgroundColor: RWBColors.grey8,
            borderRadius: 5,
          }}
          nestedScrollEnabled={true}
          data={this.props.userResults}
          keyExtractor={(item, index) => {
            return item._id.toString();
          }}
          renderItem={({item}) => (
            <UserCard
              user={item._source}
              onPress={this.props.handleSelectedUser}
              followable={false}
            />
          )}
        />
      )
    ) : null;
  }
}
