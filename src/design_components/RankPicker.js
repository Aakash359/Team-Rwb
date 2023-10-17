import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import RWBButton from './RWBButton';

import globalStyles, {RWBColors} from '../styles';

import {
  ARMY_ENLISTED,
  ARMY_WARRANT,
  ARMY_OFFICER,
  MARINES_ENLISTED,
  MARINES_WARRANT,
  MARINES_OFFICER,
  NAVY_ENLISTED,
  NAVY_WARRANT,
  NAVY_OFFICER,
  AIRFORCE_ENLISTED,
  AIRFORCE_OFFICER,
  COASTGUARD_ENLISTED,
  COASTGUARD_WARRANT,
  COASTGUARD_OFFICER,
} from '../../shared/constants/military/ranks';

const CONTENT_HEIGHT = 40;
const SEPARATOR_HEIGHT = 1;
const TOTAL_HEIGHT = CONTENT_HEIGHT + SEPARATOR_HEIGHT;

export default class RankPicker extends Component {
  constructor(props) {
    super(props);
    let rankList = [];
    if (props.branch === 'Air Force') {
      rankList = Object.entries(AIRFORCE_ENLISTED).concat(
        Object.entries(AIRFORCE_OFFICER),
      );
    } else if (props.branch === 'Army') {
      rankList = Object.entries(ARMY_ENLISTED)
        .concat(Object.entries(ARMY_WARRANT))
        .concat(Object.entries(ARMY_OFFICER));
    } else if (props.branch === 'Coast Guard') {
      rankList = Object.entries(COASTGUARD_ENLISTED)
        .concat(Object.entries(COASTGUARD_WARRANT))
        .concat(Object.entries(COASTGUARD_OFFICER));
    } else if (props.branch === 'Marine Corps') {
      rankList = Object.entries(MARINES_ENLISTED)
        .concat(Object.entries(MARINES_WARRANT))
        .concat(Object.entries(MARINES_OFFICER));
    } else if (props.branch === 'Navy') {
      rankList = Object.entries(NAVY_ENLISTED)
        .concat(Object.entries(NAVY_WARRANT))
        .concat(Object.entries(NAVY_OFFICER));
    } else {
      console.error('No branch prop.');
    }
    this.rankList = rankList;
  }

  render() {
    const {selectRank} = this.props;
    const {rankList} = this;
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
              Rank
            </Text>
            <FlatList
              style={{flex: 0}}
              initialNumToRender={rankList.length}
              data={rankList}
              renderItem={({item, index, separators}) => {
                const [rank_code, rank_name] = item;
                return (
                  <TouchableOpacity
                    style={{
                      height: CONTENT_HEIGHT,
                      paddingLeft: 10,
                      justifyContent: 'center',
                      borderBottomWidth: SEPARATOR_HEIGHT,
                      borderBottomColor: RWBColors.grey8,
                    }}
                    onPress={() => selectRank(rank_name)}>
                    <Text style={globalStyles.bodyCopyForm}>
                      {`${rank_code}: ${rank_name}`}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => {
                const [rank_code, rank_name] = item;
                return rank_code;
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
                onPress={() => selectRank()}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}
