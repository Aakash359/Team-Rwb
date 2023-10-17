'use strict';

import {StyleSheet} from 'react-native';
import {RWBColors} from '../styles';

const attendeeCardStyles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: '5%',
  },
  eagleContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RWBColors.grey5,
    paddingVertical: 20,
    paddingHorizontal: '5%',
  },
  image: {
    width: 64,
    height: 64,
    margin: 12,
    borderColor: 'black',
  },
  details: {
    flexDirection: 'column',
    marginLeft: 10,
  },
  titleOverride: {
    paddingBottom: 1,
  },
  bodyOverride: {
    marginBottom: 1,
    marginTop: 1,
    paddingBottom: 0,
  },
  iconContainer: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  unblockContainer: {
    right: 10,
    position: 'absolute',
    paddingTop: 5,
  },
});

export default attendeeCardStyles;
