import React, {PureComponent} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import RWBButton from './RWBButton';

import globalStyles, {RWBColors} from '../styles';

export default class SelectableScrollList extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {onSelect, onCancel, options, title} = this.props;

    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#FFFB'}}>
        <View
          style={[
            globalStyles.scrollArea,
            globalStyles.modalWindow,
            {backgroundColor: '#0008'},
          ]}>
          <View style={{flex: 1, backgroundColor: '#FFF'}}>
            <Text
              style={[
                globalStyles.h2,
                {textAlign: 'center', paddingTop: 12, paddingBottom: 12},
              ]}>
              {title}
            </Text>
            <FlatList
              data={options}
              keyExtractor={(item, index) => {
                return item;
              }}
              getItemLayout={(data, index) => {
                return {length: 48, offset: 48 * index, index};
              }}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[styles.listItem, {paddingLeft: 12}]}
                  onPress={() => onSelect(item)}>
                  <Text style={globalStyles.bodyCopyForm}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <View style={globalStyles.fixedFooter}>
              <RWBButton
                buttonStyle="secondary"
                text="Cancel"
                onPress={() => onCancel()}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  listItem: {
    borderTopWidth: 1,
    borderColor: RWBColors.grey8,
    paddingTop: 15,
    paddingBottom: 15,
  },
});
