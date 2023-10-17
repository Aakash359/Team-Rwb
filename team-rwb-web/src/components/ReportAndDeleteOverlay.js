import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {rwbApi} from '../../../shared/apis/api';
import PostOptionIcon from '../components/svgs/PostOptionIcon';
import {userProfile} from '../../../shared/models/UserProfile';
import styles from './ReportAndDeleteOverlay.module.css';
import {capitalizeFirstLetter} from '../../../shared/utils/Helpers';
import {REPORT_ERROR} from '../../../shared/constants/ErrorMessages';
import CreatePost from './feed/CreatePost';
import CreateComment from './feed/CreateComment';
import {hoursMinutesSecondsFromMinutes} from '../../../shared/utils/ChallengeHelpers';

export default class ReportAndDeleteOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      overlayVisible: false,
      createPostVisible: false,
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
      this.setState({
        overlayVisible: false,
      });
    }
  };

  // determines which type of report is being done
  report = () => {
    if (
      window.confirm(
        `Team RWB: Would you like to report this ${this.props.type}?`,
      )
    ) {
      const reporterID = JSON.stringify({
        reporter: userProfile.getUserProfile().id,
      });
      if (this.props.type === 'post') {
        if (this.props.eventID) this.reportEventPost(reporterID);
        else if (this.props.groupID) this.reportGroupPost(reporterID);
        else if (this.props.posterID) this.reportUserPost(reporterID);
      } else if (this.props.type === 'comment') {
        this.reportCommentPost(reporterID);
        return;
      } else {
        throw new Error("Invalid Type, expecting the type 'post' or 'comment");
      }
    } else {
      this.setState({overlayVisible: false});
    }
  };

  delete = () => {
    this.props.deletePost();
    this.setState({overlayVisible: false});
  };

  edit = () => {
    this.setState({
      overlayVisible: false,
      createPostVisible: true,
    });
  };

  reportUserPost = (reporterID) => {
    rwbApi
      .reportUserPost(this.props.posterID, this.props.streamID, reporterID)
      .then(() => {
        window.alert('Team RWB: Your report has been sent');
        this.setState({overlayVisible: false});
      })
      .catch((err) => {
        window.alert(`Team RWB: ${REPORT_ERROR}`);
        this.setState({overlayVisible: false});
        console.warn(err);
      });
  };

  reportEventPost = (reporterID) => {
    rwbApi
      .reportEventPost(this.props.eventID, this.props.streamID, reporterID)
      .then(() => {
        window.alert('Team RWB: Your report has been sent');
        this.setState({overlayVisible: false});
      })
      .catch((err) => {
        window.alert(`Team RWB: ${REPORT_ERROR}`);
        this.setState({overlayVisible: false});
        console.warn(err);
      });
  };

  reportCommentPost = (reporterID) => {
    rwbApi
      .reportUserComment(this.props.posterID, this.props.commentID, reporterID)
      .then(() => {
        window.alert('Team RWB: Your report has been sent');
        this.setState({overlayVisible: false});
      })
      .catch((err) => {
        window.alert(`Team RWB: ${REPORT_ERROR}`);
        this.setState({overlayVisible: false});
        console.warn(err);
      });
  };

  reportGroupPost = (reporterID) => {
    rwbApi
      .reportGroupPost(this.props.groupID, this.props.streamID, reporterID)
      .then(() => {
        window.alert('Team RWB: Your report has been sent');
        this.setState({overlayVisible: false});
      })
      .catch((err) => {
        window.alert(`Team RWB: ${REPORT_ERROR}`);
        this.setState({overlayVisible: false});
        console.warn(err);
      });
  };

  closeComment = (refresh, data = null) => {
    if (refresh) this.props.refreshReactions();
    else if (data && this.props.updateComment) this.props.updateComment(data);
    this.setState({createPostVisible: false});
  };

  render() {
    return (
      <div ref={this.wrapperRef} style={{position: 'relative'}}>
        {!this.props.eventStatusPost ? (
          <div
            className={styles.optionsContainer}
            onClick={() => this.setState({overlayVisible: true})}>
            <PostOptionIcon height="28" width="28" />
          </div>
        ) : null}
        {this.state.overlayVisible ? (
          this.props.canDelete() ? (
            <div className={styles.container}>
              <button
                onClick={() => this.edit()}>{`Edit ${capitalizeFirstLetter(
                this.props.type,
              )}`}</button>
              <button
                onClick={() => this.delete()}>{`Delete ${capitalizeFirstLetter(
                this.props.type,
              )}`}</button>
            </div>
          ) : this.props.type === 'post' ? (
            <div className={styles.container}>
              <button
                onClick={() =>
                  this.props.blockPost()
                }>{`Block ${capitalizeFirstLetter(this.props.type)}`}</button>
              <button
                onClick={() => this.report()}>{`Report ${capitalizeFirstLetter(
                this.props.type,
              )}`}</button>
            </div>
          ) : (
            <div className={styles.container}>
              <button
                onClick={() => this.report()}>{`Report ${capitalizeFirstLetter(
                this.props.type,
              )}`}</button>
            </div>
          )
        ) : null}

        {this.state.createPostVisible && (
          <div className={styles.editContainer}>
            {this.props.commentID ? (
              <CreateComment
                poster={this.props.poster}
                streamID={this.props.streamID}
                closeModalHandler={this.closeComment}
                verbEvent={this.props.verbEvent}
                time={this.props.time}
                text={this.props.text}
                tagged={this.props.tagged}
                history={this.props.history}
                postImage={this.props.image}
                posterText={this.props.posterText}
                posterTagged={this.props.posterTagged}
                posterTime={this.props.posterTime}
                commentID={this.props.commentID}
                title={this.props.title}
                verb={this.props.verb}
              />
            ) : (
              <CreatePost
                type={this.props.type}
                eventID={this.props.eventID}
                groupID={this.props.groupID}
                text={this.props.text}
                image={this.props.image}
                tagged={this.props.tagged}
                id={this.props.streamID}
                closeModalHandler={() =>
                  this.setState({createPostVisible: false})
                }
                mergeNewPost={this.props.mergeNewPost}
                eventName={this.props.workout?.event_name}
                chapterName={this.props.workout?.chapter_name}
                eventStartTime={this.props.workout?.event_start_time}
                miles={this.props.workout?.miles}
                steps={this.props.workout?.steps}
                hours={
                  hoursMinutesSecondsFromMinutes(this.props.workout?.minutes)
                    .hours
                }
                minutes={
                  hoursMinutesSecondsFromMinutes(this.props.workout?.minutes)
                    .minutes
                }
                seconds={
                  hoursMinutesSecondsFromMinutes(this.props.workout?.seconds)
                    .seconds
                }
              />
            )}
          </div>
        )}
      </div>
    );
  }
}
