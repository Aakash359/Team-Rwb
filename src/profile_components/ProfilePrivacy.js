import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  BackHandler,
  Linking,
} from 'react-native';
import {getRadioIndexForValue} from '../../shared/utils/Helpers';
import RWBButton from '../design_components/RWBButton';
import LinedRadioForm from '../design_components/LinedRadioForm';
import {rwbApi} from '../../shared/apis/api';
import {ANON_PROPS} from '../../shared/constants/RadioProps';
import NavigationService from '../models/NavigationService';
import {POLICY_TERMS_URL} from '../../shared/constants/TermURLs';

//SVGs
import ChevronBack from '../../svgs/ChevronBack';

import globalStyles, {RWBColors} from '../styles';
import {logUpdatePrivacySettings} from '../../shared/models/Analytics';

const {anon_radio_props} = ANON_PROPS;

export default class ProfilePrivacy extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: 'Privacy Settings',
      headerStyle: {
        backgroundColor: RWBColors.magenta,
      },
      headerTintColor: RWBColors.white,
      // the shared header config is in app.js
      headerLeft: () => (
        <TouchableOpacity
          style={globalStyles.headerSave}
          onPress={() => {
            const backPressed = navigation.getParam('backPressed', null);
            if (backPressed === null) {
              navigation.goBack();
              return;
            }
            backPressed();
          }}
          accessibilityRole={'button'}
          accessible={true}
          accessibilityLabel={'Go Back'}>
          <ChevronBack style={globalStyles.chevronBackImage} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={globalStyles.headerSave}
          onPress={navigation.getParam('savePressed')}>
          <Text style={globalStyles.headerSaveText}>Save</Text>
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <Text style={[globalStyles.title, {top: 3}]}>Privacy Settings</Text>
      ),
    };
  };

  constructor(props) {
    super(props);
    const value = this.props.navigation.getParam('value', null);
    if (value === null)
      throw new Error('ProfilePrivacy must be given navigation value.');
    const {anonymous_profile} = value.user;
    this.anonymousProfileIndex = getRadioIndexForValue(
      anon_radio_props,
      anonymous_profile,
      0,
    );
    this.state = {
      needsToSave: false,
      anonymous_profile,
      isLoading: false,
    };
    this.backPressed = this.backPressed.bind(this);
    this.savePressed = this.savePressed.bind(this);
    this.handleBackPress = this.handleBackPress.bind(this);
  }

  componentDidMount() {
    const {navigation} = this.props;
    const {backPressed, savePressed} = this;
    navigation.setParams({
      backPressed,
      savePressed,
    });
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  handleBackPress() {
    this.backPressed();
    return true;
  }

  backPressed() {
    const {navigation} = this.props;
    const {needsToSave} = this.state;
    if (needsToSave) {
      navigation.navigate('SaveModal', {
        save: this.savePressed,
      });
    } else {
      navigation.goBack();
    }
  }

  savePressed() {
    logUpdatePrivacySettings();
    this.updateUser(this.state.anonymous_profile);
  }

  updateUser(anonymous_profile) {
    this.setState({isLoading: true});

    let data = JSON.stringify({
      anonymous_profile,
    });

    return rwbApi
      .putUser(data)
      .then((response) => {
        this.setState({isLoading: false});
        this.props.navigation.goBack();
      })
      .catch((error) => {
        this.setState({
          isLoading: false,
        });
        Alert.alert(
          'Team RWB',
          'There was a problem contacting the Team RWB server. Please try again later.',
        );
      });
  }

  render() {
    const {anonymousProfileIndex} = this;
    return (
      <SafeAreaView style={styles.container}>
        {this.state.isLoading && (
          <View style={globalStyles.spinnerOverLay}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <View style={styles.formWrapper}>
          <View style={{flexGrow: 1}}>
            <Text style={globalStyles.formLabel}>PROFILE PRIVACY SETTINGS</Text>
            <LinedRadioForm
              style={[globalStyles.formBlock, {width: '90%'}]}
              radio_props={anon_radio_props}
              arrayLength={anon_radio_props.length}
              initial={anonymousProfileIndex}
              onPress={(value) => {
                this.setState({
                  anonymous_profile: value,
                  needsToSave: true,
                });
              }}
            />
            <TouchableOpacity
              style={{marginBottom: 10, padding: 5}}
              onPress={() => Linking.openURL(POLICY_TERMS_URL)}>
              <Text style={[globalStyles.link, {textAlign: 'center'}]}>
                Privacy Policy & Terms
              </Text>
            </TouchableOpacity>
          </View>
          <View style={globalStyles.centerButtonWrapper}>
            <RWBButton
              buttonStyle="primary"
              text="SAVE"
              onPress={this.savePressed}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: RWBColors.white,
  },
  formWrapper: {
    marginTop: 25,
    flex: 1,
    width: '90%',
    height: 'auto',
  },
  logoView: {
    width: '100%',
    padding: 50,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  login: {
    textAlign: 'center',
    margin: 25,
  },
  footerText: {
    fontSize: 10,
    textAlign: 'center',
    width: '65%',
  },
  switchView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    width: '90%',
  },
  switchLabel: {
    marginLeft: 15,
    flex: 1,
    justifyContent: 'center',
  },
  errorBar: {
    position: 'absolute',
    left: Dimensions.get('window').width * -0.05,
    top: '-3.5%',
    backgroundColor: RWBColors.magenta,
    width: 7,
    height: '107%',
  },
});
