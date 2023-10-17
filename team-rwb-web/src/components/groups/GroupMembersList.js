import React from 'react';
import Attendee from '../events/Attendee';
import styles from './GroupMembersList.module.css';

const GroupMembersList = ({label, data, onSelect, isSponsor}) => (
  <>
    <p className={`${'titleSubheader'} ${styles.label}`}>{label}</p>
    {data.map((item, i) => (
      <Attendee
        key={i}
        item={item}
        onSelect={onSelect}
        sponsorAdmin={label === 'admins' && isSponsor}
      />
    ))}
  </>
);

export default GroupMembersList;
