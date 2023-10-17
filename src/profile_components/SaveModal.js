import React from 'react';
import {Text, View} from 'react-native';
import RWBButton from '../design_components/RWBButton';
import Modal from '../design_components/Modal';
import NavigationService from '../models/NavigationService';
import globalStyles, {RWBColors} from '../styles';

export default class SaveModal extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let save = this.props.navigation.getParam('save', null);
    if (save === null || typeof save !== 'function')
      throw new Error('SaveModal must be passed a `save` function.');
    this.save = save;
  }

  savePressed() {
    this.save();
    NavigationService.back();
  }

  doNotSavePressed() {
    NavigationService.navigate('MyProfile');
  }

  render() {
    return (
      <Modal style={{flex: 0, top: '25%', height: '50%', width: '100%'}}>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Text style={[globalStyles.h2, {textAlign: 'center'}]}>
            Would you like to save{'\n'}your changes?
          </Text>
        </View>
        <View style={globalStyles.centerButtonWrapper}>
          <RWBButton
            buttonStyle="primary"
            text="SAVE"
            onPress={() => this.savePressed()}
          />
          <RWBButton
            buttonStyle="secondary"
            text="Don't Save"
            onPress={() => this.doNotSavePressed()}
          />
        </View>
      </Modal>
    );
  }
}
