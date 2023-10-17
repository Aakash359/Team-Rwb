import React from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import Header from '../Header';
import styles from './TrophyCollection.module.css';
import moment from 'moment';
import {Grid} from '@material-ui/core';
import {PROFILE_TAB_LABELS} from '../../../../shared/constants/Labels';

const TrophyCollection = () => {
  const history = useHistory();
  const location = useLocation();
  const userBadges = location.state.userBadges;

  return (
    <div className={styles.rootContainer}>
      <Header
        title={PROFILE_TAB_LABELS.CHALLENGE_BADGES}
        onBack={() => history.goBack()}
      />

      <Grid container spacing={{xs: 2, md: 3}} columns={{xs: 4, sm: 8, md: 12}}>
        {Array.from(userBadges).map((item, index) => (
          <Grid item xs={4} sm={4} md={4} key={index}>
            <div key={index} className={styles.listItemContainer}>
              <img
                alt={`${item.name} badge`}
                className={styles.badgeImg}
                src={item.image_url}
              />
              <span className={styles.listItemDateReceived}>
                {moment(item.received_datetime).format('MM/DD/YYYY')}
              </span>
            </div>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default TrophyCollection;
