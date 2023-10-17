import React, {useState, useEffect} from 'react';
import {rwbApi} from '../../../../shared/apis/api';
import Loading from '../Loading';
import UnjoinedChallengeCard from './UnjoinedChallengeCard';

import styles from './Challenges.module.css';
import JoinedChallengeCard from './JoinedChallengeCard';
import {
  Link,
  Route,
  Switch,
  useHistory,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';
import ChallengeDetail from './ChallengeDetail';
import Events from '../events/Events';
import Header from '../Header';
import {NO_PAST_CHALLENGES} from '../../../../shared/constants/OtherMessages';
import {
  challengeParams,
  separateUnjoinedChallenges,
} from '../../../../shared/utils/ChallengeHelpers';
import ChallengeLeaderboard from './ChallengeLeaderboard';
import ChallengeParticipants from './ChallengeParticipants';
import PostView from '../feed/PostView';

export default function Challenges(props) {
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [yourActiveChallenges, setYourActiveChallenges] = useState(null);
  const [availableChallenges, setAvailableChallenges] = useState(null);
  const [upcomingChallenges, setUpcomingChallenges] = useState(null);
  const [pastChallenges, setPastChallenges] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSelectedTab, setCurrentSelectedTab] = useState(
    'activeChallenges',
  );

  const getActiveChallenges = () => {
    // clean up challenges and reload to avoid visual issue caused by the most recent result
    setYourActiveChallenges(null);
    rwbApi
      .getChallenges(challengeParams('active'))
      .then((result) => {
        separateData(result);
      })
      .catch((err) => {})
      .finally(() => {
        setIsLoading(false);
        setLoadingMore(false);
      });
  };

  const getPastChallenges = () => {
    rwbApi.getChallenges(challengeParams('past')).then((result) => {
      setPastChallenges(result.data.joined);
    });
  };

  const separateData = (challenges) => {
    const unjoinedChallenges = separateUnjoinedChallenges(
      challenges.data.unjoined,
    );
    setYourActiveChallenges(challenges.data.joined);
    setAvailableChallenges(unjoinedChallenges.availableChallenges);
    setUpcomingChallenges(unjoinedChallenges.upcomingChallenges);
    // setTotalPages(challenges.total_number_pages);
  };

  useEffect(() => {
    if (
      currentSelectedTab === 'activeChallenges' &&
      availableChallenges === null &&
      yourActiveChallenges === null
    )
      getActiveChallenges();
    else if (currentSelectedTab === 'pastChallenges' && pastChallenges === null)
      getPastChallenges();
  }, [currentSelectedTab]);

  /* previously the challenges endpoint paginated, it no longer does. This may change again.
  const trackScrolling = (event) => {
    event.preventDefault();
    const wrappedElement = document.getElementById('root');
    if (hasReachedBottom(wrappedElement) && !loadingMore) {
      setLoadingMore(true);
      const challengesSum =
        yourActiveChallenges.length +
        activeChallenges.length +
        availableChallenges.length;
      if (challengesSum % 10 === 0 && page < totalPages - 1) setPage(page + 1);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', trackScrolling);
    return () => {
      window.removeEventListener('scroll', trackScrolling);
    };
  });*/

  const match = useRouteMatch();

  return (
    <div className={styles.container}>
      {isLoading ? (
        <Loading size={100} color={'var(--white)'} loading={true} right />
      ) : (
        <>
          <Switch>
            <Route path={'/challenges/:challengeId'} exact>
              <ChallengeDetail updateJoined={getActiveChallenges} />
            </Route>
            <Route
              path={`/challenges/:challengeId/events`}
              exact
              render={(props) => <Events {...props} />}
            />
            <Route path={'/challenges/:challengeId/leaderboard'}>
              <ChallengeLeaderboard />
            </Route>
            <Route path={'/challenges/:challengeId/participants'}>
              <ChallengeParticipants />
            </Route>
            <Route path={`${match.path}/:challengeId/feed/:postId`}>
              <PostView />
            </Route>
            <Route path={'/'}>
              <Header title={'Challenges'} />
              <div className={styles.challengeTabsContainer}>
                <div
                  onClick={() => setCurrentSelectedTab('activeChallenges')}
                  className={`${styles.challengeTab} ${
                    currentSelectedTab === 'activeChallenges' &&
                    styles.challengeTabActive
                  }`}>
                  <span
                    className={`${styles.challengeTabTitle} ${
                      currentSelectedTab === 'activeChallenges' &&
                      styles.challengeTabTitleActive
                    }`}>
                    ACTIVE CHALLENGES
                  </span>
                </div>
                <div
                  onClick={() => setCurrentSelectedTab('pastChallenges')}
                  className={`${styles.challengeTab} ${
                    currentSelectedTab === 'pastChallenges' &&
                    styles.challengeTabActive
                  }`}>
                  <span
                    className={`${styles.challengeTabTitle} ${
                      currentSelectedTab === 'pastChallenges' &&
                      styles.challengeTabTitleActive
                    }`}>
                    PAST CHALLENGES
                  </span>
                </div>
              </div>
              {currentSelectedTab === 'activeChallenges' ? (
                <>
                  <div>
                    <p className={`titleSubheader ${styles.sectionHeader}`}>
                      Your Active Challenges
                    </p>
                    {yourActiveChallenges &&
                      yourActiveChallenges.map((item, i) => (
                        <Link to={`challenges/${item.id}`} key={`your-${i}`}>
                          <JoinedChallengeCard
                            title={item.name}
                            endTime={item.end_date}
                            metric={item.required_unit}
                            goal={item.goal}
                            startTime={item.start_date}
                            challengeId={item.id}
                            badgeURL={item.badge_image_url}
                          />
                        </Link>
                      ))}
                  </div>
                  <div>
                    <p className={`titleSubheader ${styles.sectionHeader}`}>
                      Available Challenges
                    </p>
                    {availableChallenges &&
                      availableChallenges.map((item, i) => (
                        <Link
                          to={`challenges/${item.id}`}
                          key={`available-${i}`}>
                          <UnjoinedChallengeCard
                            title={item.name}
                            endTime={item.end_date}
                            description={item.description}
                            challengeId={item.id}
                            startTime={item.start_date}
                            refreshChallenges={getActiveChallenges}
                            badgeURL={item.badge_image_url}
                            previousView={props?.location?.state?.from}
                          />
                        </Link>
                      ))}
                  </div>
                  <div>
                    <p className={`titleSubheader ${styles.sectionHeader}`}>
                      Upcoming Challenges
                    </p>
                    {upcomingChallenges &&
                      upcomingChallenges.map((item, i) => (
                        <Link
                          to={`challenges/${item.id}`}
                          key={`upcoming-${i}`}>
                          <UnjoinedChallengeCard
                            title={item.name}
                            endTime={item.end_date}
                            description={item.description}
                            challengeId={item.id}
                            startTime={item.start_date}
                            refreshChallenges={getActiveChallenges}
                            badgeURL={item.badge_image_url}
                          />
                        </Link>
                      ))}
                  </div>
                </>
              ) : (
                <>
                  {pastChallenges === null ? (
                    <Loading
                      size={100}
                      color={'var(--white)'}
                      loading={true}
                      right
                    />
                  ) : pastChallenges.length > 0 ? (
                    pastChallenges.map((item, i) => (
                      <Link to={`challenges/${item.id}`} key={`past-${i}`}>
                        <JoinedChallengeCard
                          title={item.name}
                          endTime={item.end_date}
                          metric={item.required_unit}
                          goal={item.goal}
                          place={item.place}
                          challengeId={item.id}
                          startTime={item.start_date}
                          ended={true}
                          badgeURL={item.badge_image_url}
                        />
                      </Link>
                    ))
                  ) : (
                    <h2 style={{textAlign: 'center', marginTop: '10px'}}>
                      {NO_PAST_CHALLENGES}
                    </h2>
                  )}
                </>
              )}
            </Route>
          </Switch>
        </>
      )}
    </div>
  );
}
