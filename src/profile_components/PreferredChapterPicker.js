import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import ChapterSelect from '../design_components/ChapterSelect';

//SVGs
import ChevronDownIcon from '../../svgs/ChevronDownIcon';
import globalStyles, {RWBColors} from '../styles';

export default class PreferredChapterPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  displayChapterModal() {
    this.setState({
      showModal: true,
    });
  }

  onChapterSelectDismiss = () => {
    this.setState({
      showModal: false,
    });
  };

  onChapterSelectPress = (chapter) => {
    this.setState({showModal: false});
    this.props.changeChapter(chapter);
  };

  render() {
    const {showModal} = this.state;
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: RWBColors.white}}>
        <Modal
          style={{position: 'absolute', top: 0, left: 0}}
          transparent={true}
          animationType={'slide'}
          visible={showModal}
          onRequestClose={() => this.setState({showModal: false})}>
          <ChapterSelect
            chapterlist={this.props.chapters}
            onChapterPress={this.onChapterSelectPress}
            onChapterSelectDismiss={this.onChapterSelectDismiss}
          />
        </Modal>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollViewContainer}
          contentContainerStyle={styles.scrollViewContainerContent}>
          <View style={{flex: 1, marginTop: 10}}>
            <View style={globalStyles.formBlock}>
              <Text style={[globalStyles.formLabel, {textAlign: 'left'}]}>
                LOCAL GROUP
              </Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => this.displayChapterModal('preferredChapter')}>
                <View style={styles.dropdownText}>
                  <Text style={[globalStyles.bodyCopyForm, {color: 'black'}]}>
                    {this.props.preferredChapter
                      ? this.props.preferredChapter.name
                      : 'Select One'}
                  </Text>
                  <ChevronDownIcon
                    style={styles.iconView}
                    tintColor={RWBColors.magenta}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    width: '100%',
  },
  scrollViewContainerContent: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  dropdownButton: {
    height: 32,
    width: '100%',
    borderBottomWidth: 1,
    borderColor: RWBColors.grey80,
    paddingTop: 5,
    paddingBottom: 5,
    flexDirection: 'row',
  },
  dropdownText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconView: {
    width: 16,
    height: 16,
  },
});
