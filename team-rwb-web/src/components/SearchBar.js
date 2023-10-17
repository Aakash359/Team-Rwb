import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from './SearchBar.module.css';
import SearchIcon from './svgs/SearchIcon';
import LocationIcon from './svgs/LocationIcon';
import ClearSearchIcon from './svgs/ClearSearchIcon';
import {isNullOrEmpty} from '../../../shared/utils/Helpers';
import {withRouter} from 'react-router-dom';

class SearchBar extends Component {
  render() {
    const {
      style,
      value,
      placeholder,
      onChange,
      onSubmit,
      onClearSearch,
      noRightRadius,
      onFocus,
      searching,
    } = this.props;

    return (
      <div className={styles.container} style={style}>
        {this.props.searchType === 'location' ? (
          <LocationIcon className={styles.icon} />
        ) : (
          <div>
            <SearchIcon className={styles.icon} />
          </div>
        )}
        <input
          className={`${styles.searchBar} ${
            noRightRadius && styles.noRightRadius
          } bodyCopyForm`}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
          onFocus={onFocus}
        />
        <div
          className={
            !isNullOrEmpty(value) || searching
              ? styles.clearSearch
              : styles.hideClear
          }
          onClick={onClearSearch}>
          <ClearSearchIcon />
        </div>
        {/* <div
          onClick={() => {
            history.push('/notifications');
            logAccessNotifications();
          }}>
          <NotificationIcon className={styles.notificationIcon} />
        </div> */}
      </div>
    );
  }
}

export default withRouter(SearchBar);

SearchBar.defaultProps = {
  placeholder: 'Search',
};

SearchBar.propTypes = {
  style: PropTypes.object,
  searchType: PropTypes.string,
  placeholder: PropTypes.string,
  noRightRadius: PropTypes.bool,
};
