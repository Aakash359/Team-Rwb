import React, {useEffect, useState} from 'react';
import styles from './ChallengeCard.module.css';
import AttendeesAndFollowedUsers from '../AttendeesAndFollowedUsers';
import ChallengeCardHeader from './ChallengeCardHeader';
import {rwbApi} from '../../../../shared/apis/api';
import {JOIN_CHALLENGE_ERROR} from '../../../../shared/constants/ErrorMessages';
import {EXECUTION_STATUS, logJoinChallenge} from '../../../../shared/models/Analytics';

const UnjoinedChallengeCard = ({
  title,
  endTime,
  description,
  challengeId,
  refreshChallenges,
  startTime,
  badgeURL,
}) => {
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [followingParticipants, setFollowingParticipants] = useState();
  const [participantsCount, setParticipantsCount] = useState(0);

  useEffect(() => {
    if (challengeId) {
      Promise.all([getParticipants(), getFollowingParticipants()]).then(
        ([participants, followingParticipants]) => {
          setParticipants(participants.participants);
          setFollowingParticipants(followingParticipants[0].attendees);
          setParticipantsCount(participants.total_count);
        },
      );
    }
  }, []);

  const getParticipants = () => {
    return rwbApi.getChallengeParticipants(challengeId).then((res) => {
      return res;
    });
  };

  const getFollowingParticipants = () => {
    return rwbApi.getChallengeFollowingParticipants(challengeId).then((res) => {
      return res;
    });
  };
  const joinChallenge = (e) => {
    // prevent the link from navigating to the challenge
    // when pressing join
    e.stopPropagation();
    e.preventDefault();
    setLoading(true);
    let analyticsObj = {
      challenge_id: `${challengeId}`,
      // TODO --> pass the previous_view parametar
      current_view: 'hub',
    };
    rwbApi
      .joinChallenge(challengeId)
      .then(() => {
        analyticsObj.execution_status = EXECUTION_STATUS.success;
        logJoinChallenge(analyticsObj);
      })
      .catch((err) => {
        analyticsObj.execution_status = EXECUTION_STATUS.failure;
        logJoinChallenge(analyticsObj);
        alert(`Team RWB: ${JOIN_CHALLENGE_ERROR}`);
      })
      .finally(() => {
        setLoading(false);
        refreshChallenges();
      });
  };

  return (
    <div className={styles.container} style={{opacity: loading ? 0.5 : null}}>
      <ChallengeCardHeader
        title={title}
        endTime={endTime}
        startTime={startTime}
        badgeURL={badgeURL}
      />
      <p className={styles.description}>{description}</p>
      {participants.length > 0 && (
        <AttendeesAndFollowedUsers
          attendees={participants}
          followingAttendees={followingParticipants}
          attendeesCount={participantsCount}
        />
      )}
      <div onClick={joinChallenge} className={styles.joinButton}>
        Join Challenge
      </div>
    </div>
  );
};

export default UnjoinedChallengeCard;
