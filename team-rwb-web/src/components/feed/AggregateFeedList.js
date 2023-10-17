import React, {Component} from 'react';
import {isPostVisible} from '../../../../shared/utils/FeedHelpers';
import AggregateFeedListItem from './AggregateFeedListItem';
import styles from './Feed.module.css';

export default class AggregateFeedList extends Component {
  render() {
    const {
      userFeed,
      eventID,
      type,
      origin,
      mergeNewPost,
      pinnedPost,
    } = this.props;
    return (
      <div className={styles.aggregateFeedContainter}>
        {userFeed?.length > 0 && userFeed.map(
          (singleFeed, i) =>
            isPostVisible(pinnedPost, singleFeed) &&
            singleFeed.activities[0].user.id && (
              <AggregateFeedListItem
                data={singleFeed}
                type={type || singleFeed.activities[0].object.split(':')[0]}
                eventID={eventID}
                key={i}
                origin={origin}
                mergeNewPost={mergeNewPost}
              />
            ),
        )}
      </div>
    );
  }
}
