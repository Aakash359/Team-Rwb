import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

import globalStyles, {RWBColors} from '../styles';
import FilterIcon from '../../svgs/FilterIcon';
import CalendarIcon from '../../svgs/CalenderIcon';

export default class EventFilterPill extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View
        style={
          this.props.text === 'Hide Virtual'
            ? {marginRight: Dimensions.get('window').width * 0.1 - 6}
            : null
        }>
        <TouchableOpacity
          style={[
            styles.pill,
            this.props.active ? styles.active : styles.unactive,
          ]}
          onPress={() => this.props.onPress()}
          accessibilityRole={'button'}
          accessible={true}
          accessibilityLabel={this.props.accessibilityLabel}
          accessibilityHint={this.props.accessibilityHint}>
          {/* TODO SVGs on left, X svg on right */}
          {this.props.count ? (
            <View style={styles.filterCountBackground}>
              <Text style={globalStyles.filterCounter}>{this.props.count}</Text>
            </View>
          ) : (
            [
              null,
              this.props.text === 'Filters' && (
                <FilterIcon
                  key={0}
                  style={{width: 14, height: 14, marginRight: 6}}
                />
              ),
              this.props.text === 'My Events' && (
                <CalendarIcon
                  key={1}
                  tintColor={RWBColors.grey80}
                  style={{width: 14, height: 14, marginRight: 6}}
                />
              ),
            ]
          )}
          <Text
            style={
              this.props.active
                ? [globalStyles.bodyCopyForm, styles.active]
                : globalStyles.bodyCopyForm
            }>
            {this.props.text}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  pill: {
    height: 30,
    paddingHorizontal: 10,
    borderColor: RWBColors.grey20,
    borderWidth: 1,
    borderRadius: 15,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    flexDirection: 'row',
  },
  active: {
    color: RWBColors.white,
    backgroundColor: RWBColors.navy,
    borderColor: RWBColors.navy,
  },
  unactive: {
    color: RWBColors.grey80,
    backgroundColor: RWBColors.white,
  },
  filterCountBackground: {
    backgroundColor: RWBColors.white,
    height: 12,
    width: 14,
    borderRadius: 3,
    alignItems: 'center',
    marginRight: 6,
  },
});
