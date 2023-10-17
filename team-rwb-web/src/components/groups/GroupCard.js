import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {capitalizeFirstLetter} from '../../../../shared/utils/Helpers';
import styles from './GroupCard.module.css';

class GroupCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handlePress = () => {
    const {onDetailOpen, searchPressed} = this.props;
    // indicate that a group has been pressed, used as a way to remove onboarding message
    if (onDetailOpen) onDetailOpen();
    // if found via searching, clear results and return the groups tab to show results instead of search bar
    if (searchPressed) searchPressed();
  };

  render() {
    // when type (activity, chapter, etc) is included, text is to the right of the images instead of under. This is used for the search screen
    const {id, header_image_url, name, type} = this.props.group;
    const {horizontal, favorites} = this.props;

    // TODO: favorites groups design is not completed
    return (
      <Link to={`/groups/${id}`} onClick={this.handlePress}>
        <div
          className={`${styles.container} ${
            horizontal && styles.containerHorizontal
          }`}>
          <img
            src={header_image_url}
            className={`${styles.photo} ${favorites && styles.favoritesPhoto}`}
          />

          {horizontal ? (
            <div className={styles.textContainerSearch}>
              <h1>{name}</h1>
              <h5>{`${capitalizeFirstLetter(type)} Group`}</h5>
            </div>
          ) : (
            <p className={styles.name}>{name}</p>
          )}
        </div>
      </Link>
    );
  }
}

export default withRouter(GroupCard);
