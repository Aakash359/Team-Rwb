import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import RWBButton from './RWBButton';

import globalStyles, {RWBColors} from '../styles';
import {generateYears, generateDays} from '../../shared/utils/Helpers';
import {months, days} from '../../shared/constants/MonthsAndDays';
const CONTENT_HEIGHT = 40;
const SEPARATOR_HEIGHT = 1;
const TOTAL_HEIGHT = CONTENT_HEIGHT + SEPARATOR_HEIGHT;

class militaryMonthPicker extends React.Component {
  constructor(props) {
    super(props);
    this.months = months;
  }

  render() {
    const {selectMonth} = this.props;
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#FFFB'}}>
        <View
          style={[
            globalStyles.scrollArea,
            globalStyles.modalWindow,
            {backgroundColor: '#0008'},
          ]}>
          <View style={{flex: 1, backgroundColor: RWBColors.white}}>
            <Text
              style={[
                globalStyles.h2,
                {paddingBottom: 12, paddingTop: 12, textAlign: 'center'},
              ]}>
              Month
            </Text>
            <FlatList
              style={{flex: 0}}
              initialNumToRender={this.months.length}
              data={this.months}
              renderItem={({item, index, separators}) => {
                return (
                  <TouchableOpacity
                    style={{
                      height: CONTENT_HEIGHT,
                      paddingLeft: 10,
                      justifyContent: 'center',
                      borderBottomWidth: SEPARATOR_HEIGHT,
                      borderBottomColor: RWBColors.grey8,
                    }}
                    onPress={() => selectMonth(item)}>
                    <Text style={globalStyles.bodyCopyForm}>{`${item}`}</Text>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => {
                return item;
              }}
              getItemLayout={(data, index) => ({
                length: TOTAL_HEIGHT,
                offset: TOTAL_HEIGHT * index,
                index,
              })}
            />
            <View style={globalStyles.fixedFooter}>
              <RWBButton
                buttonStyle="secondary"
                text="Cancel"
                onPress={() => selectMonth()}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

class militaryDayPicker extends React.Component {
  constructor(props) {
    super(props);
    this.days = days;
  }

  render() {
    const {selectDay} = this.props;
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#FFFB'}}>
        <View
          style={[
            globalStyles.scrollArea,
            globalStyles.modalWindow,
            {backgroundColor: '#0008'},
          ]}>
          <View style={{flex: 1, backgroundColor: RWBColors.white}}>
            <Text
              style={[
                globalStyles.h2,
                {paddingBottom: 12, paddingTop: 12, textAlign: 'center'},
              ]}>
              Day
            </Text>
            <FlatList
              data={this.days}
              style={{flex: 0}}
              initialNumToRender={this.days.length}
              renderItem={({item, index, separators}) => {
                return (
                  <TouchableOpacity
                    style={{
                      height: CONTENT_HEIGHT,
                      paddingLeft: 10,
                      justifyContent: 'center',
                      borderBottomWidth: SEPARATOR_HEIGHT,
                      borderBottomColor: RWBColors.grey8,
                    }}
                    onPress={() => selectDay(item)}>
                    <Text style={globalStyles.bodyCopyForm}>{`${item}`}</Text>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => {
                return item;
              }}
              getItemLayout={(data, index) => ({
                length: TOTAL_HEIGHT,
                offset: TOTAL_HEIGHT * index,
                index,
              })}
            />
            <View style={globalStyles.fixedFooter}>
              <RWBButton
                buttonStyle="secondary"
                text="Cancel"
                onPress={() => selectDay()}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

class militaryYearPicker extends React.Component {
  constructor(props) {
    super(props);
    this.years = generateYears();
  }

  render() {
    const {selectYear} = this.props;
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#FFFB'}}>
        <View
          style={[
            globalStyles.scrollArea,
            globalStyles.modalWindow,
            {backgroundColor: '#0008'},
          ]}>
          <View style={{flex: 1, backgroundColor: RWBColors.white}}>
            <Text
              style={[
                globalStyles.h2,
                {paddingBottom: 12, paddingTop: 12, textAlign: 'center'},
              ]}>
              Year
            </Text>
            <FlatList
              style={{flex: 0}}
              initialNumToRender={this.years.length}
              data={this.years}
              renderItem={({item, index, separators}) => {
                return (
                  <TouchableOpacity
                    style={{
                      height: CONTENT_HEIGHT,
                      paddingLeft: 10,
                      justifyContent: 'center',
                      borderBottomWidth: SEPARATOR_HEIGHT,
                      borderBottomColor: RWBColors.grey8,
                    }}
                    onPress={() => selectYear(item)}>
                    <Text style={globalStyles.bodyCopyForm}>{`${item}`}</Text>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => {
                return item;
              }}
              getItemLayout={(data, index) => ({
                length: TOTAL_HEIGHT,
                offset: TOTAL_HEIGHT * index,
                index,
              })}
            />
            <View style={globalStyles.fixedFooter}>
              <RWBButton
                buttonStyle="secondary"
                text="Cancel"
                onPress={() => selectYear()}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

export {militaryMonthPicker, militaryDayPicker, militaryYearPicker};
