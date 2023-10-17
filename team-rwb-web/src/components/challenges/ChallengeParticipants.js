import React, {useState, useEffect} from 'react';
import {useHistory, useLocation, useParams} from 'react-router-dom';
import {rwbApi} from '../../../../shared/apis/api';
import {hasReachedBottom} from '../../BrowserUtil';
import Attendee from '../events/Attendee';
import Header from '../Header';
import Loading from '../Loading';

const ChallengeParticipants = () => {
  const location = useLocation();
  const history = useHistory();
  const {challengeId} = useParams();
  const [participants, setParticipants] = useState(
    location?.state?.participants || [],
  );
  const [challengeName, setChallengeName] = useState(
    location?.state?.challengeName || '',
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [retrievedLastParticipant, setRetrievedLastParticipant] = useState(
    location?.state?.totalUsersCount === location?.state?.participants.length,
  );

  const trackScrolling = (event) => {
    event.preventDefault();
    const wrappedElement = document.getElementById('root');
    if (hasReachedBottom(wrappedElement)) {
      loadMoreUsers();
    }
  };

  const loadMoreUsers = () => {
    if (!loadingMore && !retrievedLastParticipant) {
      setLoadingMore(true);
      rwbApi.getChallengeParticipants(challengeId, page).then((result) => {
        setParticipants([...participants, ...result.participants]);
        setLoadingMore(false);
        setLoading(false);
        setRetrievedLastParticipant(
          participants.length + result.participants.length ===
            result.total_count,
        );
        setPage(page + 1);
      });
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', trackScrolling);
    return () => {
      window.removeEventListener('scroll', trackScrolling);
    };
  }, [loadMoreUsers]);

  const handleUserSelect = ({id}) => history.push(`/profile/${id}`);

  return (
    <div>
      <Header
        onBack={history.goBack}
        title={'Participants'}
        subtitle={challengeName}
      />
      {loading ? (
        <Loading size={100} color={'var(--white)'} loading={true} right />
      ) : (
        <>
          <div>
            {participants.map((participant) => {
              return (
                <Attendee
                  item={participant}
                  onSelect={handleUserSelect}
                  key={`participant-${participant.id}`}
                />
              );
            })}
          </div>
          {loadingMore && (
            <Loading
              size={60}
              color={'var(--grey20)'}
              loading={true}
              footerLoading
            />
          )}
        </>
      )}
    </div>
  );
};

export default ChallengeParticipants;
