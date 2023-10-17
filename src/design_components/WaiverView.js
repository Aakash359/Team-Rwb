import React from 'react';
import {StyleSheet, Text, View, ScrollView} from 'react-native';
import RWBButton from './RWBButton';
import Modal from './Modal';
import WaiverCopy from './WaiverCopy';
import NavigationService from '../models/NavigationService';

import globalStyles, {RWBColors} from '../styles';

export default class WaiverView extends React.Component {
  constructor() {
    super();
    this.state = {
      hasOnDismiss: true,
    };
  }

  componentDidMount = () => {
    const onWaiverModalDismiss = this.props.navigation.getParam(
      'onWaiverModalDismiss',
      null,
    );
    if (onWaiverModalDismiss === null) {
      this.setState({
        hasOnDismiss: false,
      });
    }
  };

  acceptWaiverPressed = () => {
    this.props.navigation.state.params.onWaiverModalDismiss(true);
    NavigationService.back();
  };

  render() {
    const {hasOnDismiss} = this.state;
    return (
      <Modal>
        <View style={{flex: 1}}>
          <Text
            style={[globalStyles.h2, {textAlign: 'center', paddingBottom: 16}]}>
            Team RWB Legal Waiver
          </Text>
          <View style={styles.scrollArea}>
            <ScrollView
              style={{flex: 1, paddingRight: 12}}
              contentContainerStyle={styles.container}>
              <WaiverCopy />
            </ScrollView>
          </View>
          <View style={styles.fixedFooter}>
            {hasOnDismiss ? (
              <View>
                <RWBButton
                  buttonStyle="primary"
                  text="ACCEPT"
                  onPress={() => this.acceptWaiverPressed()}
                />
                <RWBButton
                  buttonStyle="secondary"
                  text="Cancel"
                  onPress={() => NavigationService.back()}
                />
              </View>
            ) : (
              <RWBButton
                buttonStyle="primary"
                text="Go Back"
                onPress={() => NavigationService.back()}
              />
            )}
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
