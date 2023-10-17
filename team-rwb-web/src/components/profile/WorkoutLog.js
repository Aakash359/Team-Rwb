import React, {useEffect, useState} from 'react';
import {Link, useHistory, useLocation} from 'react-router-dom';
import Header from '../Header';
import styles from './WorkoutLog.module.css';
import {rwbApi} from '../../../../shared/apis/api';
import Loading from '../Loading';
import WorkoutCard from '../events/WorkoutCard';
import {hoursMinutesSecondsFromMinutes} from '../../../../shared/utils/ChallengeHelpers';
import CreatePost from '../feed/CreatePost';
import {WORKOUT_DELETE_WARNING} from '../../../../shared/constants/OtherMessages';
import {PROFILE_TAB_LABELS} from '../../../../shared/constants/Labels';

const WorkoutLog = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [createPostModal, setCreatePostModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(0);
  /*TODO - add pagination*/

  useEffect(() => {
    getUserWorkouts();
  }, []);

  const getUserWorkouts = () => {
    setLoading(true);
    setWorkouts([]);

    rwbApi
      .getUserWorkouts()
      .then((workouts) => {
        setWorkouts(workouts.data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn(err);
        alert('Error retrieving user workouts.');
        setLoading(false);
      });
  };

  const loadMore = () => {
    /*TODO*/
  };

  const onWorkoutDelete = (index) => {
    if (window.confirm(WORKOUT_DELETE_WARNING)) {
      setIsDeleting(true);
      rwbApi
        .deleteWorkout(workouts[index].event_id)
        .then(() => {
          getUserWorkouts();
          setIsDeleting(false);
        })
        .catch((err) => {
          window.alert('Error deleting workout.');
          setIsDeleting(false);
        });
    }
  };

  const shareWorkout = (index) => {
    setCreatePostModal(true);
    setSelectedWorkout(index);
  };

  const openCloseModalHandler = () =>
    setCreatePostModal((prevState) => !prevState);

  return (
    <>
      <div className={styles.rootContainer}>
        <Header
          title={PROFILE_TAB_LABELS.CHALLENGE_WORKOUT_LOGS}
          onBack={() => history.goBack()}
        />
        <Loading
          size={100}
          color={'var(--white)'}
          loading={loading || isDeleting}
        />
        <div className={styles.workoutListContainer}>
          {workouts.length > 0 ? (
            workouts
              .sort(
                (a, b) => Date.parse(b.entry_date) - Date.parse(a.entry_date),
              )
              .map((item, index) => {
                return (
                  <Link
                    to={{
                      pathname: `/events/${item.event_id}`,
                    }}>
                    <div className={styles.workoutCardWrapper} key={index}>
                      <WorkoutCard
                        eventStartTime={item.entry_date}
                        eventName={item.event_name}
                        chapterName={item.chapter_name}
                        miles={item.miles}
                        steps={item.steps}
                        hours={
                          hoursMinutesSecondsFromMinutes(item.minutes).hours
                        }
                        minutes={
                          hoursMinutesSecondsFromMinutes(item.minutes).minutes
                        }
                        seconds={
                          hoursMinutesSecondsFromMinutes(item.minutes).seconds
                        }
                        onShare={() => shareWorkout(index)}
                        onDelete={() => onWorkoutDelete(index)}
                      />
                    </div>
                  </Link>
                );
              })
          ) : (
            <div className={styles.emptyListContainer}>
              {!loading && (
                <span>
                  Your recorded workouts from challenge events will appear here.
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      {createPostModal && (
        <CreatePost
          type={'user'}
          eventID={workouts[selectedWorkout].event_id}
          challengeID={true}
          closeModalHandler={openCloseModalHandler}
          eventName={workouts[selectedWorkout].event_name}
          chapterName={workouts[selectedWorkout].chapter_name}
          eventStartTime={workouts[selectedWorkout].entry_date}
          miles={workouts[selectedWorkout].miles}
          steps={workouts[selectedWorkout].steps}
          hours={
            hoursMinutesSecondsFromMinutes(workouts[selectedWorkout].minutes)
              .hours
          }
          minutes={
            hoursMinutesSecondsFromMinutes(workouts[selectedWorkout].minutes)
              .minutes
          }
          seconds={
            hoursMinutesSecondsFromMinutes(workouts[selectedWorkout].minutes)
              .seconds
          }
          mergeNewPost={() => {}}
        />
      )}
    </>
  );
};

export default WorkoutLog;
