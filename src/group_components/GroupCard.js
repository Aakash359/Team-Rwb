import React, {Component} from 'react';
import {Text, Image, TouchableOpacity, StyleSheet, View} from 'react-native';
import {capitalizeFirstLetter} from '../../shared/utils/Helpers';
import NavigationService from '../models/NavigationService';
import globalStyles, {RWBColors} from '../styles';

const IMAGE_WIDTH = 100;
const TEXT_MARGIN = 5;
export default class GroupCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handlePress = () => {
    const {updateJoined, updateFavorited, searchPressed} = this.props;
    const {id} = this.props.group.item;
    NavigationService.navigate('GroupView', {
      updateFavorited,
      updateJoined,
      group_id: id,
    });
    if (searchPressed) searchPressed();
  };

  render() {
    const {header_image_url, name, type} = this.props.group.item;
    const {horizontal} = this.props;
    return (
      <TouchableOpacity
        style={{
          flexDirection: horizontal ? 'row' : 'column',
          alignItems: horizontal ? 'center' : null,
          alignSelf: horizontal ? 'center' : null,
          width: IMAGE_WIDTH - TEXT_MARGIN,
          marginRight: horizontal ? 0 : 10,
          marginTop: 10,
          width: horizontal ? '90%' : IMAGE_WIDTH,
        }}
        onPress={this.handlePress}>
        <Image style={styles.image} source={{uri: header_image_url}} />
        <View style={horizontal && styles.horizontalContainer}>
          <Text
            style={[
              horizontal ? globalStyles.h1 : globalStyles.bodyCopy,
              {
                marginTop: horizontal ? null : 10,
                color: RWBColors.navy,
                marginHorizontal: !horizontal ? TEXT_MARGIN : 0,
              },
            ]}>
            {name}
          </Text>
          {horizontal && (
            <Text style={globalStyles.h5}>
              {capitalizeFirstLetter(type)} Group
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  horizontalContainer: {
    marginLeft: 10,
    marginTop: 0,
    flex: 1,
  },
  image: {
    height: 100,
    width: IMAGE_WIDTH,
    borderRadius: 5,
  },
});
