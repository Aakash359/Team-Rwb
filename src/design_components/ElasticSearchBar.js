import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  Keyboard,
  ActivityIndicator,
  StyleSheet,
  SectionList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import SearchBar from './SearchBar';
import UserCard from './UserCard';
import {rwbApi} from '../../shared/apis/api';
import debounce from 'lodash.debounce';
import {logSearchForPeople} from '../../shared/models/Analytics';
import RWBRowButton from './RWBRowButton';
import {GROUP_OPTIONS} from '../../shared/constants/EventFilters';
import {
  GROUP_SEARCH_ERROR,
  NO_GROUPS_FOUND,
  NO_GROUPS_TIP,
  NO_USERS_FOUND,
  USER_SEARCH_ERROR,
} from '../../shared/constants/ErrorMessages';

import globalStyles, {RWBColors} from '../styles';
// SVGS
import XIcon from '../../svgs/XIcon';
import GroupCard from '../group_components/GroupCard';
import {getElasticValues} from '../../shared/utils/ElasticHelpers';
import {GROUP_SEARCH_INSTRUCTIONS} from '../../shared/constants/OtherMessages';

const DEBOUNCE_MS = 500;

const types = {
  people: 'people',
  groupMembers: 'groupMembers',
  groups: 'groups',
};

const groupTitles = {
  my: 'my groups',
  other: 'other groups',
};

