import React, {Component} from 'react';
import GroupContainer from './GroupContainer';
import SearchBar from '../SearchBar';
import styles from './Groups.module.css';
import {Switch, Route} from 'react-router-dom';
import GroupDetail from './GroupDetail';
import {rwbApi} from '../../../../shared/apis/api';
import {userProfile} from '../../../../shared/models/UserProfile';
import {
  GENERAL_LOCATION_ERROR,
  GROUP_SEARCH_ERROR,
  LOCATION_PERMISSION_ERROR,
} from '../../../../shared/constants/ErrorMessages';
import Loading from '../Loading';
import {GROUP_VERSION} from '../../../../shared/constants/OnboardingVersions';
import {isNullOrEmpty, isUpdateNeeded} from '../../../../shared/utils/Helpers';
import GroupMessages from './GroupMessages';
import SearchGroupsList from './SearchGroupsList';
import debounce from 'lodash.debounce';
import {version as currentVersion} from '../../../package.json';
import {hasReachedBottom, getCurrentPath} from '../../BrowserUtil';
import {getElasticValues} from '../../../../shared/utils/ElasticHelpers';
import Events from '../events/Events';
import GroupMembers from './GroupMembers';
import PostView from '../feed/PostView';

const DEBOUNCE_MS = 500;
const groupTitles = {
  my: 'my groups',
  other: 'other groups',
};

