import React from 'react';
import {
  Paper,
  Toolbar,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Grid,
} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import {MdWarning as NoEventsIcon} from 'react-icons/md';
import {Link} from 'react-router-dom';
import moment from 'moment';
import {rwbApi} from '../../../../shared/apis/api';
import {getIndexFromID} from '../../../../shared/utils/Helpers';
import {userProfile} from '../../../../shared/models/UserProfile';
import EventListItem from './EventListItem';
import Loading from '../Loading';
import Pagination from '@material-ui/lab/Pagination';
import ChevronBackIcon from '../svgs/ChevronBackIcon';
import {ClipLoader} from 'react-spinners';
import {hasReachedBottom} from '../../BrowserUtil';

const LIST_TYPES = {
  hosting: 'hosting',
  upcoming: 'upcoming',
  past: 'past',
};

const styles = {
  root: {
    flexGrow: 1,
    maxWidth: 700,
    borderRadius: 0,
  },
  toolbar: {
    backgroundColor: 'var(--magenta)',
    height: 64,
    padding: '8px 40px',
  },
  menuButton: {
    marginRight: '15px',
    color: 'var(--white)',
  },
  iconLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    color: 'var(--grey)',
    fontFamily: 'OpenSans-Bold',
    fontSize: 12,
  },
  iconLabelWrapperSelected: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    color: 'var(--magenta)',
    fontFamily: 'OpenSans-Bold',
    fontSize: 12,
  },
  indicator: {
    backgroundColor: 'var(--magenta)',
  },
  tabs: {
    borderBottom: '1px solid var(--grey20)',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '50px',
  },
};

class MyActivitiesListView extends React.Component {
  constructor(props) {
    super(props);
    this.eagleLeaderIsViewing = userProfile.getUserProfile().eagle_leader === 1;
    this.userID = userProfile.getUserProfile().id;
    this.mounted = true;
    this.alertLimitUsersDisplayedShowed = false;
    this.now = moment();
    this.state = {
      selectedValue: 0,
      filteredEvents: [],
      visibleList: LIST_TYPES.hosting,
      hostingEvents: [],
      upcomingEvents: [],
      pastEvents: [],
      isLoading: true,
      loadingMoreHosting: true,
      loadingMoreUpcoming: true,
      loadingMorePast: true,
      total_hosting_pages: null,
      total_upcoming_pages: null,
      total_past_pages: null,
      hostingPage: 0,
      upcomingPage: 0,
      pastPage: 0,
      noResultsFoundHosting: false,
      noResultsFoundUpcoming: false,
      noResultsFoundPast: false,
      stopFetchingHosting: false,
      stopFetchingUpcoming: false,
      stopFetchingPast: false,
      reloadHostingCacheUntilPage: 0,
      reloadUpcomingCacheUntilPage: 0,
      reloadPastCacheUntilPage: 0,
      isLoadingMore: false,
    };
  }

  componentDidMount() {
    this.setVisibleTab(this.state.selectedValue);

    window.addEventListener('scroll', this.trackScrolling);
  }

