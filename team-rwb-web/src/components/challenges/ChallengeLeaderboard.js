import React, {useEffect, useState} from 'react';
import Header from '../Header';
import RankingRow from './RankingRow';
import {useLocation, useHistory} from 'react-router-dom';
import styles from './ChallengeLeaderboard.module.css';
import {rwbApi} from '../../../../shared/apis/api';
import Loading from '../Loading';

const ChallengeLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    if (location.state.rank > 25) {
      setIsLoading(true);
      return rwbApi
        .getLeaderboardCentered(location.state.challengeId)
        .then((res) => {
          setLeaderboard(res.data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn('Team RWB', 'Error Loading Leaderboard Centered 25');
          setIsLoading(false);
        });
    } else {
      setLeaderboard(location.state.data);
    }
  }, []);

  return (
    <>
      {isLoading && (
        <Loading size={100} color={'var(--white)'} loading={isLoading} right />
      )}
      <Header
        title={'Leaderboard'}
        subtitle={location.state.challengeName}
        onBack={history.goBack}
      />
      <div className={styles.leaderboardContainer}>
        {leaderboard.map((ranker, index) => {
          return (
            <RankingRow
              key={`ranked-row-${index}`}
              place={ranker.rank}
              user={ranker.user}
              progress={ranker.score}
              metric={location.state.metric}
            />
          );
        })}
      </div>
    </>
  );
};

export default ChallengeLeaderboard;
