import React, {Component} from 'react';
import {View} from 'react-native';
import Modal from '../design_components/Modal';
import RWBButton from '../design_components/RWBButton';

import SizeChartTable from './SizeChartTable';

import globalStyles, {RWBColors} from '../styles';

export default class SizeChart extends Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
  }

  closeModal() {
    this.props.navigation.goBack();
  }

  render() {
    return (
      <Modal style={{flex: 0, top: '5%', height: '90%', width: '100%'}}>
        <View style={{flex: 1}}>
          <SizeChartTable />
        </View>
        <View style={[globalStyles.centerButtonWrapper, {paddingTop: 10}]}>
          <RWBButton
            buttonStyle="secondary"
            text="Close"
            onPress={() => this.closeModal()}
          />
        </View>
      </Modal>
    );
  }
}
