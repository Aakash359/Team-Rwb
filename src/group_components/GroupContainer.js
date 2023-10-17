import React, {Component} from 'react';
import {ActivityIndicator} from 'react-native';
import {View, Text, StyleSheet, FlatList, Dimensions} from 'react-native';
import globalStyles, {RWBColors} from '../styles';
import GroupCard from './GroupCard';

const FAVORITES_HEIGHT = 550;
const NO_RESULTS_HEIGHT = 100;
const STANDARD_HEIGHT = 230;
const DEVICE_PADDING = Dimensions.get('window').width * 0.05;

export default class GroupContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  isFavorites = () => {
    return this.props.title === 'favorites';
  };

  determineHeight = () => {
    if (this.isFavorites()) return FAVORITES_HEIGHT;
    // empty list (shorter height to only display text)
    else if (!this.props?.data?.length) return NO_RESULTS_HEIGHT;
    else return STANDARD_HEIGHT;
  };

  determineEmptyMessage = () => {
    const {title} = this.props;
    if (title === 'my groups') return "You currently aren't in any groups.";
    else if (title === 'favorites') return 'Favorite a group to add it here.';
    else if (title === 'nearby') return 'No groups within 50 miles.'; // not sure if this will be needed, keeping as a safety measure
  };

  render() {
    const {title, data, updateJoined, updateFavorited, isLoading} = this.props;
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: this.isFavorites()
              ? RWBColors.grey20
              : RWBColors.white,
            height: this.determineHeight(),
          },
        ]}>
        <Text
          style={[
            globalStyles.eventListTitle,
            {
              fontSize: 22,
              color: this.isFavorites() ? RWBColors.magenta : RWBColors.navy,
              marginTop: 10,
              width: '90%',
              alignSelf: 'center',
            },
          ]}>
          {title.toUpperCase()}
        </Text>
        {isLoading ? (
          <View
            style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            keyExtractor={(item) => item.name}
            data={data}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            bounces={false} // this is for a specific ios bug (https://phabricator.retronyms.com/T1854)
            ListHeaderComponent={
              <View style={{marginLeft: DEVICE_PADDING, height: '100%'}} />
            }
            ListFooterComponent={
              <View
                style={{marginRight: DEVICE_PADDING - 10, height: '100%'}}
              />
            }
            ListEmptyComponent={
              <Text style={[globalStyles.bodyCopy, {marginTop: 20}]}>
                {this.determineEmptyMessage()}
              </Text>
            }
            renderItem={(group) => (
              <GroupCard
                updateJoined={updateJoined}
                updateFavorited={updateFavorited}
                group={group}
                key={group.item.name}
              />
            )}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
