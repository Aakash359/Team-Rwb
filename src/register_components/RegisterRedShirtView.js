import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import RWBButton from '../design_components/RWBButton';
import KeyboardAvoidScrollview from '../design_components/KeyboardAvoidScrollview';

import globalStyles, {RWBColors} from '../styles';
import {logGetRedShirt} from '../../shared/models/Analytics';

const REDSHIRT_COPY = `You are eligible for one free Nike Team RWB shirt*, just pay $5 for shipping and handling. The Nike Challenger Short-Sleeve Running Top is made of 100% recycled polyester material with Dri-FIT fabric technology that wicks sweat away from the skin to help keep you cool and dry. The short sleeves and round neck offer a comfortable fit, and the shirt is designed with the Nike Swoosh trademark in reflective heat transfer material at the left chest. Dri-FIT trademark heat transfer at the bottom hem.

 

*or a comparable moisture-wicking shirt, depending on size availability.`;

export default class RegisterRedShirtView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: () => (
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Welcome to the Team!</Text>
        </View>
      ),
      headerLeft: () => null,
      headerStyle: {
        backgroundColor: RWBColors.magenta,
      },
      headerTintColor: RWBColors.white,
    };
  };

  constructor() {
    super();
  }

  componentDidMount() {
    const partial_user = this.props.navigation.getParam('value', null); //cannot be done in constructor
    if (partial_user === null)
      throw new Error('RegisterRedShirt must be provided a navigation value.');
    this.setState({
      partial_user,
    });
  }

  render() {
    return (
      <SafeAreaView
        style={{width: '100%', flex: 1, backgroundColor: RWBColors.white}}>
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
                  left: -16,
                }}
              />
              <Text style={globalStyles.bodyCopy}>{REDSHIRT_COPY}</Text>
            </View>
          </View>
          <View style={styles.bottomButtons}>
            <RWBButton
              buttonStyle="primary"
              text="GET MY RED SHIRT!"
              onPress={() => {
                let analyticsObj = {};
                if (
                  this.props.navigation.state.params &&
                  this.props.navigation.state.params.from
                )
                  analyticsObj.previous_view = this.props.navigation.state.params.from;
                logGetRedShirt(analyticsObj);
                this.props.navigation.navigate('GetRedShirt', {
                  value: this.state.partial_user,
                  from: 'Welcome to the Team!'
                });
              }}
            />
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('App')}>
              <Text
                style={[
                  globalStyles.bodyCopy,
                  {textAlign: 'center', paddingVertical: 15, marginBottom: 15},
                ]}>
                No Thanks
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    flexGrow: 1,
  },
  formWrapper: {
    flex: 1,
    width: '90%',
    marginTop: 15,
    height: '100%',
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
  bottomButtons: {
    width: '90%',
  },
});
