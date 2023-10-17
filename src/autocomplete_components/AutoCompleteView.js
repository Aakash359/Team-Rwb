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
import RWBTextField from '../design_components/RWBTextField';

import globalStyles, {RWBColors} from '../styles';

const AutocompleteView = ({
  onBlur,
  onChangeText,
  onOptionPress,
  options,
  value,
  onDonePressed,
  label,
  isLoading,
}) => (
  <SafeAreaView style={{backgroundColor: RWBColors.white}}>
    <View
      style={{
        alignSelf: 'center',
        width: '100%',
        backgroundColor: RWBColors.white,
        height: '100%',
        paddingLeft: '5%',
        paddingRight: '5%',
      }}>
      <RWBTextField
        label={label}
        autoFocus={true}
        onBlur={onBlur}
        onChangeText={onChangeText}
        value={value}
        onSubmitEditing={onDonePressed}
      />
      <Text style={[globalStyles.bodyCopy, {marginTop: 10}]}>
        Type the first few characters of your address in the box and then select
        from the list of matching addresses
      </Text>
      <View style={{height: '80%'}}>
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
            data={options}
            keyboardShouldPersistTaps={'handled'}
            keyExtractor={(item) => {
              return item.key.list_key.toString();
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

export default AutocompleteView;

const styles = StyleSheet.create({
  listItem: {
    borderTopWidth: 1,
    borderColor: RWBColors.grey8,
    paddingTop: 15,
    paddingBottom: 15,
  },
  listItemLast: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: RWBColors.grey8,
    paddingTop: 15,
    paddingBottom: 15,
  },
});
