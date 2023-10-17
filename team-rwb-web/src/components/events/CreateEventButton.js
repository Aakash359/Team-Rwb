import React, {useState} from 'react';
import CreateEvent from './CreateEvent';
import styles from './CreateEventButton.module.css';
import {MdAdd as AddIcon} from 'react-icons/md';
import {userProfile} from '../../../../shared/models/UserProfile';
import EventCreationChoices from './EventCreationChoices';
import {logStartEventCreation} from '../../../../shared/models/Analytics';

const CreateEventButton = ({
  groupId,
  groupName,
  selectedTab,
  refreshEvents,
  isAdmin,
  groupType,
  isVirtual,
}) => {
  const [createEventModal, setCreateEventModal] = useState(false);
  const [createEventChoices, setCreateEventChoices] = useState(false);

  const user = userProfile.getUserProfile();

  const openModalHandler = () => {
    if (user.salesforce_contact_id) {
      logStartEventCreation();
      setCreateEventModal((prevState) => !prevState);
    } else {
      alert(
        'Unable to create an event until your account has fully synced. Try again in 15 minutes.',
      );
    }
  };

  const closeModalHandlers = () => {
    setCreateEventChoices(false);
    setCreateEventModal(false);
  };

  return (
    <>
      <div className={styles.floatingBtnContainer} onClick={openModalHandler}>
        <AddIcon className={styles.addIcon} />
      </div>
      {createEventModal && (
        <CreateEvent
          closeModalHandlers={closeModalHandlers}
          setCreateEventChoices={() => {}}
          groupId={groupId}
          groupName={groupName}
          selectedTab={selectedTab}
          refreshEvents={refreshEvents}
          isAdmin={isAdmin}
          groupType={groupType}
          isVirtual={isVirtual}
        />
      )}
      {createEventChoices && (
        <EventCreationChoices
          setCreateEventChoices={setCreateEventChoices}
          closeModalHandlers={closeModalHandlers}
          createEventModal={createEventModal}
          setCreateEventModal={setCreateEventModal}
        />
      )}
    </>
  );
};

export default CreateEventButton;
