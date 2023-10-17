import React from 'react';
import {useRouteMatch, useHistory} from 'react-router-dom';
import styles from './ChallengeBadges.module.css';

import ChevronRightIcon from '../svgs/ChevronRightIcon';
import badgePhotos from '../../../../shared/images/badgePhotos';
import {PROFILE_TAB_LABELS} from '../../../../shared/constants/Labels';

export default function ChallengeBadges({userBadges, myProfile, userId}) {
  const match = useRouteMatch();
  const history = useHistory();
  return (
    <div>
      <div className={styles.badgeStatLink}>
        {userBadges.length > 0 ? (
          <p
            style={{cursor: 'pointer'}}
            onClick={() =>
              history.push({
                pathname: userId
                  ? `/profile/${userId}/trophy-collection`
                  : `/profile/trophy-collection`,
                state: {userBadges},
              })
            }
            className="link">
            {PROFILE_TAB_LABELS.CHALLENGE_BADGES.toUpperCase()}
          </p>
        ) : (
          myProfile && (
            <p className="link">
              {PROFILE_TAB_LABELS.CHALLENGE_BADGES.toUpperCase()}
            </p>
          )
        )}
        {userBadges.length > 0 && <ChevronRightIcon />}
      </div>
      <div className={styles.userBadgesContainer}>
        {userBadges.length > 0
          ? userBadges.slice(0, 5).map((item, index) => {
              return (
                <img
                  key={index}
                  alt={`${item.name} badge`}
                  className={styles.badgeImg}
                  src={item.image_url}
                />
              );
            })
          : myProfile && (
              <div
                className={styles.emptyBadgeContainer}
                style={{cursor: 'pointer'}}
                onClick={() =>
                  history.push({
                    pathname: `/challenges`,
                  })
                }>
                <div className={styles.emptyBadgeLeft}>
                  <div className={styles.sampleBadgeOutline}>
                    <img
                      src={badgePhotos.oldGlory}
                      className={styles.sampleBadge}
                    />
                  </div>
                  <div className={styles.sampleBadgeOutline}>
                    <img
                      src={badgePhotos.ruckIt}
                      className={styles.sampleBadge}
                    />
                  </div>
                  <div className={styles.sampleBadgeOutline}>
                    <img
                      src={badgePhotos.fireStarter}
                      className={styles.sampleBadge}
                      style={{marginRight: 0}}
                    />
                  </div>
                  <p className={styles.emptyBadgeText}>
                    {PROFILE_TAB_LABELS.JOIN_CHALLENGES_EARN_BADGES}
                  </p>
                </div>
                <ChevronRightIcon width={36} height={36} />
              </div>
            )}
      </div>
    </div>
  );
}
