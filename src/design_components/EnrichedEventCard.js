import React, {Component} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import globalStyles, {RWBColors} from '../styles';
import {defaultEventPhoto, localizeDate} from '../../shared/utils/Helpers';
import {DATE_FMT, TIME_FMT} from '../../shared/constants/DateFormats';
import {formatEventCardTitle} from '../../shared/utils/FeedHelpers';

export default class EnrichedEventCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let {
      eventImage,
      eventTitle,
      start,
      end,
      group_name,
      is_all_day,
      category,
      isVirtual,
      timeZoneID,
    } = this.props;
    start = localizeDate(isVirtual, timeZoneID, start);
    end = localizeDate(isVirtual, timeZoneID, end);
    return (
      <View style={styles.cardContainer}>
        <View style={styles.photoContainer}>
          <Image
            resizeMode="cover"
            style={styles.photo}
            source={
              eventImage ? {uri: eventImage} : defaultEventPhoto(category)
            }
            alt={`${eventTitle} event card`}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text
            numberOfLines={1}
            style={[globalStyles.eventCardTitle, styles.titlePosition]}>
            {formatEventCardTitle(eventTitle)}
          </Text>
          {group_name ? (
            <Text style={globalStyles.h5}>{group_name}</Text>
          ) : null}
          <Text style={globalStyles.bodyCopyForm}>
            {start.format(DATE_FMT)}
            {`\n`}
            {is_all_day
              ? 'All Day Event'
              : `${start.format(TIME_FMT)} - ${end.format(TIME_FMT)}`}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: RWBColors.grey8,
    borderRadius: 5,
    height: 82,
    flexDirection: 'row',
    padding: 10,
  },
  photoContainer: {
    width: '35%',
    aspectRatio: 2 / 1,
  },
  photo: {
    borderColor: RWBColors.magenta,
    height: '100%',
    aspectRatio: 2 / 1,
    borderRadius: 5,
  },
  infoContainer: {
    paddingHorizontal: 8,
    flexDirection: 'column',
    alignSelf: 'center',
  },
  attendees: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
