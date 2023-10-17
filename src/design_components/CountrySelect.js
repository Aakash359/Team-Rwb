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

import {COUNTRY_OPTIONS} from '../../shared/constants/Countries';

import globalStyles, {RWBColors} from '../styles';

export default class CountrySelect extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {onCountrySelect, onCountrySelectCancel} = this.props;

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
              Country
            </Text>
            <FlatList
              data={Object.keys(COUNTRY_OPTIONS)}
              initialNumToRender={Object.keys(COUNTRY_OPTIONS).length}
              keyExtractor={(item, index) => {
                return item;
              }}
              getItemLayout={(data, index) => {
                return {length: 48, offset: 48 * index, index};
              }}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[styles.listItem, {paddingLeft: 12}]}
                  onPress={() => onCountrySelect(item)}>
                  <Text style={globalStyles.bodyCopyForm}>
                    {COUNTRY_OPTIONS[item].display}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <View style={globalStyles.fixedFooter}>
              <RWBButton
                buttonStyle="secondary"
                text="Cancel"
                onPress={() => onCountrySelectCancel()}
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
