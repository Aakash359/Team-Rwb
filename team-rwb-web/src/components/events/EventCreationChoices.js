import React, {useState} from 'react';
import CreateEvent from './CreateEvent';
import styles from './EventCreationChoices.module.css';
import RWBButton from '../RWBButton';
import {
  logChooseChapterEvent,
  logChooseMemberEvent,
} from '../../../../shared/models/Analytics';

const EventCreationChoices = ({
  setCreateEventChoices,
  closeModalHandlers,
  createEventModal,
  setCreateEventModal,
}) => {
  const [isChapterEvent, setIsChapterEvent] = useState(false);

  const openCreateEventHandler = (type) => {
    if (type === 'chapter') {
      logChooseChapterEvent();
      setIsChapterEvent(true);
      setCreateEventModal((prevState) => !prevState);
      return;
    } else {
      logChooseMemberEvent();
      setCreateEventModal((prevState) => !prevState);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.buttonWrapper}>
          <RWBButton
            onClick={() => openCreateEventHandler('chapter')}
            label={'Chapter Event'}
            buttonStyle={'secondary'}
          />
          <RWBButton
            onClick={() => openCreateEventHandler('member')}
            label={'Member Event'}
            buttonStyle={'secondary'}
          />
          <RWBButton
            onClick={() => closeModalHandlers()}
            label={'Cancel'}
            buttonStyle={'secondary'}
          />
        </div>
      </div>
      {createEventModal && (
        <CreateEvent
          closeModalHandlers={closeModalHandlers}
          setCreateEventChoices={setCreateEventChoices}
          isChapterEvent={isChapterEvent}
        />
      )}
    </>
  );
};

export default EventCreationChoices;
