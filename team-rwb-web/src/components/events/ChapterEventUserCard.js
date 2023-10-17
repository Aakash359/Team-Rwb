import React, {useState, useRef, useCallback} from 'react';
import PersonIcon from '@material-ui/icons/Person';
import styles from './CreateEvent.module.css';
import Attendee from './Attendee';
import {rwbApi} from '../../../../shared/apis/api';
import InvitedUsersSearchList from './InvitedUsersSearchList';
import debounce from 'lodash.debounce';

const DEBOUNCE_MS = 500;

const ChapterEventUserCard = ({title, userDetails, setHostUserId}) => {
  const searchUsers = (text) => {
    rwbApi.searchUser(text).then((result) => setUserSearchList(result));
  };

  const [userInputValue, setUserInputValue] = useState('');
  const [usersSearchList, setUserSearchList] = useState([]);
  const [isHostSelector, setIsHostSelector] = useState(false);
  const [hostUserData, setHostUserData] = useState(null);
  // https://reactjs.org/docs/hooks-reference.html#usecallback
  // lodash debounce is supposed to be an anonymous function usually, but that does not work in a react hook, so we use a memoized callback
  const debouncedSearchUsers = useCallback(
    debounce(searchUsers, DEBOUNCE_MS),
    [],
  );

  const inputHandler = (e) => {
    const text = e.target.value;
    setUserInputValue(text);
    debouncedSearchUsers(text);
  };

  const removeHostUser = () => {
    if (title === 'Host') {
      setUserSearchList([]);
      setIsHostSelector((prevState) => !prevState);
    }
  };

  const onPickHostClick = (user) => {
    if (title === 'Host') {
      // removeHostUser();
      setHostUserData(user._source);
      setHostUserId(user._source.id);
      setUserInputValue('');
    }
  };

  return (
    <div>
      <div className={styles.chapterEventUserType} onClick={removeHostUser}>
        <PersonIcon className={styles.icon} /> <div>{title}</div>
      </div>
      <div className={styles.chapterEventUserCard}>
        {title === 'Creator' ? (
          <Attendee
            item={{...userDetails, public_profile: true}}
            onSelect={() => null}
          /> // no-op as creator cannot be modified. Will need style changes to match it
        ) : (
          <>
            {!isHostSelector && (
              <Attendee
                item={hostUserData || {...userDetails, public_profile: true}}
                onSelect={() => null}
              />
            )}
            <input
              value={userInputValue}
              placeholder="Pick a Host"
              onChange={inputHandler}
              className={styles.hostUsersInput}
            />
          </>
        )}

        {userInputValue && usersSearchList.length > 0 && (
          <div className={`${styles.hostUsersList} ${styles.invitedUsersList}`}>
            {usersSearchList.map((user, key) => (
              <div key={key.toString()} onClick={() => onPickHostClick(user)}>
                <InvitedUsersSearchList
                  user={user}
                  onInviteUserHandler={() => {}}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterEventUserCard;
