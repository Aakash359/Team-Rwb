import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import globalStyles, {RWBColors} from '../styles';
import UserCard from '../design_components/UserCard';

import debounce from 'lodash.debounce';
import XIcon from '../../svgs/XIcon';
import {rwbApi} from '../../shared/apis/api';

const DEBOUNCE_MS = 500;

export default class InviteUsersView extends Component {
  constructor(props) {
    super(props);
    this.selectionStart = 0;
    this.selectionEnd = 0;
    this.state = {
      searchingUsers: false,
      userResults: [],
      selectedUsers: this.props.invitedUsers, // array of already chosen users, empty array by default
      searchValue: '',
      loading: false,
    };
  }

  apiUserSearch = (text) => {
    rwbApi.searchUser(text).then((result) => {
      this.setState({userResults: result, loading: false});
    });
  };

  updateOptions = debounce(this.apiUserSearch, DEBOUNCE_MS);

  searchUser = (text) => {
    this.setState({searchValue: text, loading: true});
    this.updateOptions(text);
  };

  handleTextInput = (text) => {
    const lastChar = text.charAt(text.length - 1);
    if (lastChar === '@') {
      this.setState({searchingUsers: true});
    }
  };

  handleKeyPress = (event) => {
    const selectedUsers = this.state.selectedUsers;
    if (event.key === 'Backspace' && selectedUsers.length) {
      const inputTextLength = this.displaySelectedUsers().length;
      let indexes = []; //index of user to be removed
      let lengthOfPrevUsers = 0; // keep track of the length of other users not being deleted
      // when the cursor is at the end of the text input
      if (this.selectionStart === inputTextLength) selectedUsers.pop();
      // unhighlighted selection cursor
      else if (this.selectionStart === this.selectionEnd) {
        for (let i = 0; i < selectedUsers.length; i++) {
          const user = selectedUsers[i];
          if (user.name.length + 1 + lengthOfPrevUsers > this.selectionStart) {
            indexes.push(i);
            break;
          } else lengthOfPrevUsers += user.name.length + 1;
        }
      }

      // highlighting select, enabling the deletion of multiple users
      // TODO: FIGURE OUT RANGE FOR SELECTION DELETION
      else {
        for (let i = 0; i < selectedUsers.length; i++) {
          const user = selectedUsers[i];
          if (selectedUsers[i].toString().charAt())
            lengthOfPrevUsers += user.name.length + 1;
        }
      }

      if (indexes.length) {
        for (let i = indexes.length - 1; i > -1; i--) {
          selectedUsers.splice(indexes[i], 1);
        }
      }

      this.setState({selectedUsers});
    }
  };

  handleSelectionChange = (event) => {
    this.selectionStart = event.selection.start;
    this.selectionEnd = event.selection.end;
  };

  handleSelectedUser = (user) => {
    const selectedUsers = this.state.selectedUsers;
    selectedUsers.push(user);
    this.setState({
      searchingUsers: false,
      selectedUsers,
      searchValue: '',
      userResults: [],
    });
  };

  displaySelectedUsers = () => {
    const {selectedUsers} = this.state;
    let userNames = '';
    for (let i = 0; i < selectedUsers.length; i++) {
      userNames += `${selectedUsers[i].name} `;
    }
    return userNames;
  };

  render() {
    return (
      <View style={styles.container}>
        <SafeAreaView style={{flex: 1}}>
          {this.state.searchingUsers ? (
            <View style={styles.searchModal}>
              <Text
                style={[
                  globalStyles.formLabel,
                  {paddingHorizontal: '5%', marginBottom: 5},
                ]}>
                TAG USER
              </Text>
              <TextInput
                autoFocus={true}
                onChangeText={(text) => this.searchUser(text)}
                style={styles.searchBar}
              />
              {this.state.loading ? (
                <View style={styles.spinnerNoUser}>
                  <ActivityIndicator size="large" />
                </View>
              ) : this.state.userResults.length ? (
                <FlatList
                  data={this.state.userResults}
                  keyExtractor={(item, index) => {
                    return item._id.toString();
                  }}
                  renderItem={({item}) => (
                    <UserCard
                      user={item._source}
                      onPress={this.handleSelectedUser}
                      followable={false}
                    />
                  )}
                />
              ) : this.state.searchValue ? (
                <View style={styles.spinnerNoUser}>
                  <Text>No Users Found</Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.container}>
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => this.props.close()}>
                  <XIcon
                    tintColor={RWBColors.white}
                    style={globalStyles.headerIcon}
                  />
                </TouchableOpacity>
                <Text style={[globalStyles.title, {top: 2}]}>Invite Users</Text>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() =>
                    this.props.returnInvitedUsers(this.state.selectedUsers)
                  }>
                  <Text
                    style={[
                      globalStyles.h2,
                      {color: RWBColors.white, textAlign: 'right'},
                    ]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{flex: 1, backgroundColor: 'white'}}>
                <TextInput
                  placeholder="Find the users you want to invite starting with '@'"
                  placeholderTextColor={RWBColors.grey40}
                  onChangeText={(text) => this.handleTextInput(text)}
                  onKeyPress={({nativeEvent}) =>
                    this.handleKeyPress(nativeEvent)
                  }
                  value={this.displaySelectedUsers()}
                  style={[
                    globalStyles.h3,
                    {paddingHorizontal: '5%', paddingVertical: 20},
                  ]}
                  onSelectionChange={({nativeEvent}) =>
                    this.handleSelectionChange(nativeEvent)
                  }
                  contextMenuHidden={true} //disable highlighting of text
                />
              </View>
            </View>
          )}
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RWBColors.magenta,
    paddingTop: 16,
    paddingBottom: 10,
    paddingHorizontal: '5%',
  },
  userContainer: {
    marginTop: 8,
    flexDirection: 'row',
  },
  headerButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: RWBColors.magenta,
  },
  searchModal: {
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
  },
  searchBar: {
    borderBottomColor: RWBColors.grey80,
    borderBottomWidth: 1,
    width: '90%',
    paddingBottom: 3,
    alignSelf: 'center',
    color: 'black',
  },
  spinnerNoUser: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '50%',
  },
});
