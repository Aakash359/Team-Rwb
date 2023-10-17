/*
Current Schema:
    EventView uses navigation.props to pass EventAttendees the following:
        an event's eagle leader,
        checked_in userlist,
        going userlist,
        interested userlist,
        and whether the event is today.
    
    EventAttendees then hands AttendeesList the eagle leader and one of the three prior lists to render.

    AttendeesList wraps a FlatList component, which then renders Attendee components using the list given by EventAttendees.

Needed Fixes:
    EventAttendees might need to query FireFly's API to for info about the event's user, instead of being given info by EventView.
*/

import React from 'react';
import {View, StyleSheet, ActivityIndicator, Alert, Text} from 'react-native';
import NavTabs from '../design_components/NavTabs';
import AttendeeList from './AttendeeList';

import {rwbApi} from '../../shared/apis/api';
import {ATTENDANCE_SLUGS} from '../../shared/constants/AttendanceSlugs';
import globalStyles, {RWBColors} from '../styles';
import EventHostCard from './EventHostCard';
import FooterSpinner from '../design_components/FooterSpinner';

const navTabCheckedIn = [
  {
    name: 'Checked In',
    key: ATTENDANCE_SLUGS.checkedin,
  },
];
const navTabOptions = [
  {
    name: 'Going',
    key: ATTENDANCE_SLUGS.going,
  },
  {
    name: 'Interested',
    key: ATTENDANCE_SLUGS.interested,
  },
];

export default class EventAttendees extends React.Component {
  static navigationOptions = {
    headerTitle: () => (
      <Text style={[globalStyles.title, {top: 3}]}>Attendees</Text>
    ),
    headerStyle: {
      backgroundColor: RWBColors.magenta,
    },
    headerTintColor: RWBColors.white,
  };

  constructor(props) {
    super(props);

    const {navigation} = this.props;
    const value = navigation.getParam('value', null);
    if (value === null)
      throw new Error('Navigation `value` must be populated.');
    let {today, going, interested, checked_in, host, eventID} = value;

    this.state = {
      today,
      going,
      checked_in,
      interested,
      host,
      navTab: today ? [...navTabCheckedIn, ...navTabOptions] : navTabOptions,
      visibleList: today ? ATTENDANCE_SLUGS.checkedin : ATTENDANCE_SLUGS.going,
      eventID,

      // page 0 for all of these is provided by navigation value.
      goingPage: 1,
      interestedPage: 1,
      checkedInPage: 1,

      finishedGoing: going.length < 10,
      finishedInterested: interested.length < 10,
      finishedCheckedIn: checked_in.length < 10,

      isLoading: false,
    };
    this.setFlag = this.setFlag.bind(this);
    this.onEndReached = this.onEndReached.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.renderSeparator = this.renderSeparator.bind(this);
  }

  setFlag(flag) {
    this.setState({
      visibleList: flag,
    });
  }

  onEndReached(status) {
    const {
      isLoading,
      finishedInterested,
      finishedGoing,
      finishedCheckedIn,
    } = this.state;

    if (
      isLoading ||
      (status === ATTENDANCE_SLUGS.interested && finishedInterested) ||
      (status === ATTENDANCE_SLUGS.going && finishedGoing) ||
      (status === ATTENDANCE_SLUGS.checkedin && finishedCheckedIn)
    ) {
      return;
    } else {
      this.loadMore(status);
    }
  }

  loadMore(status) {
    const {eventID} = this.state;
    let page;
    let list;
    if (status === ATTENDANCE_SLUGS.interested) {
      page = this.state.interestedPage;
      list = this.state.interested;
    } else if (status === ATTENDANCE_SLUGS.going) {
      page = this.state.goingPage;
      list = this.state.going;
    } else if (status === ATTENDANCE_SLUGS.checkedin) {
      page = this.state.checkedInPage;
      list = this.state.checked_in;
    } else {
      throw new Error('No status to query attendees for.');
    }
    this.setState({
      isLoading: true,
    });
    rwbApi
      .getMobileAttendees(eventID, status, page)
      .then((responseJson) => {
        let attendees;
        let userCount;
        if (responseJson.going) {
          attendees = responseJson.going.attendees;
          userCount = responseJson.going.total_count;
        } else if (responseJson.interested) {
          attendees = responseJson.interested.attendees;
          userCount = responseJson.interested.total_count;
        } else if (responseJson.checked_in) {
          attendees = responseJson.checked_in.attendees;
          userCount = responseJson.checked_in.total_count;
        }
        // set the total page to by user count divided by 10, always rounding up
        const totalPages = Math.ceil(userCount / 10);
        this.setState(
          Object.assign(
            {isLoading: false},

            status === ATTENDANCE_SLUGS.interested
              ? {
                  interested: [...list, ...attendees],
                  interestedPage: this.state.interestedPage + 1,
                }
              : status === ATTENDANCE_SLUGS.going
              ? {
                  going: [...list, ...attendees],
                  goingPage: this.state.goingPage + 1,
                }
              : {
                  checked_in: [...list, ...attendees],
                  checkedInPage: this.state.checkedInPage + 1,
                },
            // if the current page matches the max pages calculated, stop loading
            totalPages === page
              ? status === ATTENDANCE_SLUGS.interested
                ? {finishedInterested: true}
                : status === ATTENDANCE_SLUGS.going
                ? {finishedGoing: true}
                : {finishedCheckedIn: true}
              : {},
          ),
        );
      })
      .catch((error) => {
        Alert.alert(
          'Team RWB',
          'There was an error fetching the rest of the event attendees.',
        );
      })
      .finally(() => {
        this.setState({
          isLoading: false,
        });
      });
  }

  renderHeader() {
    const {host} = this.state;
    return (
      <View>
        <EventHostCard host={host} />
        {this.renderSeparator()}
      </View>
    );
  }

  renderFooter() {
    const {isLoading} = this.state;
    if (!isLoading) {
      return null;
    }
    return <FooterSpinner />;
  }

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
    const {
      going,
      interested,
      checked_in,
      navTab,
      visibleList,
      host,
    } = this.state;

    return (
      <View style={{flex: 1, backgroundColor: RWBColors.white}}>
        <NavTabs
          tabs={navTab}
          selected={visibleList}
          handleOnPress={this.setFlag}
        />
        <AttendeeList
          host={host}
          userList={
            visibleList === 'checked_in'
              ? checked_in
              : visibleList === 'going'
              ? going
              : interested
          }
          renderHeader={this.renderHeader}
          renderFooter={this.renderFooter}
          renderSeparator={this.renderSeparator}
          onEndReached={(info) => {
            this.onEndReached(visibleList);
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: RWBColors.white,
    height: 40,
    width: '100%',
    justifyContent: 'space-evenly',
    alignContent: 'stretch',
  },
});
