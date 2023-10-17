import React from 'react';
import Loading from '../Loading';
import styles from './SearchGroupsList.module.css';
import SearchSection from './SearchSection';
import {GROUP_SEARCH_INSTRUCTIONS} from '../../../../shared/constants/OtherMessages';
import {NO_GROUPS_TIP} from '../../../../shared/constants/ErrorMessages';

const SearchGroupsList = ({groups, loading, searchPressed, searchEmpty}) => (
  <div className={styles.container}>
    <Loading size={100} color={'var(--white)'} loading={loading} right />
    {/* default message */}
    {searchEmpty && !loading ? (
      <p className={styles.instructionsMsg}>{GROUP_SEARCH_INSTRUCTIONS}</p>
    ) : // results
    groups[0]?.data.length !== 0 || groups[1]?.data.length !== 0 ? (
      <>
        <SearchSection
          searchPressed={searchPressed}
          section={groups[0]}
          loading={loading}
          searchEmpty={searchEmpty}
        />
        <SearchSection
          searchPressed={searchPressed}
          section={groups[1]}
          loading={loading}
          searchEmpty={searchEmpty}
        />
      </>
    ) : !loading ? (
      // no results for any section message
      <p className={styles.instructionsMsg}>{NO_GROUPS_TIP}</p>
    ) : null}
  </div>
);

export default SearchGroupsList;
