import React, {useState, useEffect} from 'react';
import {Paper, Toolbar, IconButton, Tabs, Tab, Grid} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import Attendee from './Attendee';
import EventHost from './EventHost';
import {useParams, useHistory, useLocation} from 'react-router-dom';
import {rwbApi} from '../../../../shared/apis/api';
import ChevronBackIcon from '../svgs/ChevronBackIcon';
import Loading from '../Loading';
import moment from 'moment';
import CheckIcon from '../svgs/CheckIcon';
import InterestedIcon from '../svgs/InterestedIcon';
import TicketIcon from '../svgs/TicketIcon';
import {userProfile} from '../../../../shared/models/UserProfile';
import {ATTENDANCE_SLUGS} from '../../../../shared/constants/AttendanceSlugs';
import {ClipLoader} from 'react-spinners';
import {hasReachedBottom} from '../../BrowserUtil';
import {localizeDate} from '../../../../shared/utils/Helpers';
import Header from '../Header';

const styles = {
  root: {
    flexGrow: 1,
    maxWidth: '100%',
    height: '100%',
    borderRadius: 0,
  },
  toolbar: {
    backgroundColor: 'var(--magenta)',
    paddingLeft: 40,
    paddingRight: 40,
  },
  menuButton: {
    marginRight: '15px',
    color: 'var(--white)',
  },
  title: {
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
};

const EventDetailAttendees = ({classes}) => {
  const isEventTodayOrAfter = () => {
    const today = moment();
    const eventDate = localizeDate(
      location.state.isVirtual,
      location.state.timeZone,
      location.state.date,
    );
    return today.isSameOrAfter(eventDate, 'day');
  };

  const location = useLocation();
  const eventHost = location.state.host;
  const {eventId} = useParams();
  const [selectedValue, setselectedValue] = useState(
    isEventTodayOrAfter() ? 0 : 1,
  );
  const [goingAttendees, setGoingAttendees] = useState([]);
  const [interestedAttendees, setInterestedAttendees] = useState([]);
  const [checkedInAttendees, setCheckedInAttendees] = useState([]);
  const [filteredAttendees, setfilteredAttendees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [checkedInPage, setCheckedInPage] = useState(1);
  const [goingPage, setGoingPage] = useState(1);
  const [interestedPage, setInterestedPage] = useState(1);

  const [retrievedLastCheckedIn, setRetrievedLastCheckedIn] = useState(false);
  const [retrievedLastGoing, setRetrievedLastGoing] = useState(false);
  const [retrievedLastInterested, setRetrievedLastInterested] = useState(false);

  const history = useHistory();
  useEffect(() => {
    setIsLoading(true);
    rwbApi.getAllMobileAttendees(eventId).then((data) => {
      if (data) {
        const {going, checked_in, interested} = data;
        setGoingAttendees(going.attendees);
        setInterestedAttendees(interested.attendees);
        setCheckedInAttendees(checked_in.attendees);
        setIsLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    filterAttendees(selectedValue);
  }, [isLoading]);

  const filterAttendees = (index) => {
    setselectedValue(index);
    switch (index) {
      case 0:
        setfilteredAttendees(checkedInAttendees);
        break;
      case 1:
        setfilteredAttendees(goingAttendees);
        break;
      case 2:
        setfilteredAttendees(interestedAttendees);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', trackScrolling);
    return () => {
      window.removeEventListener('scroll', trackScrolling);
    };
  }, [filteredAttendees, selectedValue]);

  const trackScrolling = (event) => {
    event.preventDefault();
    const wrappedElement = document.getElementById('root');
    if (hasReachedBottom(wrappedElement) && !isLoadingMore) {
      switch (selectedValue) {
        case 0:
          if (!retrievedLastCheckedIn) loadMore(ATTENDANCE_SLUGS.checkedin);
          break;
        case 1:
          if (!retrievedLastGoing) loadMore(ATTENDANCE_SLUGS.going);
          break;
        case 2:
          if (!retrievedLastInterested) loadMore(ATTENDANCE_SLUGS.interested);
          break;
        default:
          break;
      }
    }
  };

  const loadMore = (status) => {
    let page;
    let list;
    if (status === ATTENDANCE_SLUGS.interested) {
      page = interestedPage;
      list = interestedAttendees;
    } else if (status === ATTENDANCE_SLUGS.going) {
      page = goingPage;
      list = goingAttendees;
    } else if (status === ATTENDANCE_SLUGS.checkedin) {
      page = checkedInPage;
      list = checkedInAttendees;
    } else {
      throw new Error('No status to query attendees for.');
    }
    setIsLoadingMore(true);
    rwbApi
      .getMobileAttendees(eventId, status, page)
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

        setIsLoadingMore(false);
        switch (status) {
          case ATTENDANCE_SLUGS.interested:
            setInterestedAttendees([...list, ...attendees]);
            // prevent page from increasing while loading.
            setInterestedPage((prevState) =>
              prevState === page ? prevState + 1 : prevState,
            );
            if (totalPages === page) setRetrievedLastInterested(true);
            break;
          case ATTENDANCE_SLUGS.going:
            setGoingAttendees([...list, ...attendees]);
            // prevent page from increasing while loading.
            setGoingPage((prevState) =>
              prevState === page ? prevState + 1 : prevState,
            );
            if (totalPages === page) setRetrievedLastGoing(true);
            break;
          case ATTENDANCE_SLUGS.checkedin:
            setCheckedInAttendees([...list, ...attendees]);
            // prevent page from increasing while loading.
            setCheckedInPage((prevState) =>
              prevState === page ? prevState + 1 : prevState,
            );
            if (totalPages === page) setRetrievedLastCheckedIn(true);
            break;
          default:
            break;
        }

        setfilteredAttendees([...list, ...attendees]);
      })
      .catch((error) => {
        alert('There was an error fetching the rest of the event attendees.');
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
  };

  return (
    <div id={'root'}>
      {isLoading ? (
        <Loading size={100} color={'var(--white)'} loading={isLoading} right />
      ) : (
        <>
          <Paper className={classes.root}>
            <Header
              title={'Attendees'}
              onBack={() => history.goBack()}
              lessHeight
            />
            <Tabs
              value={selectedValue}
              onChange={(_, i) => filterAttendees(i)}
              variant="fullWidth"
              classes={{
                indicator: classes.indicator,
              }}>
              {isEventTodayOrAfter() && (
                <Tab
                  value={0}
                  label={'checked in'}
                  icon={
                    <TicketIcon
                      tintColor={
                        selectedValue === 0 ? 'var(--magenta)' : 'var(--grey)'
                      }
                      height={20}
                    />
                  }
                  classes={{
                    wrapper:
                      selectedValue === 0
                        ? classes.iconLabelWrapperSelected
                        : classes.iconLabelWrapper,
                  }}
                />
              )}
              <Tab
                value={1}
                label={'going'}
                icon={
                  <CheckIcon
                    tintColor={
                      selectedValue === 1 ? 'var(--magenta)' : 'var(--grey)'
                    }
                    height={20}
                  />
                }
                classes={{
                  wrapper:
                    selectedValue === 1
                      ? classes.iconLabelWrapperSelected
                      : classes.iconLabelWrapper,
                }}
              />
              <Tab
                value={2}
                label="interested"
                icon={
                  <InterestedIcon
                    tintColor={
                      selectedValue === 2 ? 'var(--magenta)' : 'var(--grey)'
                    }
                    height={20}
                  />
                }
                classes={{
                  wrapper:
                    selectedValue === 2
                      ? classes.iconLabelWrapperSelected
                      : classes.iconLabelWrapper,
                }}
              />
            </Tabs>
            <EventHost
              key={0}
              item={eventHost}
              host={true}
              onSelect={() =>
                userProfile.eagle_leader || eventHost.public_profile
                  ? history.push(`/profile/${eventHost.id}`)
                  : null
              }
            />
            {filteredAttendees.map((item, i) =>
              item.id !== eventHost.id ? (
                <Attendee
                  key={i}
                  item={item}
                  onSelect={(item) =>
                    userProfile.eagle_leader || item.public_profile
                      ? history.push(`/profile/${item.id}`)
                      : null
                  } //only visit the profile if the user is an eagle leader (bypassing anonymous users) or the profile is public
                />
              ) : null,
            )}

            {isLoadingMore && (
              <Grid container justify={'center'}>
                <ClipLoader
                  size={60}
                  color={'var(--grey20)'}
                  loading={isLoadingMore}
                />
              </Grid>
            )}
          </Paper>
        </>
      )}
    </div>
  );
};

export default withStyles(styles)(EventDetailAttendees);
