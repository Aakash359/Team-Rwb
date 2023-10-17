import React from 'react';
import {View, StyleSheet, Text, FlatList, TouchableOpacity} from 'react-native';
import globalStyles, {RWBColors} from '../styles';
import ChevronBack from '../../svgs/ChevronBack';
import Attendee from '../attendee_components/Attendee';
import FullscreenSpinner from '../design_components/FullscreenSpinner';
import FooterSpinner from '../design_components/FooterSpinner';
import {rwbApi} from '../../shared/apis/api';

export default class ChallengeParticipantList extends React.Component {
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
          <Text style={[globalStyles.title, {top: 3, marginBottom: 4}]}>
            Participants
          </Text>
          <Text style={globalStyles.titleSubheader}>
            {navigation.getParam('challengeName')}
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
      loading: false,
      challengeId: 0,
      page: 1,
      members: [],
      loadingMore: false,
      canLoadMore:
        this.props.navigation.getParam('participants').length <
        this.props.navigation.getParam('numberOfUsers'),
    };
    this.renderSeparator = this.renderSeparator.bind(this);
  }

  componentDidMount() {
    this.setState({
      members: this.props.navigation.getParam('participants'),
      challengeId: this.props.navigation.getParam('challengeId'),
    });
  }

  loadMoreUsers = () => {
    if (
      !this.state.loadingMore &&
      !this.state.loading &&
      this.state.canLoadMore
    ) {
      this.setState({loadingMore: true});
      rwbApi
        .getChallengeParticipants(this.state.challengeId, this.state.page)
        .then((result) => {
          const page = this.state.page;
          this.setState({
            members: [...this.state.members, ...result.participants],
            loadingMore: false,
            loading: false,
            canLoadMore:
              result.total_count >
              this.state.members.length + result.participants.length,
            page: page + 1,
          });
        });
    }
  };

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
    const {members, challengeName, loading, loadingMore} = this.state;

    return (
      <View style={styles.container}>
        {loading && <FullscreenSpinner />}
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={({item}) => {
            return (
              <Attendee
                user={item}
                isEagleLeader={item.eagle_leader}
                challengeName={challengeName}
              />
            );
          }}
          ItemSeparatorComponent={this.renderSeparator}
          onEndReached={this.loadMoreUsers}
          ListFooterComponent={loadingMore && <FooterSpinner />}
        />
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
});
