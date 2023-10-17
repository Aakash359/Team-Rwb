import React from 'react';
import {StyleSheet, Text, View, ScrollView} from 'react-native';
import RWBButton from './RWBButton';
import Modal from './Modal';
import PrivacyPolicyCopy from './PrivacyPolicyCopy';

import globalStyles, {RWBColors} from '../styles';

export default class PrivacyPolicyView extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <Modal>
        <View style={{flex: 1}}>
          <Text
            style={[globalStyles.h2, {textAlign: 'center', paddingBottom: 16}]}>
            Team RWB Privacy Policy
          </Text>
          <View style={styles.scrollArea}>
            <ScrollView
              style={{flex: 1, paddingRight: 12}}
              contentContainerStyle={styles.container}>
              <PrivacyPolicyCopy />
            </ScrollView>
          </View>
          <View style={styles.fixedFooter}>
            <RWBButton
              buttonStyle="primary"
              text="Cancel"
              onPress={() => this.props.navigation.goBack()}
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
