import React, {useState, useEffect} from 'react';
import NotificationListItem from './NotificationListItem';
import {rwbApi} from '../../../../shared/apis/api';
import Loading from '../Loading';
import {Grid} from '@material-ui/core';
import {ClipLoader} from 'react-spinners';
import {hasReachedBottom} from '../../BrowserUtil';
import {NO_NOTIFICATIONS} from '../../../../shared/constants/OtherMessages';

const NotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const [notificationsRequested, requestNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [retrievedLastNotification, setRetrievedLastNotification] = useState(
    false,
  );

  useEffect(() => {
    getNotifications();
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', trackScrolling);
    return () => {
      window.removeEventListener('scroll', trackScrolling);
    };
  }, [notifications]);

  useEffect(() => {
    // replacement for setState callback
    if (retrievedLastNotification) getMoreNotifications();
  }, [retrievedLastNotification]);

  const trackScrolling = (event) => {
    event.preventDefault();
    const wrappedElement = document.getElementById('root');
    if (hasReachedBottom(wrappedElement)) {
      setRetrievedLastNotification(true);
    }
  };

  const getNotifications = () => {
    if (!notificationsRequested) {
      requestNotifications(true);
      rwbApi.getNotifications().then((res) => {
        const results = res.data.results;
        setNotifications(results);
        requestNotifications(false);
        setIsLoading(false);
      });
    }
  };

  const getMoreNotifications = () => {
    const lastNotification = notifications[notifications.length - 1];
    setIsLoadingMore(true);
    if (retrievedLastNotification && lastNotification) {
      rwbApi.getNotifications(lastNotification.id).then((res) => {
        const results = res.data.results;
        if (results.length > 0) {
          setNotifications([...notifications, ...results]);
          setIsLoadingMore(false);
          setRetrievedLastNotification(false);
        } else setIsLoadingMore(false);
      });
    }
  };

  const updateFollowStateHandler = (userId, isFollowing) => {
    // setIsFollowLoading(true);
    setIsLoading(true);
    if (isFollowing) {
      rwbApi
        .unfollowUser(userId)
        .then(() => {
          updateFollowingStatus(userId, isFollowing);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          // setIsFollowLoading(false);
          setIsLoading(false);
        });
    } else {
      rwbApi
        .followUser(userId)
        .then(() => {
          updateFollowingStatus(userId, isFollowing);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          // setIsFollowLoading(false);
          setIsLoading(false);
        });
    }
  };

  const updateFollowingStatus = (userId, isFollowing) => {
    let updatedNotifications = notifications.filter((item) => {
      if (
        item.activities[0].actor_user &&
        item.activities[0].actor_user.id === userId
      ) {
        item.activities[0].is_following = !isFollowing;
      }
      return item;
    });
    setNotifications(updatedNotifications);
  };

  return (
    <div id={'root'}>
      {isLoading ? (
        <Loading size={100} color={'var(--white)'} loading={true} right />
      ) : (
        <div>
          {notifications.length > 0 ? (
            notifications.map((notification, i) => {
              return (
                <NotificationListItem
                  item={notification}
                  key={i}
                  updateFollowingStatus={updateFollowStateHandler}
                />
              );
            })
          ) : (
            <p style={{textAlign: 'center', marginTop: 20}}>
              {NO_NOTIFICATIONS}
            </p>
          )}
          <Grid container justify={'center'}>
            <ClipLoader
              size={60}
              color={'var(--grey20)'}
              loading={isLoadingMore}
            />
          </Grid>
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