export default class Groups extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // group types
      favorites: [],
      admin: [],
      my: [],
      featured: [],
      activity: [],
      nearby: [],
      favoritesGroupsLoading: true,
      myGroupsLoading: true,
      featuredGroupsLoading: true,
      activityGroupsLoading: true,
      nearbyGroupsLoading: true,
      newToGroups: false,
      isLoading: true,
      // for search groups
      searchingGroups: false,
      searchLoading: false,
      searchLoadingMore: false,
      retrievedLastGroup: false,
      search: '',
      searchResults: [],
      lat: '',
      long: '',
      chapter_id: userProfile.getUserProfile().preferred_chapter.id,
    };
  }

  componentDidMount() {
    rwbApi.getAppVersion().then((savedVersion) => {
      savedVersion = savedVersion.app_version;
      if (isUpdateNeeded(savedVersion, GROUP_VERSION)) {
        this.setState({newToGroups: true});
        rwbApi.updateAppVersion(currentVersion);
      }
      this.retrieveGroups();
    });

    window.addEventListener('scroll', this.trackScrolling);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.trackScrolling);
  }

  trackScrolling = (event) => {
    event.preventDefault();

    const {searchingGroups, searchResults} = this.state;
    if (searchingGroups) {
      const wrappedElement = document.getElementById('root');
      // when switching to the tab the bottom is considered reached, but there are no posts
      // this puts the app trying to load more when it should not be
      // on start loading more when the bottom is reached AND there is some data
      if (hasReachedBottom(wrappedElement) && searchResults.length > 0) {
        this.setState({retrievedLastGroup: true}, this.loadMoreGroups);
        window.removeEventListener('scroll', this.trackScrolling);
      }
    }
  };

  getLocation = () => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const {latitude, longitude} = position.coords;
          this.setState({lat: latitude.toString(), long: longitude.toString()});
          resolve({lat: latitude.toString(), long: longitude.toString()});
        },
        (error) => {
          const chapter_id = this.state.chapter_id;
          const onGroupsPage = getCurrentPath() === '/groups';

          if (error.code === 1 && onGroupsPage) {
            alert(`Team RWB: ${LOCATION_PERMISSION_ERROR}`);
          }
          // Error code when geolocator times out.
          else {
            if (onGroupsPage) alert(`Team RWB: ${GENERAL_LOCATION_ERROR}`);
          }
          resolve({chapter_id: chapter_id});
        },
        {
          enableHighAccuracy: true,
        },
      );
    });
  };

  // load all groups
  retrieveGroups = async () => {
    this.loadAdminGroups();
    this.loadMyGroups();
    this.loadActivityGroups();
    this.loadNearbyGroups();
  };

  // not in sprint 2
  loadAdminGroups = () =>
    rwbApi
      .retrieveGroups('admin')
      .then((adminGroups) => {
        this.setState({
          admin: adminGroups.data || [],
        });
      })
      .catch(() =>
        // temporary logic until the endpoint is adjusted for admin groups
        this.setState({
          admin: [],
        }),
      );

  // not in sprint 2
  loadFavoriteGroups = () => {};

  loadMyAndNearbyGroups = () => {
    this.loadMyGroups();
    this.loadNearbyGroups();
  };

  loadMyGroups = () => {
    rwbApi.retrieveGroups('my').then((myGroups) => {
      this.setState({
        my: myGroups.data,
        myGroupsLoading: false,
      });
    });
  };

  // not in sprint 2
  loadFeaturedGroups = () => {};

  loadActivityGroups = () => {
    rwbApi.retrieveGroups('activity').then((activityGroups) => {
      this.setState({
        activity: activityGroups.data,
        activityGroupsLoading: false,
      });
    });
  };

  loadNearbyGroups = () => {
    this.getLocation().then((locationData) => {
      rwbApi.retrieveGroups('nearby', locationData).then((nearbyGroups) => {
        this.setState({
          nearby: nearbyGroups?.data || [], // in the case when there are no nearby groups, data is undefined
          nearbyGroupsLoading: false,
        });
      });
    });
  };

  // not in sprint 2
  handleUpdateFavoriteGroups = () => {
    return;
    this.loadFavoriteGroups().then((favoriteGroups) => {
      this.setState({favorites: favoriteGroups});
    });
  };

  handleSearchFocus = () => {
    this.interactWithGroups();
    this.setState({searchingGroups: true});
  };

  // called on any interactions on the group page (visiting a group, interacting with the search bar, clicking on another tab)
  interactWithGroups = () => {
    this.setState({newToGroups: false});
  };

  searchValueChange = (text) => {
    this.setState({search: text, searchLoading: true});
    this.updateOptions(text);
  };

  updateOptions = debounce((value) => this.apiSearch(value), DEBOUNCE_MS);

  apiSearch = (text) => {
    const {lat, long, chapter_id, offset} = this.state;
    const location = {lat, long, chapter_id};
    rwbApi
      .searchGroups(text, location, offset)
      .then((result) => {
        this.setState({
          searchResults: this.separateGroups(result),
          searchLoading: false,
          offset: result.offset,
        });
      })
      .catch((err) => {
        window.alert(`Team RWB: ${GROUP_SEARCH_ERROR}`);
      });
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

  loadMoreGroups = () => {
    const {
      offset,
      search,
      searchResults,
      lat,
      long,
      chapter_id,
      retrievedLastGroup,
    } = this.state;
    const location = {lat, long, chapter_id};
    if (!offset || !retrievedLastGroup) return;
    this.setState({searchLoadingMore: true});
    rwbApi
      .searchGroups(search, location, offset)
      .then((result) => {
        this.setState({
          searchResults: [...searchResults, ...result], // this will use the appendToSection
          searchLoadingMore: false,
          offset: result.offset,
          retrievedLastGroup: false,
        });
        window.addEventListener('scroll', this.trackScrolling);
      })
      .catch((err) => {
        this.setState({searchLoadingMore: false, retrievedLastGroup: false}); // retrievedLastGroups is here for testing purposes
        window.addEventListener('scroll', this.trackScrolling); // for testing purposes
        this.appendToSection(groupTitles.other, []);
      });
  };

  // determine if extradata should be used, or forceupdate
  appendToSection = (title, data) => {
    const sections = this.state.searchResults;
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
    this.setState({searchResults: updatedSections});
  };

  clearSearchGroups = () =>
    this.setState({
      search: '',
      searchResults: [],
      searchLoading: false,
      searchLoadingMore: false,
      searchError: null,
      searchingGroups: false,
    });

  render() {
    const {
      admin,
      my,
      activity,
      nearby,
      searchingGroups,
      searchLoading,
      searchLoadingMore,
      search,
      searchResults,
      newToGroups,
      myGroupsLoading,
      activityGroupsLoading,
      nearbyGroupsLoading,
    } = this.state;
    const {match} = this.props;

    return (
      <div className={styles.container} id={'root'}>
        <Loading
          size={100}
          color={'var(--white)'}
          loading={searchLoadingMore}
          right
        />
        <Switch>
          <Route
            path={`${match.path}/:groupId`}
            exact
            render={(props) => (
              <GroupDetail
                {...props}
                updateJoined={this.loadMyAndNearbyGroups} // figure out opening via link
              />
            )}
          />
          <Route
            path={`${match.path}/:groupId/events`}
            exact
            render={(props) => <Events {...props} />}
          />
          <Route
            path={`${match.path}/:groupId/members`}
            exact
            render={(props) => <GroupMembers {...props} />}
          />
          <Route path={`${match.path}/:groupId/feed/:postId`}>
            <PostView />
          </Route>

          <Route path={match.path}>
            <div className={styles.searchContainer}>
              <SearchBar
                noRightRadius={false}
                value={search}
                onChange={this.searchValueChange}
                onSubmit={() => null}
                onClearSearch={this.clearSearchGroups}
                placeholder={'Search for Groups'}
                onFocus={this.handleSearchFocus}
                searching={searchingGroups}
              />
            </div>
            <>
              {searchingGroups ? (
                <SearchGroupsList
                  groups={searchResults}
                  loading={searchLoading}
                  searchPressed={this.clearSearchGroups}
                  searchEmpty={isNullOrEmpty(search)}
                />
              ) : (
                <>
                  {/* <GroupContainer title={'favorites'} data={[]} onDetailOpen={this.interactWithGroups} /> */}

                  {/* If there are no groups that you are an admin of, then section should not be visible.   */}
                  {admin.length > 0 && (
                    <GroupContainer
                      title={'admin'}
                      data={admin}
                      onDetailOpen={this.interactWithGroups}
                    />
                  )}
                  <GroupContainer
                    title={'my groups'}
                    data={my}
                    onDetailOpen={this.interactWithGroups}
                    isLoading={myGroupsLoading}
                  />
                  {newToGroups && <GroupMessages />}
                  {/* <GroupContainer title={'featured groups'} /> */}
                  <GroupContainer
                    title={'activity groups'}
                    data={activity}
                    onDetailOpen={this.interactWithGroups}
                    isLoading={activityGroupsLoading}
                  />
                  {(nearbyGroupsLoading || nearby?.length > 0) && (
                    <GroupContainer
                      title={'nearby groups'}
                      data={nearby}
                      onDetailOpen={this.interactWithGroups}
                      isLoading={nearbyGroupsLoading}
                    />
                  )}
                </>
              )}
            </>
          </Route>
        </Switch>
      </div>
    );
  }
}
