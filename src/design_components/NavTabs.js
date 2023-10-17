import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

//SVGs
import AttendingIcon from '../../svgs/AttendingIcon';
import TicketIcon from '../../svgs/TicketIcon';
import InterestedIcon from '../../svgs/InterestedIcon';

import globalStyles, {RWBColors} from '../styles';

export default class NavTabs extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {selected} = this.props;
    let navTabs = this.props.tabs.map((tab, index) => {
      return (
        <View style={{flex: 1, backgroundColor: RWBColors.white}} key={tab.key}>
          <TouchableOpacity
            onPress={() => {
              this.props.handleOnPress(tab.key);
            }}
            style={selected === tab.key ? styles.selected : styles.unselected}>
            {tab.key === 'checked_in' ? (
              <TicketIcon
                style={styles.iconContainer}
                tintColor={
                  selected === 'checked_in'
                    ? RWBColors.magenta
                    : RWBColors.grey80
                }
              />
            ) : tab.key === 'going' ? (
              <AttendingIcon
                style={styles.iconContainer}
                tintColor={
                  selected === 'going' ? RWBColors.magenta : RWBColors.grey80
                }
              />
            ) : tab.key === 'interested' ? (
              <InterestedIcon
                style={styles.iconContainer}
                tintColor={
                  selected === 'interested'
                    ? RWBColors.magenta
                    : RWBColors.grey80
                }
              />
            ) : null}
            <Text
              style={[
                globalStyles.h3,
                selected === tab.key
                  ? styles.selectedText
                  : styles.unselectedText,
              ]}>
              {tab.name.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      );
    });

    let navTabsWithSeparators = [];

    for (let i = 0; i < navTabs.length; i++) {
      let Separator = (
        <View key={i} style={{width: 1, backgroundColor: '#eee'}} />
      );
      navTabsWithSeparators.push(navTabs[i]);
      if (i < navTabs.length - 1) {
        navTabsWithSeparators.push(Separator);
      }
    }

    return <View style={styles.tabContainer}>{navTabsWithSeparators}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 30,
    width: '100%',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: RWBColors.white,
    height: 40,
    width: '100%',
    justifyContent: 'space-evenly',
    alignContent: 'stretch',
  },
  unselected: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  selected: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: RWBColors.magenta,
    paddingBottom: -2,
  },
  unselectedText: {
    color: '#888',
    textAlign: 'center',
  },
  selectedText: {
    color: RWBColors.magenta,
    textAlign: 'center',
  },
  iconContainer: {
    color: RWBColors.magenta,
    width: 16,
    height: 16,
    marginLeft: -2,
    marginRight: 4,
  },
});
