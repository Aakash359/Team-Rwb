import React from 'react';
import styles from './UsersList.module.css';
import Loading from '../Loading';
import DefaultProfileImg from '../../../../shared/images/DefaultProfileImg.png';
import RWBMark from '../svgs/RWBMark';
import {logSearchForPeople} from '../../../../shared/models/Analytics';
import {NO_USERS_FOUND} from '../../../../shared/constants/ErrorMessages';
import {isNullOrEmpty} from '../../../../shared/utils/Helpers';

const UsersList = ({usersSuggestions, loadingUsers, onSelect, search}) => (
  <div className={styles.container}>
    {loadingUsers ? (
      <div className={styles.loadingContainer}>
        <Loading size={50} color={'var(--grey40)'} loading={true} transparent />
      </div>
    ) : (
      <>
        {usersSuggestions.length > 0 ? (
          usersSuggestions.map((suggestion, i) => {
            const user = suggestion._source;
            return (
              <div
                className={styles.suggestionContainer}
                onClick={() => {
                  logSearchForPeople();
                  onSelect({
                    id: user.id,
                    name: `${user.first_name} ${user.last_name}`,
                  });
                }}
                key={i}>
                <img
                  className={styles.profileImg}
                  src={user.profile_photo_url || DefaultProfileImg}
                  alt={'User Profile'}
                />
                <div className={styles.textContainer}>
                  <div className={styles.inlineContainer}>
                    <h3>{`${user.first_name} ${user.last_name}`}</h3>
                    {user.eagle_leader && <RWBMark width={40} height={15} />}
                  </div>
                  {user.eagle_leader && (
                    <h5 className={styles.eagleLeaderText}>{'Eagle Leader'}</h5>
                  )}
                  <p>{user.preferred_chapter.name}</p>
                  <p>
                    {user.military_status && user.military_status !== 'Unknown'
                      ? user.military_status === 'Civilian'
                        ? 'Civilian'
                        : `${user.military_status} / ${user.military_branch}`
                      : null}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <>
            {(search === undefined || !isNullOrEmpty(search)) && (
              <div className={styles.loadingContainer}>
                <p>{NO_USERS_FOUND}</p>
              </div>
            )}
          </>
        )}
      </>
    )}
  </div>
);

export default UsersList;
