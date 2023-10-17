import React from 'react';
import {Text, StyleSheet, View, TouchableOpacity, FlatList} from 'react-native';
import globalStyles from '../styles';
import RankingRow from './RankingRow';

export default class CompressedLeaderboard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {data, metric} = this.props;

    return (
      <View style={styles.leaderboardContainer}>
        <Text style={[globalStyles.h2, {marginBottom: 5}]}>Leaderboard</Text>
        <FlatList
          data={data}
          renderItem={({item}) => (
            <RankingRow
              key={item.id}
              place={item.rank}
              ignoreEmphasis={false}
              metric={metric}
              progress={item.score}
              user={item.user}
            />
          )}
          scrollEnabled={false}
        />
        <TouchableOpacity onPress={this.props.seeMore}>
          <Text style={[globalStyles.h7, {alignSelf: 'center', marginTop: 15}]}>
            See More
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  leaderboardContainer: {
    flex: 1,
  },
  detailBlock: {
    marginBottom: 15,
  },
});
