import React from 'react';
import {
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  View,
  ActivityIndicator,
  SectionList,
  Linking,
} from 'react-native';
import {NavigationEvents} from 'react-navigation';
import NavTabs from '../design_components/NavTabs';
import FullscreenSpinner from '../design_components/FullscreenSpinner';
import globalStyles, {RWBColors} from '../styles';
import {
  NO_ACTIVE_CHALLENGES,
  NO_PAST_CHALLENGES,
} from '../../shared/constants/OtherMessages';
import {
  CHALLENGE_TAB_TYPES,
  ACTIVE_CHALLENGE_TYPES,
} from '../../shared/constants/ChallengeTabs';
import {rwbApi} from '../../shared/apis/api';
import ChallengeCardDispatcher from './ChallengeCardDispatcher';
import {
  challengeParams,
  separateUnjoinedChallenges,
} from '../../shared/utils/ChallengeHelpers';
import NavigationService from '../models/NavigationService';
import {userProfile} from '../../shared/models/UserProfile';
import {CHALLENGE_EVENT_TAB_TYPES} from '../../shared/constants/EventTabs';

export default class ChallengeTab extends React.Component {
  constructor(props) {
    super(props);
    this.firstLaunch = true;
    this.state = {
      activeTab: 'active',
      refreshing: false,
      loading: true,
      // loadingMore: false,
      yourActiveChallenges: [],
      availableChallenges: [],
      upcomingChallenges: [],
      pastChallenges: [],
      hasMore: false,
      // page: 0,
    };
  }

  componentDidMount() {
    Linking.addEventListener('url', this.handleURL);
    this.getChallenges();
    this.getPastChallenges();
  }

  handleURL = (linkObj) => {
    this.firstLaunch = false;
    let url = linkObj.url;
    if (url && url.includes('challenges')) {
      let challengeID = url.split('challenges/')[1];
      if (challengeID && challengeID !== '/') {
        // truncate trailing parameter (e.g. valor-challenge:
        // DOMAIN/challenges/23?_ga=$GoogleAnalyticsParmeter)
        if (challengeID.includes('?')) {
          challengeID = challengeID.split('?')[0];
        }
        this.navToChallenge(challengeID);
      }
    }
  };

  navToChallenge = (challengeID, initialTab) => {
    NavigationService.navigate('ChallengeView', {
      challengeId: challengeID,
      deepLinkingTab: initialTab,
      onChallengeJoined: this.refreshChallenges,
    });
  };

  setFlag = (flag) => {
    this.setState({activeTab: flag});
  };

  refreshChallenges = () => {
    this.setState(
      {
        loading: true,
        page: 0,
      },
      () => {
        if (this.state.activeTab === 'active') {
          this.setState({
            yourActiveChallenges: [],
            availableChallenges: [],
            upcomingChallenges: [],
          });
          this.getChallenges();
        } else if (this.state.activeTab === 'past') {
          this.setState({pastChallenges: []});
          this.getPastChallenges();
        }
      },
    );
  };

  // loadMoreChallenges = () => {
  // pagination is supported currently, implement later
  //   if (!this.state.hasMore || this.state.loadingMore) return;
  //   this.setState({loadingMore: true});
  //   if (this.state.activeTab === 'active') {
  //     this.getChallenges();
  //   } else if (this.state.activeTab === 'past') {
  //     this.getPastChallenges();
  //   }
  // };

  getChallenges = () => {
    rwbApi
      .getChallenges(challengeParams('active'))
      .then((result) => {
        this.separateData(result);
      })
      .catch((err) => {
        console.warn(err);
      })
      .finally(() => {
        this.getChallengesFinished();
      });
  };

  getPastChallenges = () => {
    rwbApi
      .getChallenges(challengeParams('past'))
      .then((result) => {
        this.setState({
          pastChallenges: this.sortChallengesDescending(result.data.joined),
        });
      })
      .catch((err) => {
        console.warn(err);
      })
      .finally(() => {
        this.getChallengesFinished();
      });
  };

  getChallengesFinished = () => {
    this.setState({
      loading: false,
      refreshing: false,
      // loadingMore: false,
    });
  };

  separateData = (challenges) => {
    // const {page} = this.state;
    // querying pages starts at zero, total number of pages starts at 0
    // const newPage =
    //   challenges.data.length === 10 && page < challenges.total_number_pages - 1
    //     ? page + 1
    //     : page;
    const unjoinedChallenges = separateUnjoinedChallenges(
      challenges.data.unjoined,
    );
    this.setState({
      // page: newPage,
      yourActiveChallenges: challenges.data.joined,
      availableChallenges: unjoinedChallenges.availableChallenges,
      upcomingChallenges: unjoinedChallenges.upcomingChallenges,
      // hasMore: newPage > page,
    });
  };

  sortChallengesDescending = (challenges) => {
    return challenges.sort(
      (a, b) => new Date(b.end_date) - new Date(a.end_date),
    );
  };

