import React, {Component, createRef} from 'react';
import GroupCard from './GroupCard';
import styles from './GroupContainer.module.css';
import Loading from '../Loading';
import {ClipLoader} from 'react-spinners';

const EMPTY_LIST_MSG = "You currently aren't in any groups.";

export default class GroupContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.scrollContainerRef = createRef();
  }

  isFavorites = () => {
    return this.props.title === 'favorites';
  };

  handleHorizontalScroll = (e) => {
    e.preventDefault();

    this.scrollContainerRef.current.scrollTo({
      top: 0,
      left: this.scrollContainerRef.current.scrollLeft + e.deltaY,
      behaviour: 'smooth', // for smooth scrolling
    });
  };

  determineEmptyMessage = () => {
    const {title} = this.props;
    if (title === 'my groups') return EMPTY_LIST_MSG;
    else if (title === 'favorites') return 'Favorite a group to add it here.';
    else if (title === 'nearby groups') return 'No groups within 50 miles.';
    // not sure if this will be needed, keeping as a safety measure
  };

  render() {
    const {title, data, onDetailOpen, isLoading} = this.props;

    return (
      <div
        className={`${styles.container} ${
          this.isFavorites() && styles.favoritesContainer
        }`}>
        <h1 className={styles.title}>{title}</h1>
        {isLoading ? (
          <div className={`${styles.spinnerContainer}`}>
            <ClipLoader size={30} color={'var(--gray40)'} loading={true} />
          </div>
        ) : (
          <div
            ref={this.scrollContainerRef}
            className={styles.scrollContainer}
            onWheel={this.handleHorizontalScroll}>
            {data?.length > 0 ? (
              data.map((group, i) => (
                <GroupCard
                  group={group}
                  key={i}
                  favorites={this.isFavorites()}
                  onDetailOpen={onDetailOpen}
                />
              ))
            ) : (
              <p>{this.determineEmptyMessage()}</p>
            )}
          </div>
        )}
      </div>
    );
  }
}
