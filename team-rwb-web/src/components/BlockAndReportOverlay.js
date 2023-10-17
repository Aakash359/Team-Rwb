import {IconButton} from '@material-ui/core';
import React, {Component, useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {rwbApi} from '../../../shared/apis/api';
import PostOptionIcon from '../components/svgs/PostOptionIcon';
import styles from './ReportAndDeleteOverlay.module.css';

const BlockAndReportOverlay = ({loggedInUser, profileId}) => {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const myRef = useRef();
  const handleClickOutside = (event) => {
    const domNode = ReactDOM.findDOMNode(myRef.current);

    if (!domNode || !domNode.contains(event.target)) {
      setOverlayVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () =>
      document.removeEventListener('click', handleClickOutside, true);
  }, []);

  const blockUser = () => {
    if (window.confirm('Would you like to block this member?')) {
      rwbApi
        .blockUser(profileId)
        .then((res) => {
          window.alert('This user has been blocked.');
        })
        .catch((err) => console.log('err', err));
      setOverlayVisible(false);
    }
  };

  const reportUser = () => {
    if (window.confirm('Would you like to report this member?')) {
      setOverlayVisible(false);
      const reporterID = JSON.stringify({reporter: loggedInUser.id});
      rwbApi
        .reportUser(profileId, reporterID)
        .then(() => {
          window.alert('Team RWB: Your report has been sent');
        })
        .catch((err) => {
          console.warn(err);
        });
    }
  };

  return (
    <div ref={myRef} style={{position: 'relative'}}>
      <div
        className={styles.optionsContainer}
        onClick={() => setOverlayVisible(true)}>
        <IconButton edge="start" color="inherit">
          <PostOptionIcon height="28" width="28" tintColor="var(--magenta)" />
        </IconButton>
      </div>
      {overlayVisible ? (
        <>
          <div
            style={{top: '38px', right: '25px'}}
            className={styles.container}>
            <button style={{color: 'black'}} onClick={() => blockUser()}>
              Block user
            </button>
            <button style={{color: 'black'}} onClick={() => reportUser()}>
              Report user
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default BlockAndReportOverlay;
