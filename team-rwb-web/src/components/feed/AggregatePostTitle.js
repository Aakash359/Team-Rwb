import React, {Component} from 'react';
import styles from './FeedListItem.module.css';

export default class AggregatePostTitle extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.userID = this.props.activities[0].user.id; // only use the user ID of the first user (this is only be used when only one user has a status set)
  }

  getAllUsers = () => {
    const activities = this.props.activities;
    let users = [];
    for (let i = 0; i < activities.length; i++) {
      users.push(
        `${activities[i].user.first_name} ${activities[i].user.last_name}`,
      );
    }
    return users;
  };

  // used to help determine if the going/interested can just state one verb
  sameVerb = () => {
    const activities = this.props.activities;
    let verbs = [];
    for (let i = 0; i < activities.length; i++) {
      verbs.push(activities[i].verb);
    }
    // are all verbs the same
    return verbs.every((verb, i, verbs) => verb === verbs[0]);
  };

  goingOrInterested = (verb) => {
    return `${verb === 'going' ? 'going to' : 'interested in'}`;
  };

  formatTitleMessage = () => {
    let users = this.getAllUsers();
    const sameVerb = this.sameVerb();
    const verb = this.props.activities[0].verb; //the first verb will either be `checked_in` for those events, or will be used when all the verbs are the same for `going` or `interested`
    let message;
    if (users.length === 1) {
      if (verb === 'checked_in') message = 'checked into';
      else message = `is ${this.goingOrInterested(verb)}`;
    } else if (users.length === 2) {
      if (verb === 'checked_in') message = 'checked into';
      else if (sameVerb) message = `are ${this.goingOrInterested(verb)}`;
      else message = 'are going/interested in';
    } else {
      message = `and ${users.length - 2} ${
        users.length - 2 > 1 ? 'others' : 'other user'
      } you follow `;
      if (verb === 'checked_in') message += 'checked into';
      else if (sameVerb) message += `are ${this.goingOrInterested(verb)}`;
      else message += 'are going/interested in';
    }

    return ` ${message}`;
  };

  formatUsers = () => {
    const users = this.getAllUsers();
    if (users.length === 1) {
      return (
        <span
          className={`namesAndObjects ${styles.name}`}
          onClick={() => this.props.history.push(`/profile/${this.userID}`)}>
          {[users[0]]}
        </span>
      );
    } else if (users.length === 2) {
      return (
        <span style={{display: 'flex'}}>
          <p className={'namesAndObjects'}>{users[0]}</p>
          &nbsp;and&nbsp;
          <p className={'namesAndObjects'}>{users[1]}</p>
        </span>
      );
    } else {
      return (
        <span style={{display: 'flex'}}>
          <p className={'namesAndObjects'}>{users[0]}</p>
          ,&nbsp;
          <p className={'namesAndObjects'}>{users[1]}</p>
        </span>
      );
    }
  };

  render() {
    return (
      <span>
        {this.formatUsers()}
        {this.formatTitleMessage()}
      </span>
    );
  }
}
