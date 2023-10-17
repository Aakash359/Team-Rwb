import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  BackHandler,
  Switch,
} from 'react-native';
import RWBButton from '../design_components/RWBButton';
import {rwbApi} from '../../shared/apis/api';

//SVGs
import ChevronBack from '../../svgs/ChevronBack';

import globalStyles, {RWBColors} from '../styles';
import {pushSettings} from '../models/UserPushSettings';

export default class NotificationSettingsView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: 'Notification Settings',
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
          onPress={navigation.getParam('updateNotificationSettings')}>
          <Text style={globalStyles.headerSaveText}>Save</Text>
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <Text style={[globalStyles.title, {top: 3}]}>
          Notification Settings
        </Text>
      ),
    };
  };

  constructor(props) {
    super(props);
    const value = this.props.navigation.getParam('value', null);
    if (value === null)
      throw new Error('NotificationSettings must be given navigation value.');
    this.state = {
      isLoading: false,
      eventNotificationEnabled: true,
      activityNotificationEnabled: true,
    };
    this.updateNotificationSettings = this.updateNotificationSettings.bind(
      this,
    );
  }

  componentDidMount() {
    const {navigation} = this.props;
    const {updateNotificationSettings} = this;
    navigation.setParams({
      updateNotificationSettings,
    });
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
    this.loadNotificationSettings();
  }

  handleBackPress = () => {
    this.props.navigation.goBack();
    return true;
  };

  componentWillUnmount() {
    this.backHandler.remove();
  }

  setNotificationSettings(eventNotification, activityNotification) {
    this.setState({
      eventNotificationEnabled: eventNotification,
      activityNotificationEnabled: activityNotification,
    });
  }

  loadNotificationSettings = () => {
    this.setState({isLoading: true});
    rwbApi
      .getNotificationSettings()
      .then((response) => {
        const {event_notifications, activity_notifications} = response;
        pushSettings.savePushSettings(response);
        this.setNotificationSettings(
          event_notifications,
          activity_notifications,
        );
        this.setState({isLoading: false});
      })
      .catch((err) => {
        this.setState({isLoading: false});
        console.warn('Error loading notification settings: ', err);
      });
  };

  toggleEventNotification = () => {
    this.setState((prevState) => ({
      eventNotificationEnabled: !prevState.eventNotificationEnabled,
    }));
  };

  toggleActivityNotification = () => {
    this.setState((prevState) => ({
      activityNotificationEnabled: !prevState.activityNotificationEnabled,
    }));
  };

  updateNotificationSettings = () => {
    this.setState({isLoading: true});
    let data = JSON.stringify({
      event_notifications: this.state.eventNotificationEnabled,
      activity_notifications: this.state.activityNotificationEnabled,
    });

    rwbApi
      .updateNotificationSettings(data)
      .then(() => {
        pushSettings.savePushSettings(JSON.parse(data));
        this.setState({isLoading: false});
        this.props.navigation.goBack();
      })
      .catch((error) => {
        this.setState({
          isLoading: false,
        });
        console.warn('Error updating notification settings: ', error);
        Alert.alert(
          'Team RWB',
          'There was a problem contacting the Team RWB server. Please try again later.',
        );
      });
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        {this.state.isLoading && (
          <View style={globalStyles.spinnerOverLay}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <View style={styles.contentWrapper}>
          <View style={{flexGrow: 1}}>
            <View style={globalStyles.formBlock}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text style={globalStyles.autoAddressBarText}>
                  Event Notifications
                </Text>
                <Switch
                  onValueChange={this.toggleEventNotification}
                  value={this.state.eventNotificationEnabled}
                />
              </View>
              <View style={{marginTop: 8}}>
                <Text style={globalStyles.bodyCopyForm}>
                  Reminder notifications for events that you are going to or
                  interested, and when other members post on your event. You
                  will still receive notifications for event cancelation or
                  changes.
                </Text>
              </View>
            </View>
            <View style={globalStyles.formBlock}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text style={globalStyles.autoAddressBarText}>
                  Activity Notifications
                </Text>
                <Switch
                  onValueChange={this.toggleActivityNotification}
                  value={this.state.activityNotificationEnabled}
                />
              </View>
              <View style={{marginTop: 8}}>
                <Text style={globalStyles.bodyCopyForm}>
                  Notifications for Feed activites, such as getting tagged in
                  posts, getting followed by members, and likes and comments on
                  your posts.
                </Text>
              </View>
            </View>
          </View>
          <View style={globalStyles.centerButtonWrapper}>
            <RWBButton
              buttonStyle="primary"
              text="SAVE"
              onPress={this.updateNotificationSettings}
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
  contentWrapper: {
    marginTop: 25,
    flex: 1,
    width: '90%',
    height: 'auto',
  },
});