  trackScrolling = (event) => {
    event.preventDefault();

    const wrappedElement = document.getElementById('root');
    if (hasReachedBottom(wrappedElement)) {
      window.removeEventListener('scroll', this.trackScrolling);
      this.handleLoadMore();
    }
  };

  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener('scroll', this.trackScrolling);
  }

  setVisibleTab = (index) => {
    this.setState({
      selectedValue: index,
    });
    switch (index) {
      case 0:
        this.setState({visibleList: LIST_TYPES.hosting});
        break;
      case 1:
        this.setState({visibleList: LIST_TYPES.upcoming});
        break;
      case 2:
        this.setState({visibleList: LIST_TYPES.past});
        break;
      default:
        break;
    }
    this.filterEvents(index);
  };

  filterEvents = (index) => {
    this.setState({isLoading: true});
    switch (index) {
      case 0:
        this.getEvents(LIST_TYPES.hosting);
        break;
      case 1:
        this.getEvents(LIST_TYPES.upcoming);
        break;
      case 2:
        this.getEvents(LIST_TYPES.past);
        break;
      default:
        break;
    }
  };

  refreshPaging() {
    this.setState({
      hostingPage: 0,
      upcomingPage: 0,
      pastPage: 0,
    });
  }

  alertLimitUsersDisplayed() {
    if (!this.alertLimitUsersDisplayedShowed) {
      this.alertLimitUsersDisplayedShowed = true;
      alert('Team RWB', 'Could not display some interested and going users');
    }
  }

  getEvents(listType, loadMore = null) {
    if (!Object.values(LIST_TYPES).includes(listType)) {
      throw new Error(
        `getEvents called with ${listType}, must be one of ${LIST_TYPES.upcoming}|${LIST_TYPES.past}`,
      );
    }
    const {now} = this;
    const {hostingPage, upcomingPage, pastPage} = this.state;
    const dateString = moment(now).toISOString();
    const pageParams =
      listType === LIST_TYPES.hosting
        ? `page=${hostingPage}`
        : listType === LIST_TYPES.upcoming
        ? `page=${upcomingPage}`
        : `page=${pastPage}`;
    const sortParams =
      listType === LIST_TYPES.hosting
        ? `host_id=${this.userID}&sort_order=desc`
        : listType === LIST_TYPES.upcoming
        ? `after=${dateString}&sort_order=asc`
        : `before=${dateString}&sort_order=desc`;
    const urlParams = `${pageParams}&sort=date&${sortParams}`;
    const newState = Object.assign(
      listType === LIST_TYPES.hosting
        ? {
            loadingMoreHosting: true,
            hostingPage: hostingPage + 1,
          }
        : listType === LIST_TYPES.upcoming
        ? {
            loadingMoreUpcoming: true,
            upcomingPage: upcomingPage + 1,
          }
        : {
            loadingMorePast: true,
            pastPage: pastPage + 1,
          },
    );

    this.setState(newState);
    if (listType === LIST_TYPES.hosting) {
      this.getUserHostedEvents(urlParams, loadMore);
    } else {
      this.getUserEvents(urlParams, listType, loadMore);
    }
  }

  getUserHostedEvents = (urlParams, loadMore = null) => {
    const {
      hostingPage,
      reloadHostingCacheUntilPage,
      hostingEvents,
    } = this.state;
    loadMore && this.setState({isLoadingMore: true});
    return rwbApi.getMobileEvents(urlParams).then((response) => {
      const {data, total_number_pages, total_number_posts} = response;
      if (data) {
        if (!this.mounted) return;
        this.setState(
          {
            hostingEvents: [...hostingEvents, ...data],
            total_hosting_pages: total_number_pages,
          },
          () => {
            this.state.visibleList === LIST_TYPES.hosting &&
              this.setState({
                filteredEvents: this.state.hostingEvents,
              });
          },
        );
      } else {
        this.setState({filteredEvents: hostingEvents});
      }
      if (total_number_posts === 0) {
        if (!this.mounted) return;
        this.setState({
          noResultsFoundHosting: true,
        });
      }
      if (hostingPage >= total_number_pages) {
        if (!this.mounted) return;
        this.setState({
          stopFetchingHosting: true,
        });
      }
      if (hostingPage >= reloadHostingCacheUntilPage) {
        if (!this.mounted) return;
        this.setState({
          reloadHostingCacheUntilPage: 0,
        });
      }
      if (!this.mounted) return;
      this.setState({
        loadingMoreHosting: false,
        isLoading: false,
        isLoadingMore: false,
      });

      window.addEventListener('scroll', this.trackScrolling);
    });
  };

  getUserEvents = (urlParams, listType, loadMore = null) => {
    urlParams += `&attendee=${this.userID}`;
    const {
      upcomingPage,
      reloadUpcomingCacheUntilPage,
      pastPage,
      reloadPastCacheUntilPage,
      upcomingEvents,
      pastEvents,
    } = this.state;
    loadMore && this.setState({isLoadingMore: true});
    rwbApi
      .getMobileEvents(urlParams)
      .then((response) => {
        const {data, total_number_pages, total_number_posts} = response;
        if (listType === LIST_TYPES.upcoming) {
          if (data) {
            if (!this.mounted) return;
            this.setState(
              {
                upcomingEvents: [...upcomingEvents, ...data],
                total_upcoming_pages: total_number_pages,
              },
              () => {
                this.state.visibleList === LIST_TYPES.upcoming &&
                  this.setState({
                    filteredEvents: this.state.upcomingEvents,
                  });
              },
            );
          } else {
            this.setState({filteredEvents: upcomingEvents});
          }
          if (total_number_posts === 0) {
            if (!this.mounted) return;
            this.setState({
              noResultsFoundUpcoming: true,
            });
          }
          if (upcomingPage >= total_number_pages) {
            if (!this.mounted) return;
            this.setState({
              stopFetchingUpcoming: true,
            });
          }
          if (upcomingPage >= reloadUpcomingCacheUntilPage) {
            if (!this.mounted) return;
            this.setState({
              reloadUpcomingCacheUntilPage: 0,
            });
          }
          if (!this.mounted) return;
          this.setState({
            loadingMoreUpcoming: false,
            isLoading: false,
          });
        } else {
          if (data) {
            if (!this.mounted) return;
            this.setState(
              {
                pastEvents: [...pastEvents, ...data],
                total_past_pages: total_number_pages,
              },
              () => {
                this.state.visibleList === LIST_TYPES.past &&
                  this.setState({
                    filteredEvents: this.state.pastEvents,
                  });
              },
            );
          } else {
            this.setState({filteredEvents: pastEvents});
          }
          if (total_number_posts === 0) {
            if (!this.mounted) return;
            this.setState({
              noResultsFoundPast: true,
            });
          }
          if (pastPage >= total_number_pages) {
            if (!this.mounted) return;
            this.setState({
              stopFetchingPast: true,
            });
          }
          if (pastPage >= reloadPastCacheUntilPage) {
            if (!this.mounted) return;
            this.setState({
              reloadPastCacheUntilPage: 0,
            });
          }
          if (!this.mounted) return;
          this.setState({
            loadingMorePast: false,
            isLoading: false,
            isLoadingMore: false,
          });
        }

        window.addEventListener('scroll', this.trackScrolling);
      })
      .catch((error) => {
        console.warn(error);
        if (!this.mounted) return;
        this.setState({
          isLoading: false,
          isLoadingMore: false,
          noResultsFound: true,
        });
        alert('Error', 'There was a problem with the server.');
      });
  };

  updateEvent(id) {
    const {now} = this;
    const {pastEvents, upcomingEvents} = this.state;
    if (!this.mounted) return;
    this.setState({
      isLoading: true,
    });
    return rwbApi
      .getEvent(id)
      .then((newEvent) => {
        const isEventInPast = moment(newEvent.start).isBefore(now);
        const events = isEventInPast ? pastEvents : upcomingEvents;
        const index = getIndexFromID(id, events);
        events[index] = newEvent;
        if (!this.mounted) return;
        this.setState(
          Object.assign(
            {},
            isEventInPast ? {pastEvents: events} : {upcomingEvents: events},
          ),
        );
      })
      .catch((error) => {})
      .finally(() => {
        if (!this.mounted) return;
        this.setState({
          isLoading: false,
        });
      });
  }

  loadAttendees(id) {
    return rwbApi.getAllMobileAttendees(id).catch((error) => {
      throw error;
    });
  }

  handleLoadMore() {
    const {selectedValue} = this.state;
    if (
      selectedValue === 0 &&
      this.state.hostingPage < this.state.total_hosting_pages
    ) {
      this.getEvents(LIST_TYPES.hosting, true);
    } else if (
      selectedValue === 1 &&
      this.state.upcomingPage < this.state.total_upcoming_pages
    ) {
      this.getEvents(LIST_TYPES.upcoming, true);
    } else if (this.state.pastPage < this.state.total_past_pages) {
      this.getEvents(LIST_TYPES.past, true);
    }
  }

  // renderPagination(total_pages, page, listType) {
  //   return (
  //     <Grid container justify={'center'}>
  //       <Pagination
  //         count={total_pages}
  //         page={page}
  //         onChange={(_, value) => {
  //           if (page !== value)
  //             this.setState(
  //               {
  //                 [listType]: value - 1,
  //                 isLoading: true,
  //               },
  //               () => this.handleLoadMore(),
  //             );
  //         }}
  //         size={'large'}
  //       />
  //     </Grid>
  //   );
  // }

  // loadPagination() {
  //   switch (this.state.selectedValue) {
  //     case 0:
  //       return this.renderPagination(
  //         this.state.total_hosting_pages,
  //         this.state.hostingPage,
  //         'hostingPage',
  //       );
  //     case 1:
  //       return this.renderPagination(
  //         this.state.total_upcoming_pages,
  //         this.state.upcomingPage,
  //         'upcomingPage',
  //       );
  //     case 2:
  //       return this.renderPagination(
  //         this.state.total_past_pages,
  //         this.state.pastPage,
  //         'pastPage',
  //       );
  //     default:
  //       break;
  //   }
  // }

  render() {
    const {
      selectedValue,
      isLoading,
      filteredEvents,
      isLoadingMore,
    } = this.state;
    const {classes} = this.props;
    return (
      <div id={'root'}>
        {isLoading ? (
          <Loading size={100} color={'var(--white)'} loading={true} right />
        ) : (
          <>
            <Paper className={classes.root}>
              <Toolbar className={classes.toolbar}>
                <Link to={'/events'}>
                  <IconButton
                    edge="start"
                    className={classes.menuButton}
                    color="inherit">
                    <ChevronBackIcon />
                  </IconButton>
                </Link>
                <p className="title">My Activites</p>
              </Toolbar>
              <Tabs
                className={classes.tabs}
                value={selectedValue}
                onChange={(_, i) => this.setVisibleTab(i)}
                variant="fullWidth"
                classes={{
                  indicator: classes.indicator,
                }}>
                <Tab
                  label="hosting"
                  classes={{
                    wrapper:
                      selectedValue === 0
                        ? classes.iconLabelWrapperSelected
                        : classes.iconLabelWrapper,
                  }}
                />
                <Tab
                  label="upcoming events"
                  classes={{
                    wrapper:
                      selectedValue === 1
                        ? classes.iconLabelWrapperSelected
                        : classes.iconLabelWrapper,
                  }}
                />
                <Tab
                  label="past events"
                  classes={{
                    wrapper:
                      selectedValue === 2
                        ? classes.iconLabelWrapperSelected
                        : classes.iconLabelWrapper,
                  }}
                />
              </Tabs>
              {filteredEvents.map((item, i) => (
                <Link to={`/events/${item.id}`} key={i}>
                  <EventListItem
                    event={item}
                    selectedValue={this.state.selectedValue}
                    loadAttendees={this.loadAttendees}
                    type="MyActivities"
                  />
                </Link>
              ))}
              {isLoadingMore && (
                <>
                  <Grid container justify={'center'}>
                    <ClipLoader
                      size={60}
                      color={'var(--grey20)'}
                      loading={isLoadingMore}
                    />
                  </Grid>
                </>
              )}
              {/* {filteredEvents.length > 0 && this.loadPagination()} */}
            </Paper>
            {!filteredEvents.length && !isLoading && (
              <div className={classes.emptyContainer}>
                <NoEventsIcon color={'var(--magenta)'} size={60} />
                <p>The selected filters produced no events.</p>
                <p>Please adjust filter settings.</p>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(MyActivitiesListView);