export default class ElasticSearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      loading: false,
      searchValue: '',
      loadingMore: false,
      offset: 0, // NOTE: unsure if this will be used/what the plan is for loading more
    };
  }

  doneSearching = () => {
    Keyboard.dismiss();
    this.setState({searchValue: '', results: [], loading: false});
    this.props.onDone();
  };

  apiSearch = (text) => {
    const type = this.props.type;
    if (type === types.people) {
      rwbApi
        .searchUser(text)
        .then((result) => {
          this.setState({results: result, loading: false});
        })
        .catch((err) => {
          Alert.alert('Team RWB', USER_SEARCH_ERROR);
          this.setState({loading: false, results: []});
        });
    } else if (type === types.groups) {
      // api call to search groups
      rwbApi
        .searchGroups(text, this.props.location, this.state.offset)
        .then((result) => {
          this.setState({
            results: this.separateGroups(result),
            loading: false,
            offset: result.offset,
          });
        })
        .catch((err) => {
          Alert.alert('Team RWB', GROUP_SEARCH_ERROR);
          this.setState({loading: false});
        });
    } else if (type === types.groupMembers) {
      rwbApi
        .searchGroupMembers(text, this.props.groupId)
        .then((result) => {
          this.setState({results: result || [], loading: false});
        })
        .catch((err) => {
          Alert.alert('Team RWB', USER_SEARCH_ERROR);
          this.setState({loading: false, results: []});
        });
    }
  };

  determineInstructionsMessage = () => {
    const type = this.props.type;
    if (type === types.groups) return GROUP_SEARCH_INSTRUCTIONS;
  };

  // used for flat lists
  determineEmptyFlatlistMessage = () => {
    const type = this.props.type;
    if (type === types.people || type === types.groupMembers)
      return NO_USERS_FOUND;
  };

  hasSectionlistResults = () => {
    const results = this.state.results;
    let hasResults = false;
    for (let i = 0; i < results.length; i++) {
      if (results[i].data.length) hasResults = true;
    }
    return hasResults;
  };

  // used for section lists
  determineEmptySectionlistMessage = ({section}) => {
    const type = this.props.type;
    if (section.data.length === 0) {
      if (type === types.groups)
        return (
          <Text style={[globalStyles.bodyCopy, styles.emptySectionMessage]}>
            {NO_GROUPS_FOUND}
          </Text>
        );
    }
    return null;
  };

  updateOptions = debounce(this.apiSearch, DEBOUNCE_MS);

  search = (text) => {
    this.setState({searchValue: text, loading: true});
    this.updateOptions(text);
  };

  handleSelectedUser = (user) => {
    this.doneSearching();
    logSearchForPeople();
    this.props.handleSelect(user);
  };

  handleSelectedGroup = (group) => {
    this.doneSearching();
    this.props.handleSelect(group.slug);
  };

  separateGroups = (groups) => {
    const myGroups = getElasticValues(groups.my_groups);
    const otherGroups = getElasticValues(groups.other_groups);
    return [
      {
        title: groupTitles.my,
        data: myGroups,
      },
      {
        title: groupTitles.other,
        data: otherGroups,
      },
    ];
  };

  handleEndReached = () => {
    const {offset, searchValue} = this.state;
    if (!offset) return;
    const type = this.props.type;
    if (type === types.people) return;
    else if (type === types.groups) {
      this.setState({loadingMore: true});
      rwbApi
        .searchGroups(searchValue, this.props.location, offset)
        .then((result) => {
          this.setState({
            results: [...this.state.results, ...result], // this will use the appendToSection
            loadingMore: false,
            offset: result.offset,
          });
        })
        .catch((err) => {
          this.setState({loadingMore: false});
          this.appendToSection(groupTitles.other, []);
        });
    }
  };

  // determine if extradata should be used, or forceupdate
  appendToSection = (title, data) => {
    const sections = this.state.results;
    let updatedSections = [];
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].title === title) {
        const updatedSection = {
          title: title,
          data: [...sections[i].data, ...data],
        };
        updatedSections.push(updatedSection);
      } else updatedSections.push(sections[i]);
    }
    this.setState({results: updatedSections});
  };

  render() {
    const {type, updateJoined, updateFavorited} = this.props;
    return (
      <View
        style={{
          width: '100%',
          backgroundColor: RWBColors.white,
          height: this.props.searching ? '100%' : null,
        }}>
        <View
          style={{
            height: 70,
            backgroundColor: this.props.whiteBackground
              ? RWBColors.white
              : RWBColors.magenta,
            width: '100%',
            paddingVertical: 10,
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          {/* Used only when the x icon is on the left instead of right (currently not used) */}
          {this.props.leftClose && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Go Back"
              style={{flex: 1, justifyContent: 'center', padding: 5}}
              onPress={this.props.leftClose}>
              <XIcon height="22" width="22" tintColor={RWBColors.white} />
            </TouchableOpacity>
          )}
          {this.props.rightSibling ? (
            <View style={styles.siblingContainer}>
              <View style={{flex: 10}}>
                <SearchBar
                  placeholder={this.props.placeholder}
                  searchSubmit={() => {}}
                  onClearSearchPressed={this.doneSearching}
                  search={this.state.searchValue}
                  onSearchTextChange={this.search}
                  onFocus={this.props.onFocus}
                  propClearSearchShowing={this.props.focused}
                />
              </View>
              <View style={{flex: 2}}>{this.props.rightSibling}</View>
            </View>
          ) : (
            <SearchBar
              placeholder={this.props.placeholder}
              searchSubmit={() => {}}
              onClearSearchPressed={this.doneSearching}
              search={this.state.searchValue}
              onSearchTextChange={this.search}
              onFocus={this.props.onFocus}
              propClearSearchShowing={this.props.focused}
            />
          )}
        </View>
        {this.props.searching ? (
          // height is to prevent a card from being cut off. A better way would be to do 100% - footer height
          <View style={{height: '90%'}}>
            {!this.state.searchValue ? (
              <Text style={[globalStyles.bodyCopy, styles.instructionsMessage]}>
                {this.determineInstructionsMessage()}
              </Text>
            ) : this.state.loading ? (
              <View style={styles.spinnerContainer}>
                <ActivityIndicator size="large" />
              </View>
            ) : this.state.results.length &&
              (type === types.people || type === types.groupMembers) ? (
              <FlatList
                data={this.state.results}
                keyExtractor={(item, index) => {
                  return item._id.toString();
                }}
                renderItem={({item}) => (
                  <UserCard
                    user={item._source}
                    onPress={() => this.handleSelectedUser(item._source)}
                    followable={false}
                  />
                )}
              />
            ) : this.state.results.length && type === types.groups ? (
              // footers for section lists return per list
              // if there are no results in any section, display something different
              this.hasSectionlistResults() ? (
                <SectionList
                  stickySectionHeadersEnabled={false}
                  contentContainerStyle={{paddingBottom: 20}}
                  sections={this.state.results}
                  keyExtractor={(item, index) => {
                    return item.id.toString();
                  }}
                  renderSectionFooter={this.determineEmptySectionlistMessage}
                  renderItem={(group) => (
                    <GroupCard
                      horizontal={true}
                      group={group}
                      updateJoined={updateJoined}
                      updateFavorited={updateFavorited}
                      searchPressed={this.doneSearching}
                    />
                  )}
                  renderSectionHeader={({section: {title}}) => (
                    <Text
                      style={[
                        globalStyles.formLabel,
                        globalStyles.sectionLabelSpacing,
                      ]}>
                      {title.toUpperCase()}
                    </Text>
                  )}
                  // look more into this, does not properly work with scrolling to load more
                  onMomentumScrollBegin={() => {
                    // this.onEndReachedCallDuringMomentum = false;
                  }}
                  onEndReached={() => {
                    // if (!this.onEndReachedCallDuringMomentum) {
                    this.handleEndReached();
                    // this.onEndReachedCallDuringMomentum = true;
                    // }
                  }}
                  ListFooterComponent={
                    this.state.loadingMore ? (
                      <View>
                        <ActivityIndicator size="large" />
                      </View>
                    ) : null
                  }
                />
              ) : (
                <Text
                  style={[globalStyles.bodyCopy, styles.instructionsMessage]}>
                  {NO_GROUPS_TIP}
                </Text>
              )
            ) : this.state.searchValue ? (
              <View style={styles.emptyMessageContainer}>
                <Text>{this.determineEmptyFlatlistMessage()}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '50%',
  },
  emptyMessageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '50%',
  },
  instructionsMessage: {
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: '5%',
  },
  emptySectionMessage: {
    marginHorizontal: '5%',
    marginTop: 10,
  },
  siblingContainer: {
    flexDirection: 'row',
    flex: 1,
    // width: '90%',
    justifyContent: 'space-around',
  },
});
