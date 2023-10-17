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
  FlatList,
} from 'react-native';
import {rwbApi} from '../../shared/apis/api';
import Attendee from '../attendee_components/Attendee';

//SVGs
import ChevronBack from '../../svgs/ChevronBack';

import globalStyles, {RWBColors} from '../styles';
import {NO_BLOCKED_USERS} from '../../shared/constants/OtherMessages';

export default class BlockedUsersView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: 'Blocked Users',
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
      headerTitle: () => (
        <Text style={[globalStyles.title, {top: 3}]}>Blocked Users</Text>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      refreshing: false,
      blockedUsers: [],
    };
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
    this.loadBlockedUsers();
  }

  handleBackPress = () => {
    this.props.navigation.goBack();
    return true;
  };

  componentWillUnmount() {
    this.backHandler.remove();
  }

  loadBlockedUsers = () => {
    this.setState({refreshing: true});
    rwbApi
      .getListOfBlockedUsers()
      .then((response) => {
        this.setState({blockedUsers: response.data, refreshing: false});
      })
      .catch((err) => {
        this.setState({refreshing: false});
        Alert.alert(
          'Team RWB',
          'There was a problem loading the blocked users. Please try again later.',
        );
      });
  };

  unBlockUser = (targetUserId) => {
    this.setState({isLoading: true});
    rwbApi
      .unblockUser(targetUserId)
      .then(() => {
        this.setState({isLoading: false});
        this.loadBlockedUsers();
      })
      .catch((error) => {
        this.setState({
          isLoading: false,
        });
        Alert.alert(
          'Team RWB',
          'There was a problem unblocking the user. Please try again later.',
        );
      });
  };

  renderSeparator() {
    return (
      <View
        style={{
          height: 0,
          width: '100%',
          borderBottomWidth: 1,
          borderBottomColor: RWBColors.grey8,
        }}
      />
    );
  }

  render() {
    const {blockedUsers} = this.state;
    return (
      <SafeAreaView style={styles.container}>
        {this.state.isLoading && (
          <View style={globalStyles.spinnerOverLay}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <View style={styles.contentWrapper}>
          <View style={{flexGrow: 1}}>
            <FlatList
              data={blockedUsers}
              refreshing={this.state.refreshing}
              onRefresh={() => this.loadBlockedUsers()}
              keyExtractor={(item, index) => {
                return `${item.id}${index}`;
              }}
              renderItem={({item, index, separators}) => {
                return (
                  <Attendee
                    user={item}
                    isEagleLeader={item.eagle_leader}
                    canBlock={true}
                    unBlockUser={this.unBlockUser}
                  />
                );
              }}
              ItemSeparatorComponent={this.renderSeparator}
              ListEmptyComponent={
                !this.state.isLoading ? (
                  <View>
                    <Text
                      style={[
                        globalStyles.bodyCopy,
                        {textAlign: 'center', paddingVertical: 20},
                      ]}>
                      {NO_BLOCKED_USERS}
                    </Text>
                  </View>
                ) : null
              }
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
    flex: 1,
    width: '100%',
    height: 'auto',
  },
});
