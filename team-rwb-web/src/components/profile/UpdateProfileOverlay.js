import React, {Component} from 'react';
import styles from './UpdateProfileOverlay.module.css';
import {
  NEW_V2,
  NEW_V2_CONTENT,
  NEW_V2_LINK,
  NEW_V2_LINK_TEXT,
  SOCIAL_FEEDS,
  SOCIAL_FEEDS_CONTENT,
  EVENT_CREATION,
  EVENT_CREATION_CONTENT,
  UPDATE_PROFILE,
  UPDATE_PROFILE_CONTENT,
} from '../../../../shared/constants/OnboardingMessages';
import EventCreationExample from '../../../../shared/images/EventCreationExample.png';
import SocialProfileExample from '../../../../shared/images/SocialProfileExample.png';
import UserFeedExample from '../../../../shared/images/UserFeedExample.png';
import ChevronRightIcon from '../svgs/ChevronRightIcon';

export default class UpdateProfileOverlay extends Component {
  constructor() {
    super();
    this.state = {
      screen: 0,
    };
  }

  updateScreen = (direction) => {
    const {screen} = this.state;
    if (direction === 'forward' && screen < 3)
      this.setState({screen: this.state.screen + 1});
    else if (direction === 'backward' && screen > 0)
      this.setState({screen: this.state.screen - 1});
  };

  render() {
    const {screen} = this.state;
    return (
      <div>
        <div className={styles.container} />
        <div className={styles.contentSquare}>
          <div className={styles.top}>
            <div
              className={styles.arrow}
              onClick={() => this.updateScreen('backward')}>
              <ChevronRightIcon
                className={styles.leftChevron}
                tintColor={'var(--magenta)'}
              />
            </div>
            <div>
              {screen === 0 ? (
                <div className={styles.contentContainer}>
                  <h2>{NEW_V2}</h2>
                  <br />
                  <p>{NEW_V2_CONTENT}</p>
                  <br />
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={NEW_V2_LINK}>
                    {NEW_V2_LINK_TEXT}
                  </a>
                </div>
              ) : null}
              {screen === 1 ? (
                <div className={styles.contentContainer}>
                  <h2>{SOCIAL_FEEDS}</h2>
                  <br />
                  <p>{SOCIAL_FEEDS_CONTENT}</p>
                  <br />
                  <img src={UserFeedExample} alt="Feed Example" />
                </div>
              ) : null}
              {screen === 2 ? (
                <div className={styles.contentContainer}>
                  <h2>{EVENT_CREATION}</h2>
                  <br />
                  <p>{EVENT_CREATION_CONTENT}</p>
                  <br />
                  <img
                    src={EventCreationExample}
                    alt="Event Creation Example"
                  />
                </div>
              ) : null}
              {screen === 3 ? (
                <div className={styles.contentContainer}>
                  <h2>{UPDATE_PROFILE}</h2>
                  <br />
                  <p>{UPDATE_PROFILE_CONTENT}</p>
                  <br />
                  <img
                    src={SocialProfileExample}
                    alt="Updating Profile Example"
                  />
                </div>
              ) : null}
            </div>
            <div
              className={styles.arrow}
              onClick={() => this.updateScreen('forward')}>
              <ChevronRightIcon tintColor={'var(--magenta)'} />
            </div>
          </div>
          <div className={styles.bottom}>
            <div className={styles.bottomContainer}>
              {screen !== 3 ? (
                <>
                  <div
                    className={styles.dot}
                    style={{backgroundColor: screen === 0 ? 'black' : null}}
                    onClick={() => this.setState({screen: 0})}
                  />
                  <div
                    className={styles.dot}
                    style={{backgroundColor: screen === 1 ? 'black' : null}}
                    onClick={() => this.setState({screen: 1})}
                  />
                  <div
                    className={styles.dot}
                    style={{backgroundColor: screen === 2 ? 'black' : null}}
                    onClick={() => this.setState({screen: 2})}
                  />
                  <div
                    className={styles.dot}
                    style={{backgroundColor: screen === 3 ? 'black' : null}}
                    onClick={() => this.setState({screen: 3})}
                  />
                </>
              ) : (
                <button
                  className={styles.continueButton}
                  onClick={this.props.finishOnboarding}>
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
