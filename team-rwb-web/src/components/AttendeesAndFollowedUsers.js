import React from 'react';
import DefaultProfileImg from '../../../shared/images/DefaultProfileImg.png';
import styles from './AttendeesAndFollowedUsers.module.css';

const displayAttendees = (attendee, i) => {
  const {profile_photo_url} = attendee;
  // First image has different styles than the others
  return (
    <img
      key={i}
      className={i === 0 ? styles.imageFirst : styles.imageNotFirst}
      src={profile_photo_url || DefaultProfileImg}
      alt={`User profile`}
    />
  );
};

const displayFollowingNames = (attendees) => {
  if (attendees.length === 1)
    return (
      <p>
        <span className="namesAndObjects">{`${attendees[0].first_name} ${attendees[0].last_name}`}</span>{' '}
        is going
      </p>
    );
  else if (attendees.length === 2)
    return (
      <p>
        <span className="namesAndObjects">
          {`${attendees[0].first_name} ${attendees[0].last_name} and ${attendees[1].first_name} ${attendees[1].last_name}`}{' '}
        </span>
        are going
      </p>
    );
  else if (attendees.length > 2)
    return (
      <p>
        <span className="namesAndObjects">
          {`${attendees[0].first_name} ${attendees[0].last_name}, ${attendees[1].first_name} ${attendees[1].last_name}`}{' '}
        </span>
        and
        <span className="namesAndObjects">
          {attendees.length - 2} {attendees.length === 3 ? 'other' : 'others'}
        </span>
        {attendees.length === 3 ? 'is' : 'are'} going
      </p>
    );
};

const AttendeesAndFollowedUsers = ({
  attendees,
  followingAttendees,
  attendeesCount,
}) => {
  return (
    <>
      <div className={styles.imagesContainer}>
        {attendees &&
          attendees
            .slice(0, 9)
            .map((attendee, i) => displayAttendees(attendee, i))}
        <p>{attendeesCount || ''}</p>{' '}
        {/* TODO figure out how attendees count is different from attendees.length */}
      </div>
      <div className={styles.followingAttendeesContainer}>
        {followingAttendees && displayFollowingNames(followingAttendees)}
      </div>
    </>
  );
};

export default AttendeesAndFollowedUsers;
