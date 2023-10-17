import React, {useState} from 'react';
import styles from './CreateCommentBar.module.css';
import CreateComment from './CreateComment';

function CreateCommentBar({
  poster,
  streamID,
  verbEvent,
  time,
  text,
  tagged,
  history,
  postImage,
  refreshReactions,
  workout,
}) {
  const [createCommentModal, setCreateCommentModal] = useState(false);

  const openCloseModalHandler = (refresh = null) => {
    if (refresh && createCommentModal) refreshReactions(true);
    setCreateCommentModal((prevState) => !prevState);
  };

  return (
    <>
      <div className={styles.contHolder}>
        <div className={styles.container} onClick={openCloseModalHandler}>
          <div className={styles.commentInput}>
            <p>Add a comment</p>
          </div>
        </div>
      </div>
      {createCommentModal && (
        <CreateComment
          poster={poster}
          streamID={streamID}
          closeModalHandler={openCloseModalHandler}
          verbEvent={verbEvent}
          time={time}
          text={text}
          tagged={tagged}
          history={history}
          postImage={postImage}
          workout={workout}
        />
      )}
    </>
  );
}

export default CreateCommentBar;
