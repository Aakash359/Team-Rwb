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

import {ARMY_MOS_ARR} from '../../shared/constants/military/mosCodes';

const CONTENT_HEIGHT = 40;
const SEPARATOR_HEIGHT = 1;
const TOTAL_HEIGHT = CONTENT_HEIGHT + SEPARATOR_HEIGHT;

export default class MOSPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {selectMOS} = this.props;
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
              Specialty
            </Text>
            <FlatList
              data={ARMY_MOS_ARR}
              renderItem={({item, index, separators}) => {
                const [mos_code, mos_name] = item;
                return (
                  <View>
                    <TouchableOpacity
                      style={{
                        height: CONTENT_HEIGHT,
                        paddingLeft: 10,
                        justifyContent: 'center',
                        borderBottomWidth: SEPARATOR_HEIGHT,
                        borderBottomColor: RWBColors.grey8,
                      }}
                      onPress={() => selectMOS(mos_name)}>
                      <Text style={globalStyles.bodyCopyForm}>
                        {`${mos_code}: ${mos_name}`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
              keyExtractor={(item, index) => {
                const [mos_code, mos_name] = item;
                return mos_code;
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
                onPress={() => selectMOS()}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}