  formatSections = () => {
    return [
      {
        title: ACTIVE_CHALLENGE_TYPES.joined,
        data: this.state.yourActiveChallenges,
      },
      {
        title: ACTIVE_CHALLENGE_TYPES.unjoined,
        data: this.state.availableChallenges,
      },
      {
        title: ACTIVE_CHALLENGE_TYPES.upcoming,
        data: this.state.upcomingChallenges,
      },
    ];
  };

  handleWillFocus = () => {
    this.refreshChallenges();
  };

  handleWillBlur = () => {
    if (NavigationService.getCurrentTab() !== 'Challenges') {
      this.setState({activeTab: 'active'});
    }
  };

  // navigate to specific challenge if id is passed from deep link
  handleDidFocus = () => {
    const challengeID = this.props.navigation.getParam('challengeID');
    // check if deep link is navigating to challenge event list
    let initialTab = null;
    if (this.props.navigation.getParam('events') === 'events') {
      if (this.props.navigation.getParam('tab') === 'past') {
        initialTab = CHALLENGE_EVENT_TAB_TYPES.past;
      } else {
        initialTab = CHALLENGE_EVENT_TAB_TYPES.upcoming;
      }
    }
    const userId = userProfile.getUserProfile().id;
    this.props.navigation.setParams({challengeID: null});
    if (!userId) {
      userProfile.init().then(() => {
        if (challengeID && this.firstLaunch) {
          this.navToChallenge(challengeID, initialTab);
        }
      });
    } else {
      if (challengeID && this.firstLaunch) {
        this.navToChallenge(challengeID, initialTab);
      }
    }
  };

  render() {
    return (
      <SafeAreaView
        style={[
          globalStyles.tabScreenContainer,
          {backgroundColor: RWBColors.magenta},
        ]}>
        <NavigationEvents
          onWillFocus={this.handleWillFocus}
          onWillBlur={this.handleWillBlur}
          onDidFocus={this.handleDidFocus}
        />
        <View style={{width: '100%', backgroundColor: RWBColors.white}}>
          <View style={styles.header}>
            <Text style={[globalStyles.title, styles.headerText]}>
              Challenges
            </Text>
          </View>
        </View>
        <NavTabs
          tabs={CHALLENGE_TAB_TYPES}
          selected={this.state.activeTab}
          handleOnPress={this.setFlag}
        />
        {this.state.loading ? (
          <FullscreenSpinner />
        ) : this.state.activeTab === 'active' ? (
          <SectionList
            sections={this.formatSections()}
            stickySectionHeadersEnabled={false}
            refreshing={this.state.refreshing}
            onRefresh={this.refreshChallenges}
            style={styles.activeListContainer}
            keyExtractor={(item, index) => item + index}
            renderItem={({item, section}) => (
              <ChallengeCardDispatcher
                joined={section.title === ACTIVE_CHALLENGE_TYPES.joined}
                challenge={item}
                ended={false}
                onChallengeJoined={this.refreshChallenges}
              />
            )}
            renderSectionHeader={({section: {title}}) => (
              <Text style={[globalStyles.h3, styles.sectionHeaderText]}>
                {title.toUpperCase()}
              </Text>
            )}
            // onEndReached={this.loadMoreChallenges}
            ListEmptyComponent={
              !this.state.loading ? (
                <View>
                  <Text
                    style={[
                      globalStyles.bodyCopy,
                      {textAlign: 'center', paddingVertical: 20},
                    ]}>
                    {NO_ACTIVE_CHALLENGES}
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
        ) : this.state.activeTab === 'past' ? (
          <FlatList
            refreshing={this.state.refreshing}
            onRefresh={this.refreshChallenges}
            style={styles.pastListContainer}
            data={this.state.pastChallenges}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => (
              <ChallengeCardDispatcher
                joined={true}
                challenge={item}
                onChallengeJoined={this.refreshChallenges}
              />
            )}
            // onEndReached={this.loadMoreChallenges}
            ListEmptyComponent={
              !this.state.loading ? (
                <View>
                  <Text
                    style={[
                      globalStyles.bodyCopy,
                      {textAlign: 'center', paddingVertical: 20},
                    ]}>
                    {NO_PAST_CHALLENGES}
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
        ) : null}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    backgroundColor: RWBColors.white,
  },
  header: {
    width: '100%',
    height: 45,
    backgroundColor: RWBColors.magenta,
    justifyContent: 'center',
  },
  headerText: {
    textAlign: 'center',
  },
  sectionHeaderText: {
    color: '#888',
    textAlign: 'center',
    paddingVertical: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
  },
  activeListContainer: {
    height: '100%',
    width: '100%',
    flex: 1,
    backgroundColor: RWBColors.white,
    paddingTop: 5,
    paddingHorizontal: 10,
  },
  pastListContainer: {
    height: '100%',
    width: '100%',
    flex: 1,
    backgroundColor: RWBColors.white,
    paddingTop: 20,
    paddingHorizontal: 10,
  },
});
