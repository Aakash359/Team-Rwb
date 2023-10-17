import React from 'react';
import {View, FlatList, TouchableOpacity, Text, StyleSheet} from 'react-native';
import RWBButton from '../design_components/RWBButton';
import Modal from '../design_components/Modal';

import globalStyles, {RWBColors} from '../styles';

export default class FilterOptions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      optionKeys: [],
    };
    this.options = [];
    this.donePressed = this.donePressed.bind(this);
    this.onOptionPressed = this.onOptionPressed.bind(this);
  }

  componentDidMount() {
    const {
      navigation: {getParam},
    } = this.props;
    const value = getParam('value', null);
    if (value === null)
      throw new Error('Autocomplete navigate must have value');
    const {options, currentSelected, filterSelected, filterTitle} = value;
    this.options = options;
    this.filterSelected = filterSelected;
    this.filterTitle = filterTitle;
    this.setState({
      optionKeys: Object.keys(options),
      currentSelected,
    });
  }

  donePressed() {
    const {
      navigation: {goBack},
    } = this.props;
    goBack();
  }

  onOptionPressed(slug) {
    const {
      navigation: {getParam, navigate},
    } = this.props;
    const returnRoute = getParam('returnRoute', null);
    if (returnRoute === null)
      throw new Error('Autocomplete navigate must have returnRoute');
    navigate(returnRoute, {value: {slug, filterSelected: this.filterSelected}});
  }

  render() {
    return (
      <Modal>
        <View style={styles.scrollArea}>
          <Text
            style={[globalStyles.h2, {textAlign: 'center', paddingBottom: 16}]}>
            {this.filterTitle}
          </Text>
          <FlatList
            data={this.state.optionKeys}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => this.onOptionPressed(item)}>
                <Text style={globalStyles.bodyCopyForm}>
                  {this.options[item].display}
                </Text>
              </TouchableOpacity>
            )}
          />
          <View style={styles.fixedFooter}>
            <RWBButton
              buttonStyle="secondary"
              text="Cancel"
              onPress={this.donePressed}
            />
          </View>
        </View>
      </Modal>
    );
  }
}

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
  listItem: {
    borderTopWidth: 1,
    borderColor: RWBColors.grey8,
    paddingTop: 15,
    paddingBottom: 15,
  },
});
