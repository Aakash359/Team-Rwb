import React, {Component} from 'react';
import Header from '../Header';
import SearchBar from '../SearchBar';
import styles from './GroupMembers.module.css';
import GroupMembersList from './GroupMembersList';
import {userProfile} from '../../../../shared/models/UserProfile';
import {rwbApi} from '../../../../shared/apis/api';
import Loading from '../Loading';
import {hasReachedBottom} from '../../BrowserUtil';
import debounce from 'lodash.debounce';
import {USER_SEARCH_ERROR} from '../../../../shared/constants/ErrorMessages';
import UsersList from '../feed/UsersList';

const DEBOUNCE_MS = 500;

export class GroupMembers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      groupId: props.match.params?.groupId,
      groupName: props.location.state?.groupName,
      admins: [],
      chapterCaptains: [],
      members: [],
      loading: true,
      loadingMore: false,
      // search group members
      search: '',
      searchingMembers: false,
      searchResults: [],
      searchLoading: false,
      searchLoadingMore: false,
      canLoadMore: true,
      page: 1,
    };
  }

  componentDidMount() {
    this.loadUsers();

    window.addEventListener('scroll', this.trackScrolling);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.trackScrolling);
  }

  trackScrolling = (event) => {
    event.preventDefault();

    const wrappedElement = document.getElementById('root');
    if (hasReachedBottom(wrappedElement)) {
      this.loadMoreUsers();
      window.removeEventListener('scroll', this.trackScrolling);
    }
  };

  loadUsers = () => {
    const {groupId, page} = this.state;
    rwbApi
      .retrieveGroupMembers(groupId, page)
      .then((result) => this.separateData(result));
  };

  loadMoreUsers = () => {
    const {loadingMore, loading, canLoadMore, groupId, page} = this.state;

    if (!loadingMore && !loading && canLoadMore) {
      this.setState({loadingMore: true});
      rwbApi.retrieveGroupMembers(groupId, page).then((result) => {
        this.separateData(result);
        window.addEventListener('scroll', this.trackScrolling);
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

  handleUserSelect = ({id}) => this.props.history.push(`/profile/${id}`);

  handleClearSearch = () =>
    this.setState({
      search: '',
      searchResults: [],
      searchLoading: false,
      searchLoadingMore: false,
      searchingMembers: false,
    });

  searchValueChange = (text) => {
    this.setState({search: text, searchLoading: true});
    this.updateOptions(text);
  };

  updateOptions = debounce((value) => this.apiSearch(value), DEBOUNCE_MS);

  apiSearch = (text) => {
    rwbApi
      .searchGroupMembers(text, this.state.groupId)
      .then((result) => {
        this.setState({searchResults: result || [], searchLoading: false});
      })
      .catch((err) => {
        alert(`Team RWB: ${USER_SEARCH_ERROR}`);
        this.setState({searchResults: [], searchLoading: false});
      });
  };

  render() {
    const {history} = this.props;
    const {
      groupName,
      admins,
      chapterCaptains,
      members,
      loading,
      loadingMore,
      search,
      searchingMembers,
      searchResults,
      searchLoading,
    } = this.state;

    return (
      <div id="root">
        <Header
          title={'Members'}
          subtitle={groupName}
          onBack={() => history.goBack()}
        />
        {loading ? (
          <Loading size={100} color={'var(--white)'} loading={true} right />
        ) : (
          <>
            <div className={styles.searchContainer}>
              <SearchBar
                value={search}
                onChange={this.searchValueChange}
                onSubmit={() => {}}
                onClearSearch={this.handleClearSearch}
                placeholder={'Search for Members'}
                onFocus={() => this.setState({searchingMembers: true})}
                searching={searchingMembers}
              />
            </div>
            {searchingMembers ? (
              <UsersList
                usersSuggestions={searchResults}
                loadingUsers={searchLoading}
                onSelect={this.handleUserSelect}
                search={search}
              />
            ) : (
              <>
                {/* I suppose each section (admins, captain, members) will be returned as a separate array from the backend */}
                <GroupMembersList
                  label="admins"
                  isSponsor={this.props.location.state?.groupType === 'sponsor'}
                  data={admins}
                  onSelect={this.handleUserSelect}
                />
                {/* If an array is not empty, show chapter captain */}
                <GroupMembersList
                  label="chapter captain"
                  data={chapterCaptains}
                  onSelect={this.handleUserSelect}
                />
                <GroupMembersList
                  label="members"
                  data={members}
                  onSelect={this.handleUserSelect}
                />

                {loadingMore && (
                  <Loading
                    size={60}
                    color={'var(--grey20)'}
                    loading={true}
                    footerLoading
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  }
}

export default GroupMembers;
