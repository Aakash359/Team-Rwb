import React, {useState} from 'react';
import CreatePost from './CreatePost';
import styles from './CreatePostButton.module.css';
import {MdAdd as AddIcon} from 'react-icons/md';

const CreatePostButton = ({
  eventID = null,
  groupID = null,
  challengeID = null,
  type,
  mergeNewPost,
}) => {
  const [createPostModal, setCreatePostModal] = useState(false);

  const openCloseModalHandler = () =>
    setCreatePostModal((prevState) => !prevState);

  return (
    <>
      <div
        className={styles.floatingBtnContainer}
        onClick={openCloseModalHandler}>
        <AddIcon className={styles.addIcon} />
      </div>
      {createPostModal && (
        <CreatePost
          type={type}
          eventID={eventID}
          groupID={groupID}
          challengeID={challengeID}
          closeModalHandler={openCloseModalHandler}
          mergeNewPost={mergeNewPost}
        />
      )}
    </>
  );
};

export default CreatePostButton;
