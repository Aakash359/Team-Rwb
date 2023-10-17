import React, {Component} from 'react';
import FeedListItem from './FeedListItem';
import {Link} from 'react-router-dom';

export default class FeedList extends Component {
  render() {
    const {
      userFeed,
      eventID,
      type,
      origin,
      isSponsor,
      mergeNewPost,
    } = this.props;
    return (
      <div>
        {userFeed.map((singleFeed, i) => (
          <FeedListItem
            data={singleFeed}
            type={type || singleFeed.object?.split(':')[0]}
            eventID={eventID}
            key={i}
            origin={origin}
            isSponsor={isSponsor}
            mergeNewPost={mergeNewPost}
          />
        ))}
      </div>
    );
  }
}
