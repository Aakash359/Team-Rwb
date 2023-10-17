import React from 'react';
import {NO_GROUPS_FOUND} from '../../../../shared/constants/ErrorMessages';
import GroupCard from './GroupCard';
import styles from './SearchSection.module.css';

const SearchSection = ({section, loading, searchPressed, searchEmpty}) => (
  <div className={styles.container}>
    {!searchEmpty && <p className="formLabel">{section?.title}</p>}
    {section?.data.map((group, i) => (
      <div className={styles.sectionItem} key={i}>
        <GroupCard
          key={i}
          group={group}
          favorites={false}
          horizontal={true}
          searchPressed={searchPressed}
        />
      </div>
    ))}
    {!loading && !searchEmpty && !section?.data.length && (
      <div className={styles.emptyContainer}>
        <p>{NO_GROUPS_FOUND}</p>
      </div>
    )}
  </div>
);

export default SearchSection;
