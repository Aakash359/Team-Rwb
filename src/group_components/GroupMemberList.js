import React, {Component} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {rwbApi} from '../../shared/apis/api';
import ChevronBack from '../../svgs/ChevronBack';
import ElasticSearchBar from '../design_components/ElasticSearchBar';
import FooterSpinner from '../design_components/FooterSpinner';
import FullscreenSpinner from '../design_components/FullscreenSpinner';
import UserCard from '../design_components/UserCard';
import NavigationService from '../models/NavigationService';
import globalStyles, {RWBColors} from '../styles';

export default class GroupMemberList extends Component {
  constructor(props) {
    super(props);
    this.groupId = this.props.navigation.getParam('groupId');
    this.state = {
      admins: [],
      chapterCaptains: [],
      members: [],
      loading: true,
      loadingMore: false,
      refreshing: false,
      searchingUsers: false,
      canLoadMore: true,
      page: 1,
    };
  }

  componentDidMount() {
    this.loadUsers();
  }

  loadUsers = () => {
    if (this.state.canLoadMore && !this.state.loadingMore) {
      rwbApi
        .retrieveGroupMembers(this.groupId, this.state.page)
        .then((result) => {
          this.separateData(result);
        });
    }
  };

  loadMoreUsers = () => {
    if (
      !this.state.loadingMore &&
      !this.state.loading &&
      this.state.canLoadMore
    ) {
      this.setState({loadingMore: true});
      rwbApi
        .retrieveGroupMembers(this.groupId, this.state.page)
        .then((result) => {
          this.separateData(result);
        });
    }
  };

  separateData = (users) => {
    const page = this.state.page;
    this.setState({
      admins: users?.admins?.length ? users.admins : this.state.admins,
      chapterCaptains: users?.chapter_captains?.length
        ? users.chapter_captains
        : this.state.chapterCaptains,
      members: [...this.state.members, ...users.members],
      loadingMore: false,
      loading: false,
      canLoadMore: users.members.length === 10,
      page: page + 1,
    });
  };

  formatResults = () => {
    return [
      {
        title: 'ADMINS',
        data: this.state.admins,
      },
      {
        title: 'CHAPTER CAPTAIN',
        data: this.state.chapterCaptains,
      },
      {
        title: 'MEMBERS',
        data: this.state.members,
      },
    ];
  };

  handleUserSelected = (user) => {
    NavigationService.navigateIntoInfiniteStack(
      'GroupProfileAndEventDetailsStack',
      'profile',
      {id: user.id},
    );
  };

  static navigationOptions = ({navigation}) => {
    return {
      headerStyle: {
        backgroundColor: RWBColors.magenta,
      },
      headerTintColor: RWBColors.white,
      // the shared header config is in app.js
      headerLeft: () => (
        <TouchableOpacity
          onPress={NavigationService.back}
          style={{marginLeft: Dimensions.get('window').width * 0.05}}
          accessibilityLabel="Go Back"
          accessibilityRole="button">
          <ChevronBack style={globalStyles.chevronBackImage} />
        </TouchableOpacity>
      ),
      headerRight: () => null,
      headerTitle: () => (
        <View style={styles.headerBar}>
          <Text
            style={[
              globalStyles.title,
              {textAlign: 'center', marginBottom: 5},
            ]}>
            Members
          </Text>
          <Text style={[globalStyles.titleSubheader, {textAlign: 'center'}]}>
            {navigation.getParam('groupName').toUpperCase()}
          </Text>
        </View>
      ),
    };
  };

  render() {
    return (
      <SafeAreaView style={{backgroundColor: RWBColors.magenta}}>
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: RWBColors.white,
          }}>
          <ElasticSearchBar
            placeholder="Search for Members"
            type="groupMembers"
            onFocus={() => this.setState({searchingUsers: true})}
            searching={this.state.searchingUsers}
            focused={this.state.searchingUsers}
            onDone={() => this.setState({searchingUsers: false})}
            handleSelect={this.handleUserSelected}
            whiteBackground={true}
            groupId={this.groupId}
          />
          {this.state.loading && <FullscreenSpinner />}
          <SectionList
            sections={this.formatResults()}
            contentContainerStyle={{paddingBottom: 75}}
            stickySectionHeadersEnabled={false}
            keyExtractor={(item, index) => item + index}
            renderItem={({item, section}) => (
              <UserCard
                stack={'group'}
                user={item}
                isSponsor={
                  this.props.navigation.getParam('groupType', null) ===
                    'sponsor' && section.title.toLowerCase() === 'admins'
                }
              />
            )}
            onEndReached={this.loadMoreUsers}
            renderSectionHeader={({section: {title}}) => (
              <Text
                style={[
                  globalStyles.formLabel,
                  globalStyles.sectionLabelSpacing,
                ]}>
                {title}
              </Text>
            )}
            renderSectionFooter={({section: {title}}) => {
              // admins and chapter captains should all be retrieved on initial load
              // only display the spinner on the members section
              if (title === 'MEMBERS')
                return this.state.loadingMore && <FooterSpinner />;
            }}
          />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  headerBar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: RWBColors.magenta,
    height: '100%',
    marginHorizontal: 0,
    marginTop: 0,
  },
});
