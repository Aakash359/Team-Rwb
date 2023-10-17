import {IconButton, Paper, Toolbar, Typography} from '@material-ui/core';
import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {rwbApi} from '../../../../shared/apis/api';
import {NO_BLOCKED_USERS} from '../../../../shared/constants/OtherMessages';
import Loading from '../Loading';
import ChevronBackIcon from '../svgs/ChevronBackIcon';
import styles from './BlockedUsers.module.css';
import BlockedUsersList from './BlockedUsersList';

const BlockedUsers = () => {
  const [data, setData] = useState([]);
  const [newData, setNewData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    rwbApi
      .getListOfBlockedUsers()
      .then((res) => {
        setData(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.warn(error);
      });
  }, [newData]);
  const history = useHistory();
  return (
    <div className={styles.container}>
      <Loading size={100} color={'var(--white)'} loading={isLoading} />
      <Paper className={styles.root}>
        <Toolbar className={styles.toolbar}>
          <IconButton
            edge="start"
            className={styles.menuButton}
            color="inherit"
            onClick={() => history.goBack()}>
            <ChevronBackIcon />
          </IconButton>
          <Typography variant="h6" className={styles.title}>
            Blocked Users
          </Typography>
        </Toolbar>
      </Paper>
      <div className={styles.contentContainer}>
        {data.length > 0 ? (
          <BlockedUsersList setNewData={setNewData} data={data} />
        ) : (
          NO_BLOCKED_USERS
        )}
        <div className={styles.verticalMargin}></div>
      </div>
    </div>
  );
};

export default BlockedUsers;
