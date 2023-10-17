import React from 'react';
import {StyleSheet, Text, View, ScrollView} from 'react-native';
import RWBButton from '../design_components/RWBButton';
import LinedRadioForm from '../design_components/LinedRadioForm';
import Modal from '../design_components/Modal';
import {REDSHIRT_PROPS} from '../../shared/constants/RadioProps';

import globalStyles, {RWBColors} from '../styles';

const {sizes_radio_props} = REDSHIRT_PROPS;

export default class RedShirtSizePicker extends React.Component {
  constructor() {
    super();
    this.state = {
      shirt_size: null,
    };
    this.donePressed = this.donePressed.bind(this);
  }

  donePressed() {
    this.props.navigation.state.params.onShirtSizePickerDismiss(
      this.state.shirt_size,
    );
    this.props.navigation.goBack();
  }

  render() {
    return (
      <Modal>
        <View style={{flex: 1}}>
          <Text
            style={[globalStyles.h2, {paddingBottom: 16, textAlign: 'center'}]}>
            Size
          </Text>
          <View style={styles.scrollArea}>
            <ScrollView
              style={{flex: 1}}
              contentContainerStyle={styles.container}>
              <LinedRadioForm
                style={globalStyles.formBlock}
                radio_props={sizes_radio_props}
                initial={null}
                onPress={(value) => {
                  this.setState({
                    shirt_size: value,
                  });
                }}
              />
            </ScrollView>
          </View>

          <View style={styles.fixedFooter}>
            <RWBButton
              buttonStyle="primary"
              text="DONE"
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
});
