import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';

import {rwbApi} from '../../shared/apis/api';

import globalStyles, {RWBColors} from '../styles';
import ShareWorkoutCard from '../challenge_components/ShareWorkoutCard';
import {hoursMinutesSecondsFromMinutes} from '../../shared/utils/ChallengeHelpers';
import ChevronBack from '../../svgs/ChevronBack';
import {PROFILE_TAB_LABELS} from '../../shared/constants/Labels';
import NavigationService from '../models/NavigationService';

export default class WorkoutLogView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
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
        <View style={styles.headerBar}>
          <Text style={globalStyles.title}>
            {PROFILE_TAB_LABELS.CHALLENGE_WORKOUT_LOGS}
          </Text>
        </View>
      ),
      headerStyle: {
        backgroundColor: RWBColors.magenta,
      },
      headerTintColor: RWBColors.white,
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      refreshing: false,
      /*TODO: add pagination*/
      loadingMore: false,
      workouts: [],
    };
  }

  componentDidMount = () => {
    this.getUserWorkouts();
  };

  getUserWorkouts = () => {
    this.setState({refreshing: true});
    rwbApi
      .getUserWorkouts()
      .then((workouts) => {
        this.setState({workouts: workouts.data});
      })
      .catch((err) => {
        Alert.alert('Team RWB', 'Error retrieving user workouts');
      })
      .finally(() => {
        this.setState({refreshing: false, isLoading: false});
      });
  };

  /*TODO*/
  loadMore = () => {};

  navigateToEvent = (eventId) => {
    // since EventView is part of the MyProfileStack view, navigate to the event tab and then to the event
    NavigationService.navigate('Events');
    NavigationService.popStack();
    NavigationService.navigate('EventView', {eventTitle: eventId});
  };

  render() {
    const {workouts} = this.state;
    return (
      <View style={styles.container}>
        {this.state.isLoading && (
          <View style={globalStyles.spinnerOverLay}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <FlatList
          onRefresh={this.getUserWorkouts}
          refreshing={this.state.refreshing}
          style={styles.listContainer}
          contentContainerStyle={{paddingBottom: 20}}
          data={workouts?.sort(
            (a, b) => Date.parse(b.entry_date) - Date.parse(a.entry_date),
          )}
          keyExtractor={(item, index) => item.event_id}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => this.navigateToEvent(item.event_id)}>
              <ShareWorkoutCard
                eventName={item.event_name}
                chapterName={item.chapter_name}
                eventStartTime={item.entry_date}
                miles={item.miles}
                steps={item.steps}
                hours={hoursMinutesSecondsFromMinutes(item.minutes).hours}
                minutes={hoursMinutesSecondsFromMinutes(item.minutes).minutes}
                seconds={hoursMinutesSecondsFromMinutes(item.minutes).seconds}
                eventID={item.event_id}
                getUserWorkouts={this.getUserWorkouts}
                backgroundColor={'white'}
                shareAndDeleteModal={true}
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !this.state.isLoading && (
              <View style={styles.emptyListContainer}>
                <Text style={[globalStyles.bodyCopy, {textAlign: 'center'}]}>
                  Your recorded workouts from challenge events will appear here.
                </Text>
              </View>
            )
          }
          // TODO: load more
          ListFooterComponent={<></>}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
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
  listContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: RWBColors.white,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  emptyListContainer: {
    paddingTop: 15,
    alignItems: 'center',
    paddingHorizontal: 50,
  },
});
