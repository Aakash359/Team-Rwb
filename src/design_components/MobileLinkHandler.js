import React, {Component} from 'react';
import {View, Text, TouchableOpacity, Linking} from 'react-native';
import globalStyles, {RWBColors} from '../styles';

export default class MobileLinkHandler extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  formatLinks = (links) => {
    let linkObjs = [];
    for (let i = 0; i < links.length; i++) {
      linkObjs.push(this.mobileLink(links[i].text, links[i].url, i));
    }
    return linkObjs;
  };

  mobileLink = (text, url, index) => {
    return (
      <View key={`link-${index.toString()}`}>
        <TouchableOpacity
          accessible={true}
          accessibilityRole={'link'}
          accessibilityLabel={`Open link to ${text}`}
          onPress={() => Linking.openURL(`${url}`)}>
          <Text style={globalStyles.link}>{text}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    return this.formatLinks(this.props.links);
  }
}
