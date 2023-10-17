import React, {Component} from 'react';
import styles from './EnhancedCard.module.css';
import DefaultProfileImg from '../../../../shared/images/DefaultProfileImg.png';
import moment from 'moment';
import {
  defaultEventPhoto,
  localizeDate,
} from '../../../../shared/utils/Helpers';
import {Link} from 'react-router-dom';
import {DATE_FMT, TIME_FMT} from '../../../../shared/constants/DateFormats';
import {formatEventCardTitle} from '../../../../shared/utils/FeedHelpers';

export default class EnhancedCard extends Component {
  render() {
    const {
      id,
      name,
      category,
      start,
      end,
      photo_url,
      time_zone_id,
      group_name,
      is_all_day,
      is_virtual,
    } = this.props.event;
    return (
      <Link to={`/events/${id}`}>
        <div className={styles.container}>
          <div className={styles.imageContainer}>
            <img
              className={styles.cardImage}
              src={photo_url || defaultEventPhoto(category)}
              alt="Event Image"
            />
          </div>
          <div className={styles.cardInfoContainer}>
            <p className={styles.eventTitle}>{formatEventCardTitle(name)}</p>
            {/* not yet added */}
            <p className={styles.groupName}>{group_name}</p>
            <p className={styles.dateInfo}>
              {localizeDate(is_virtual, time_zone_id, start).format(DATE_FMT)}
            </p>
            <p className={styles.dateInfo}>
              {is_all_day
                ? 'All Day Event'
                : `${localizeDate(is_virtual, time_zone_id, start).format(
                    TIME_FMT,
                  )} - ${localizeDate(is_virtual, time_zone_id, end).format(
                    TIME_FMT,
                  )}`}
            </p>
          </div>
        </div>
      </Link>
    );
  }
}
