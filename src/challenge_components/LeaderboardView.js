import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import globalStyles, {RWBColors} from '../styles';
import ChevronBack from '../../svgs/ChevronBack';
import {rwbApi} from '../../shared/apis/api';
import RankingRow from './RankingRow';

export default class LeaderboardView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerStyle: {
        backgroundColor: RWBColors.magenta,
      },
      headerTintColor: RWBColors.white,
      headerLeft: () => (
        <TouchableOpacity
          style={globalStyles.headerSave}
          onPress={() => {
            navigation.goBack();
          }}
          accessibilityRole={'button'}
          accessible={true}
          accessibilityLabel={'Go Back'}>
          <ChevronBack style={globalStyles.chevronBackImage} />
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <View style={styles.headerBar}>
          <Text style={[globalStyles.title, {top: 3, marginBottom: 4}]}>
            Leaderboard
          </Text>
          <Text style={globalStyles.titleSubheader}>
            {navigation.getParam('challengeName')}
          </Text>
        </View>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      leaderboard: [],
      metric: '',
    };
  }

  componentDidMount() {
    const rank = this.props.navigation.getParam('rank', 0);
    this.setState({
      metric: this.props.navigation.getParam('metric'),
      leaderboard: this.props.navigation.getParam('data', []),
    });
    if (rank > 25) {
      this.loadLeaderboard();
    }
  }

  loadLeaderboard = () => {
    this.setState({loading: true});
    return rwbApi
      .getLeaderboardCentered(this.props.navigation.getParam('challengeId'))
      .then((result) => {
        this.setState({leaderboard: result.data});
      })
      .catch((err) => {
        Alert.alert('Team RWB', 'Error Loading Leaderboard Centered 25');
      })
      .finally(() => {
        this.setState({loading: false});
      });
  };

  render() {
    const {loading, leaderboard, metric} = this.state;
    return (
      <View style={styles.container}>
        {loading && (
          <View style={globalStyles.spinnerOverLay}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <View style={styles.listContainer}>
          <FlatList
            style={{paddingVertical: 10}}
            data={leaderboard}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => (
              <RankingRow
                user={item.user}
                progress={item.score}
                place={item.rank}
                metric={metric}
                ignoreEmphasis={false}
              />
            )}
            initialNumToRender={leaderboard.length}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RWBColors.white,
  },
  headerBar: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 5,
  },
  listContainer: {
    flex: 1,
    alignItems: 'stretch',
    width: '100%',
    backgroundColor: RWBColors.white,
    paddingHorizontal: 20,
  },
});
