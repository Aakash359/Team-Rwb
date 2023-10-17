import React from 'react';
import styles from './WorkoutCard.module.css';
import PostOptionIcon from '../svgs/PostOptionIcon';
import ReactDOM from 'react-dom';
import moment from 'moment';
import {insertLocaleSeperator} from '../../../../shared/utils/ChallengeHelpers';

class WorkoutCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      optionsOverlayVisible: this.props.optionsOverlayVisible || false,
    };
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  handleClickOutside = (event) => {
    const domNode = ReactDOM.findDOMNode(this);

    if (!domNode || !domNode.contains(event.target)) {
      this.setModalVisible(false);
    }
  };

  setModalVisible = (value) => {
    // If there is setOptionsOverlayVisible function passed from props use the props function, otherwise set state
    if (this.props.setOptionsOverlayVisible)
      this.props.setOptionsOverlayVisible(value);
    this.setState({optionsOverlayVisible: value});
  };

  onWorkoutDelete = () => {
    this.props.onDelete();
    this.setState({optionsOverlayVisible: false});
  };

  render() {
    const {
      miles,
      steps,
      hours,
      minutes,
      seconds,
      onShare,
      eventName,
      eventStartTime,
      chapterName,
      noBorderStyle,
    } = this.props;

    return (
      <div
        className={
          noBorderStyle ? styles.noBorderCard : styles.workoutCardContainer
        }>
        {eventName || chapterName || eventStartTime ? (
          <div className={styles.workoutDescription}>
            {eventName && (
              <h1 className={styles.eventTitle}>{eventName?.toUpperCase()}</h1>
            )}
            {chapterName && <h5>{chapterName}</h5>}
            {eventStartTime && (
              <h6 className={styles.eventDate}>
                {moment(eventStartTime).format('dddd, MMMM DD').toUpperCase()}
              </h6>
            )}
          </div>
        ) : null}
        <div className={styles.contentContainer}>
          <div
            className={
              noBorderStyle ? styles.noBorderInfo : styles.workoutInfoContainer
            }>
            <span>
              <h1 className={styles.workoutInfoText}>
                {insertLocaleSeperator(parseFloat(miles))}
              </h1>
              <h6 className={styles.workoutInfoLabelText}>MILES</h6>
            </span>
            <span>
              <h1 className={styles.workoutInfoText}>
                {insertLocaleSeperator(parseInt(steps))}
              </h1>
              <h6 className={styles.workoutInfoLabelText}>STEPS</h6>
            </span>
            <span>
              <h1 className={styles.workoutInfoText}>
                {`${hours}:${minutes}:${seconds}`}
              </h1>
              <h6 className={styles.workoutInfoLabelText}>DURATION</h6>
            </span>
          </div>
        </div>
        <div
          className={
            noBorderStyle
              ? styles.noBorderOptionsContainer
              : styles.optionsContainer
          }>
          <div
            className={styles.optionsIconWrapper}
            onClick={(e) => {
              e.preventDefault();
              this.setModalVisible(true);
            }}>
            <PostOptionIcon height="24" width="24" />
          </div>
          {this.state.optionsOverlayVisible && (
            <div
              className={styles.overlayContainer}
              onClick={(e) => e.preventDefault()}>
              <button onClick={onShare}>Share</button>
              <button onClick={this.onWorkoutDelete}>Delete</button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default WorkoutCard;
