import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableHighlight,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import RWBButton from './RWBButton';
import Modal from './Modal';
import {MIMETYPES, EXTENSIONS} from '../../shared/constants/ImageConstants';

import globalStyles, {RWBColors} from '../styles';
import {convertTypeToJPG} from '../../shared/utils/Helpers';
// TODO Check if CameraRollModal is needed
export default class CameraRollView extends React.Component {
  constructor() {
    super();
    this.state = {
      photos: [],
      endCursor: '',
      arePhotosLoading: false,
      loadMore: true,
    };
  }

  // could improve by paginating or using a fancier library. This is bare bones.
  loadPhotos = () => {
    const {photos, endCursor, arePhotosLoading} = this.state;
    if (arePhotosLoading === false) {
      this.setState({arePhotosLoading: true});
      let photoOptions = {
        first: 50,
        assetType: 'Photos',
      };
      if (endCursor) {
        photoOptions.after = endCursor;
      }
      CameraRoll.getPhotos(photoOptions)
        .then((response) => {
          let newPhotos = response.edges.filter(
            Platform.OS === 'android' ? isSupportedAndroid : isSupportedIOS,
          );
          this.setState({
            photos: [...photos, ...newPhotos],
            arePhotosLoading: false,
            endCursor: response.page_info.end_cursor,
            loadMore: response.page_info.has_next_page,
          });
        })
        .catch((err) => {
          Alert.alert(
            'Team RWB',
            'There was a problem accessing your camera roll.',
          );
        });
    } else {
      return;
    }
  };

  componentDidMount() {
    this.loadPhotos();
  }

  photoPressed = (image) => {
    image = convertTypeToJPG(image);
    this.selectedPhoto = image;
    this.props.navigation.state.params.onCameraRollDismiss(this.selectedPhoto);
    this.props.navigation.goBack();
  };

  handleScroll = (event) => {
    // total scrollbar size
    const maxScroll = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    const position = event.nativeEvent.contentOffset.y;

    // if we are approaching the bottom of the scrollview, increase the amount of photos
    if (this.state.loadMore && layoutHeight + position + 150 > maxScroll) {
      this.loadPhotos();
    }
  };

  render() {
    return (
      <Modal>
        <View style={{flex: 1}}>
          {this.state.arePhotosLoading && (
            <View style={globalStyles.spinnerOverlay}>
              <ActivityIndicator size="large" />
            </View>
          )}

          <View style={styles.scrollArea}>
            <ScrollView
              style={{flex: 1}}
              contentContainerStyle={styles.container}
              onScroll={this.handleScroll}
              scrollEventThrottle={16}>
              {this.state.photos.map((photo, index) => {
                let {node} = photo;
                return (
                  <View key={index}>
                    <TouchableHighlight onPress={() => this.photoPressed(node)}>
                      <Image
                        style={{width: 120, height: 120, margin: 5}}
                        source={{uri: node.image.uri}}
                      />
                    </TouchableHighlight>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.fixedFooter}>
            <RWBButton
              buttonStyle="secondary"
              text="Cancel"
              onPress={() => {
                this.props.navigation.goBack();
              }}
            />
          </View>
        </View>
      </Modal>
    );
  }
}

const SUPPORTED_EXTENSIONS = Object.values(EXTENSIONS);
const SUPPORTED_MIMES = Object.values(MIMETYPES);

const isSupportedAndroid = (image_graph_edge) => {
  let image_type = image_graph_edge.node.type;
  if (SUPPORTED_MIMES.includes(image_type)) {
    return true;
  } else {
    return false;
  }
};

const isSupportedIOS = (image_graph_edge) => {
  let image_name = image_graph_edge.node.image.filename.toLowerCase();
  for (let filetype of SUPPORTED_EXTENSIONS) {
    if (image_name.endsWith(filetype)) {
      return true;
    }
  }
  return false;
};

const styles = StyleSheet.create({
  scrollArea: {
    flex: 1,
  },
  fixedFooter: {
    flex: 0,
    margin: 0,
    paddingTop: 25,
    paddingHorizontal: 25,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
  },
  spinner: {
    flex: 0,
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
});
