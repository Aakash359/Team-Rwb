import React, {Component} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import ChevronBack from '../../svgs/ChevronBack';
import EventListManager from '../event_components/EventListManager';
import globalStyles, {RWBColors} from '../styles';
export default class GroupEventList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.navigation.getParam('name'),
      groupId: this.props.navigation.getParam('group_id'),
      groupType: this.props.navigation.getParam('groupType'),
    };
  }

  render() {
    return (
      <View>
        <View
          style={{
            height: '100%',
            paddingTop: 30,
            backgroundColor: RWBColors.magenta,
          }}>
          <View style={styles.eventHeaderContainer}>
            <TouchableOpacity
              style={{left: 15}}
              onPress={() => this.props.navigation.goBack()}>
              <ChevronBack style={styles.iconView} />
            </TouchableOpacity>
            <View style={{alignItems: 'center'}}>
              <Text style={globalStyles.title}>Events</Text>
              <Text style={globalStyles.titleSubheader}>{this.state.name}</Text>
            </View>
            {/* empty view for for space-between styling, properly spacing arrow and title */}
            <View />
          </View>
          <EventListManager
            navigation={this.props.navigation}
            groupName={this.state.name}
            groupId={this.state.groupId}
            groupType={this.state.groupType}
            groupLat={this.props.navigation.getParam('groupLat', '')}
            groupLong={this.props.navigation.getParam('groupLong', '')}
            joinedGroup={this.props.navigation.getParam('joinedGroup', false)}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  iconView: {
    width: 16,
    height: 16,
  },
  eventHeaderContainer: {
    height: 50,
    paddingTop: 20,
    backgroundColor: RWBColors.magenta,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
