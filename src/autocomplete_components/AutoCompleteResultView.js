import React from 'react';
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import AutocompleteOption from './AutocompleteOption';
import GetLocationWrapper from '../event_components/GetLocationWrapper';

// SVGS
import CurrentLocationIcon from '../../svgs/CurrentLocationIcon';

import globalStyles, {RWBColors} from '../styles';

export default class AutoCompleteResultView extends React.Component {
  constructor(props) {
    super(props);
  }

  renderHeader = () => {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          paddingVertical: 15,
          paddingLeft: '5%',
          alignItems: 'center',
        }}>
        <CurrentLocationIcon
          tintColor={RWBColors.navy}
          style={{height: 24, width: 24}}
        />
        <GetLocationWrapper
          style={{marginLeft: 5, backgroundColor: RWBColors.white}}
          onPress={(localeString) => {
            this.props.onOptionPress(localeString);
          }}>
          <Text style={[globalStyles.link, {color: RWBColors.navy}]}>
            Use Current Location
          </Text>
        </GetLocationWrapper>
      </View>
    );
  };

  render() {
    const {onOptionPress, options, isLoading} = this.props;
    return (
      <SafeAreaView style={{backgroundColor: RWBColors.white}}>
        <View
          style={{
            width: '100%',
            backgroundColor: RWBColors.white,
            height: '100%',
          }}>
          <View style={{height: '100%'}}>
            {isLoading ? (
              <View
                style={{
                  paddingVertical: 20,
                  borderTopWidth: 1,
                  borderColor: '#CED0CE',
                }}>
                <ActivityIndicator animating size="large" />
              </View>
            ) : (
              <FlatList
                ListHeaderComponent={this.renderHeader}
                data={options}
                keyboardShouldPersistTaps={'handled'}
                keyExtractor={(item) => {
                  return item.key.list_key
                    ? item.key.list_key.toString()
                    : item.key.fullAddress;
                }} // Melissa Address Key for freeform search, zipcode for citystate search
                renderItem={({item}) => (
                  <AutocompleteOption
                    style={styles.listItem}
                    onOptionPress={onOptionPress}
                    option={item}
                  />
                )}
              />
            )}
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
    paddingVertical: 15,
    paddingHorizontal: '5%',
  },
  listItemLast: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: RWBColors.grey8,
    paddingTop: 15,
    paddingBottom: 15,
  },
});
