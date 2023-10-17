import React, {Component} from 'react';
import {View, FlatList} from 'react-native';
import Attendee from './Attendee';

export default class AttendeeList extends Component {
  constructor(props) {
    super(props);
  }
  // checks if a user has the same id as the host
  isHost(user) {
    const {host} = this.props;
    return host.id === user.id;
  }
  render() {
    const {
      userList,
      renderHeader,
      renderFooter,
      renderSeparator,
      onEndReached,
    } = this.props;

    let displayList;
    if (userList) {
      displayList = userList.filter((user) => {
        return !this.isHost(user);
      });
    }
    return (
      <View style={{flex: 1}}>
        <FlatList
          data={displayList}
          keyExtractor={(item, index) => {
            return `${item.id}${index}`;
          }}
          renderItem={({item, index, separators}) => {
            return <Attendee user={item} isEagleLeader={item.eagle_leader} />;
          }}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ItemSeparatorComponent={renderSeparator}
          onEndReached={onEndReached}
          onEndReachedThreshhold={0.75}
        />
      </View>
    );
  }
}
