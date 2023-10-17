import React, {PureComponent} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';

import {SHIRTSIZE_DATA} from '../../shared/constants/ShirtSizeData';

import globalStyles, {RWBColors} from '../styles';

class SizeChartTableRow extends PureComponent {
  render() {
    const {cells, type} = this.props;
    let contents = cells.map((cell) => {
      return (
        <View
          style={[
            styles.tableCell,
            type === 'legend' ? {backgroundColor: RWBColors.grey8} : {},
          ]}>
          <Text
            style={
              type === 'header'
                ? globalStyles.h3
                : [globalStyles.h6, {paddingBottom: 0}]
            }>
            {cell}
          </Text>
        </View>
      );
    });
    return <View style={styles.tableRow}>{contents}</View>;
  }
}

export default class SizeChartTable extends PureComponent {
  renderSeperator() {
    return (
      <View
        style={{
          borderBottomColor: RWBColors.grey8,
          borderBottomWidth: 1,
          width: '100%',
          height: 0,
        }}
      />
    );
  }

  render() {
    return (
      <View style={styles.table}>
        <Text style={[globalStyles.h2, {textAlign: 'center', height: 25}]}>
          Size Chart
        </Text>
        <FlatList
          style={styles.table}
          data={SHIRTSIZE_DATA}
          initialNumToRender={SHIRTSIZE_DATA.length}
          keyExtractor={(item, index) => {
            return index.toString(10);
          }}
          renderItem={({item, index, separators}) => {
            return (
              <View style={styles.tableRow}>
                <SizeChartTableRow type={item.type} cells={item.cells} />
              </View>
            );
          }}
          ItemSeparatorComponent={this.renderSeperator}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  table: {
    flex: 1,
    width: '105%',
    left: '-2.5%',
  },
  tableRow: {
    height: 40,
    flex: 1,
    flexDirection: 'row',
  },
  tableCell: {
    flex: 1,
    paddingLeft: 12,
    flexDirection: 'column',
    justifyContent: 'center',
  },
});
