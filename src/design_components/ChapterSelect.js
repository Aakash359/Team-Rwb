import React, {Component} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import RWBButton from './RWBButton';

import globalStyles, {RWBColors} from '../styles';

const CONTENT_HEIGHT = 40;
const SEPARATOR_HEIGHT = 1;
const TOTAL_HEIGHT = CONTENT_HEIGHT + SEPARATOR_HEIGHT;

export default class ChapterSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chapter: null,
    };
  }

  render() {
    const {chapterlist, onChapterSelectDismiss, onChapterPress} = this.props;

    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#FFFB'}}>
        <View
          style={[
            globalStyles.scrollArea,
            globalStyles.modalWindow,
            {backgroundColor: '#0008'},
          ]}>
          <View style={{flex: 1, backgroundColor: RWBColors.white}}>
            <Text
              style={[
                globalStyles.h2,
                {paddingBottom: 12, paddingTop: 12, textAlign: 'center'},
              ]}>
              Chapter
            </Text>
            <FlatList
              data={chapterlist}
              renderItem={({item, index, separators}) => {
                return (
                  <View>
                    <TouchableOpacity
                      style={{
                        height: CONTENT_HEIGHT,
                        paddingLeft: 10,
                        justifyContent: 'center',
                        borderBottomWidth: SEPARATOR_HEIGHT,
                        borderBottomColor: RWBColors.grey8,
                      }}
                      onPress={() => onChapterPress(item)}>
                      <Text style={globalStyles.bodyCopyForm}>{item.name}</Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
              keyExtractor={(item, index) => {
                return item.id.toString();
              }}
              getItemLayout={(data, index) => ({
                length: TOTAL_HEIGHT,
                offset: TOTAL_HEIGHT * index,
                index,
              })}
            />
            <View style={globalStyles.fixedFooter}>
              <RWBButton
                buttonStyle="secondary"
                text="Cancel"
                onPress={() => onChapterSelectDismiss()}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}
