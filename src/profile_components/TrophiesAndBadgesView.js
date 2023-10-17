import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';

import globalStyles, {RWBColors} from '../styles';
import ChevronBack from '../../svgs/ChevronBack';
import moment from 'moment';
import {PROFILE_TAB_LABELS} from '../../shared/constants/Labels';

const numberOfColumns = 3;

export default class TrophiesAndBadgesView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
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
          <Text style={globalStyles.title}>
            {PROFILE_TAB_LABELS.CHALLENGE_BADGES}
          </Text>
        </View>
      ),
      headerStyle: {
        backgroundColor: RWBColors.magenta,
      },
      headerTintColor: RWBColors.white,
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      badges: this.props.navigation.getParam('badges', []),
    };
  }

  renderSeparator() {
    return (
      <View
        style={{
          height: 0,
          width: '100%',
          borderBottomWidth: 1,
          borderBottomColor: RWBColors.grey8,
        }}
      />
    );
  }

  render() {
    const {badges} = this.state;
    return (
      <View style={styles.container}>
        <FlatList
          ListHeaderComponent={<></>}
          style={styles.listContainer}
          data={badges}
          numColumns={numberOfColumns}
          keyExtractor={(item, index) => item.name}
          renderItem={({item}) => (
            <View style={styles.badgeContainer}>
              <Image style={styles.badgeImage} source={{uri: item.image_url}} />
              <View style={{marginTop: 5}}>
                <Text style={styles.earnedDateText}>
                  {moment(item.received_datetime).format('MM/DD/YYYY')}
                </Text>
              </View>
            </View>
          )}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  listContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: RWBColors.white,
    paddingVertical: 5,
  },
  badgeContainer: {
    flex: 1 / numberOfColumns,
    alignItems: 'center',
    paddingVertical: 10,
  },
  earnedDateText: {
    fontFamily: 'OpenSans-Semibold',
    fontSize: 12,
    color: RWBColors.grey80,
  },
  badgeImage: {
    height: 110,
    width: 110,
    borderRadius: 55,
  },
});
