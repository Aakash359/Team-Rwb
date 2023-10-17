import React, {Component} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import ChevronBack from '../../svgs/ChevronBack';
import EventsListView from '../event_components/EventsListView';
import globalStyles, {RWBColors} from '../styles';
import NavTabs from '../design_components/NavTabs';
import {
  CHALLENGE_EVENT_TAB_TYPES,
  CHALLENGE_EVENT_NAV_ELEMENTS,
} from '../../shared/constants/EventTabs';

export default class ChallengeEventList extends Component {
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
          <Text style={[globalStyles.title, {top: 3, marginBottom: 4}]}>
            Events
          </Text>
          <Text style={globalStyles.titleSubheader}>
            {navigation.getParam('challengeName')}
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
    const initialTab = this.props.navigation.getParam('initialTab')
    this.upcomingRef = React.createRef();
    this.pastRef = React.createRef();
    this.state = {
      activeTab: initialTab === CHALLENGE_EVENT_TAB_TYPES.past || initialTab === CHALLENGE_EVENT_TAB_TYPES.upcoming ? initialTab : CHALLENGE_EVENT_TAB_TYPES.upcoming,
      collapsedHeader: false,
    };
  }

  setCollapsedHeader = (collapsed) => {
    this.setState({collapsedHeader: collapsed});
  };

  setFlag = (flag) => {
    this.clearEvents();
    this.setState({activeTab: flag});
  };

  clearEvents = () => {
    const {activeTab} = this.state;
    if (activeTab === CHALLENGE_EVENT_TAB_TYPES.upcoming)
      this.upcomingRef?.current?.clearEvents();
    else if (activeTab === CHALLENGE_EVENT_TAB_TYPES.past)
      this.pastRef?.current?.clearEvents();
    else throw new Error("Expecting activeTab of 'upcoming' or 'past");
  };

  render() {
    return (
      <View style={styles.container}>
        {!this.state.collapsedHeader ? (
          <View>
            <NavTabs
              tabs={CHALLENGE_EVENT_NAV_ELEMENTS}
              selected={this.state.activeTab}
              handleOnPress={this.setFlag}
            />
          </View>
        ) : null}
        {this.state.activeTab === CHALLENGE_EVENT_TAB_TYPES.upcoming ? (
          <EventsListView
            activeTab={CHALLENGE_EVENT_TAB_TYPES.upcoming}
            collapseHeader={this.setCollapsedHeader}
            collapsedHeader={this.state.collapsedHeader}
            navigation={this.props.navigation}
            challengeId={this.props.navigation.getParam('challengeId')}
            ref={this.upcomingRef}
          />
        ) : (
          <EventsListView
            activeTab={CHALLENGE_EVENT_TAB_TYPES.past}
            collapseHeader={this.setCollapsedHeader}
            collapsedHeader={this.state.collapsedHeader}
            navigation={this.props.navigation}
            challengeId={this.props.navigation.getParam('challengeId')}
            ref={this.pastRef}
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
  headerBar: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 5,
  },
  iconView: {
    width: 16,
    height: 16,
  },
  eventHeaderContainer: {
    height: 70,
    paddingTop: 20,
    backgroundColor: RWBColors.magenta,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
