import React from 'react';
import styles from './FeedListItem.module.css';

const linkItem = (name, onClick) => {
  return (
    <span className={`namesAndObjects ${styles.name}`} onClick={onClick}>
      {`> ${name || ''}`}
    </span>
  );
};

function ListItemTitle(
  history,
  navigating,
  type,
  verb,
  event,
  group,
  challenge,
) {
  if (type === 'event') {
    if (verb === 'create') return `added an event`;
    else if (verb === 'going' || verb === 'interested') return `is ${verb}`;
    else if (verb === 'checked_in') return `checked into`;
  } else if (type === 'post') {
    if (event) {
      if (navigating) return `posted on ${event.name || ''}`;
      return linkItem(event.name, () => history.push(`/events/${event.id}`));
    } else if (group) {
      if (navigating) return `posted on ${group.name || ''}`;
      return linkItem(group.name, () => history.push(`/groups/${group.id}`));
    } else if (challenge) {
      if (navigating) return `posted on ${challenge.name || ''}`;
      return linkItem(challenge.name, () =>
        history.push(`/challenges/${challenge.id}`),
      );
    } else {
      return 'posted';
    }
  }
}

export default ListItemTitle;
