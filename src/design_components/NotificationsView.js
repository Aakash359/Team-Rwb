import React from 'react';
import {
  Text,
  FlatList,
  View,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import globalStyles, {RWBColors} from '../styles';
import {rwbApi} from '../../shared/apis/api';
import NotificationCardDispatcher from './NotificationCardDispatcher';
import FullscreenSpinner from './FullscreenSpinner';
import {NO_NOTIFICATIONS} from '../../shared/constants/OtherMessages';
import ChevronBack from '../../svgs/ChevronBack';
export default class NotificationsView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: 'Notifications',
      headerStyle: {
        backgroundColor: RWBColors.magenta,
      },
      headerTintColor: RWBColors.white,
      headerLeft: () => (
        <TouchableOpacity
          style={globalStyles.headerSave}
          onPress={() => {
            navigation.goBack();
          }}
          accessibilityRole={'button'}
          accessible={true}
          accessibilityLabel={'Go Back'}>
          <ChevronBack style={globalStyles.chevronBackImage} />
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <Text style={[globalStyles.title, {top: 3}]}>Notifications</Text>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
      refreshing: false,
      loading: true, //initial loading/refresh
      loadingMore: false, // footer spinner when scrolling and loading more
    };
  }

  componentDidMount() {
    this.getNotifications();
  }

  getNotifications = (offset) => {
    this.setState({loadingMore: true});
    rwbApi
      .getNotifications(offset)
      .then((result) => {
        let newNotifications = [];
        for (let i = 0; i < result.data.results.length; i++) {
          const res = result.data.results[i];
          newNotifications.push(res.activities[0]);
        }
        // if the response has a "next", that there is more to load
        // next is either the string to request or an empty string (not saving it to state as it has the api key and other unncessary data in it)
        this.setState({
          notifications: [...this.state.notifications, ...newNotifications],
          loading: false,
          refreshing: false,
          hasMore: result.data.next.length > 0,
          loadingMore: false,
        });
      })
      .catch((err) => {
        console.warn(err);
        this.setState({hasMore: false, loading: false, refreshing: false});
        Alert.alert('Team RWB', 'Error retrieving notifications');
      });
  };

  refreshNotifications = () => {
    this.setState({notifications: [], loading: true});
    this.getNotifications();
  };

  loadMoreNotifications = () => {
    if (!this.state.hasMore || this.state.loadingMore) return;
    const notifications = this.state.notifications;
    const lastNotification = notifications[notifications.length - 1];
    this.getNotifications(lastNotification.id);
  };

  render() {
    return (
      <View style={styles.container}>
        {this.state.loading ? (
          <FullscreenSpinner />
        ) : (
          <FlatList
            refreshing={this.state.refreshing}
            onRefresh={this.refreshNotifications}
            style={{
              height: '100%',
              width: '100%',
              flex: 1,
              backgroundColor: RWBColors.white,
            }}
            data={this.state.notifications}
            keyExtractor={(item) => {
              return item.id;
            }}
            renderItem={({item, index}) => {
              return <NotificationCardDispatcher data={item} />;
            }}
            onEndReached={this.loadMoreNotifications}
            ListEmptyComponent={
              !this.state.loading ? (
                <View>
                  <Text
                    style={[
                      globalStyles.bodyCopy,
                      {textAlign: 'center', paddingVertical: 20},
                    ]}>
                    {NO_NOTIFICATIONS}
                  </Text>
                </View>
              ) : null
            }
            ListFooterComponent={
              this.state.loadingMore ? (
                <ActivityIndicator animating size="large" />
              ) : null
            }
          />
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RWBColors.white,
  },
});
