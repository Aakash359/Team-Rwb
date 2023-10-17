import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  Linking,
  TouchableOpacity,
} from 'react-native';
import RWBButton from '../design_components/RWBButton';
import KeyboardAvoidScrollview from '../design_components/KeyboardAvoidScrollview';
import {logOrderConfirmation} from '../../shared/models/Analytics';

const globalStyles = require('../styles');

export default class RegisterOrderConfirmationView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: (
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Order Confirmation</Text>
        </View>
      ),
      headerLeft: () => null,
      headerStyle: {
        backgroundColor: '#BF0D3E',
      },
      headerTintColor: '#fff',
    };
  };

  constructor(props) {
    super(props);
    this.receiptEmail = this.props.navigation.getParam('receiptEmail', null);
    this.emailMessage = `A receipt has been sent to ${this.receiptEmail}. You will receive a separate email once tracking information is ready. If you have any questions or issues please contact us at `;
  }

  render() {
    return (
      <SafeAreaView style={{width: '100%', height: 'auto', flex: 1}}>
        <StatusBar
          barStyle="light-content"
          animated={true}
          translucent={false}
          backgroundColor="#bf0d3e"
        />
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">
          <View style={styles.formWrapper}>
            <View>
              <Text
                style={[
                  globalStyles.bodyCopy,
                  {fontWeight: 'bold', textAlign: 'center'},
                ]}>
                Wear your Eagle with pride!
              </Text>
              <Image
                source={require('../../shared/images/RWBRedShirt.jpg')}
                style={{
                  width: 200,
                  height: 200,
                  margin: 25,
                  alignSelf: 'center',
                }}
              />
              <Text style={[globalStyles.bodyCopy, {paddingBottom: 0}]}>
                Your order is complete!
              </Text>
              <Text style={{padding: 0, margin: 0}}>{'\n'}</Text>
              <Text style={globalStyles.bodyCopy}>
                {this.emailMessage}
                <Text
                  style={globalStyles.link}
                  onPress={() =>
                    Linking.openURL('mailto:weartheeagle@teamrwb.org')
                  }>
                  weartheeagle@teamrwb.org
                </Text>
                .
              </Text>
            </View>

            <View style={styles.bottomButtons}>
              <RWBButton
                buttonStyle="primary"
                text="CONTINUE"
                onPress={() => {
                  let analyticsObj = {};
                  if (
                    this.props.navigation.state.params &&
                    this.props.navigation.state.params.from
                  )
                    analyticsObj.previous_view = this.props.navigation.state.params.from;
                  logOrderConfirmation(analyticsObj);
                  this.props.navigation.navigate('App');
                }}
              />
            </View>
          </View>
          <KeyboardAvoidScrollview />
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    height: '100%',
  },
  formWrapper: {
    flex: 1,
    width: '90%',
    height: 'auto',
    marginTop: 15,
  },
  headerBar: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#BF0D3E',
    width: '100%',
    height: 65,
    marginHorizontal: 0,
    marginBottom: 25,
    marginTop: 0,
  },
  headerTitle: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spinnerOverLay: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  bottomButtons: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
});
