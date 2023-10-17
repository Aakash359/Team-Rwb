import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
} from 'react-native';

import globalStyles, {RWBColors} from '../styles';
import LikeIcon from '../../svgs/LikeIcon';
import XIcon from '../../svgs/XIcon';

export default class NotificationSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imgAspectRatio: null,
      liked: false, // determine based off server info
    };
  }

  componentDidMount() {
    Image.getSize(this.props.image, (width, height) => {
      if (width === 0 || height === 0) this.setState({imgAspectRatio: 0});
      else this.setState({imgAspectRatio: width / height});
    });
  }

  closeModal() {
    this.props.onClose();
  }

  sharePost = () => {
    return; //placed here to avoid an app error until info is provided later
    Share.share(
      {
        // message: Platform.OS === 'android' ? eventLink : name,
        // title: "Share This Event",
        // url: eventLink,
      },
      {
        // dialogTitle: "Share This Event" //might be post instead of event?
      },
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          accessible={true}
          accessibilityRole={'button'}
          accessibilityLabel={'Close image'}
          style={{
            display: 'flex',
            width: '100%',
            flexDirection: 'row-reverse',
            right: 25,
          }}
          onPress={() => this.closeModal()}>
          <XIcon tintColor={RWBColors.white} style={{height: 32, width: 32}} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.top} onPress={() => this.closeModal()}>
          <Image
            style={{width: '100%', aspectRatio: this.state.imgAspectRatio}}
            source={{uri: this.props.image}}
          />
        </TouchableOpacity>
        <View
          style={{
            bottom: 0,
            width: '100%',
            flexDirection: 'row',
            paddingVertical: 20,
            paddingHorizontal: '5%',
          }}>
          <TouchableOpacity
            accessibilityRole={'button'}
            accessible={true}
            accessibilityLabel={`Like this post`}
            style={{flexDirection: 'row', height: 20, width: 20}}
            onPress={() => this.props.likePressed()}>
            <LikeIcon
              tintColor={this.props.liked ? RWBColors.magenta : ''}
              style={{height: 16, width: 16, marginRight: 5}}
            />
            <Text style={globalStyles.bodyCopyForm}>
              {this.props.likeAmount || ''}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'black',
  },
  top: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
});
