import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

import globalStyles, {RWBColors} from '../styles';

import {howLongAgo} from '../../shared/utils/Helpers';
import NavigationService from '../models/NavigationService';
import ReportAndDeleteModal from './ReportAndDeleteModal';
import {userProfile} from '../../shared/models/UserProfile';
import FormattedPostText from './FormattedPostText';
import {rwbApi} from '../../shared/apis/api';

export default class CommentCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deleted: false,
    };
  }

  // only the creator of a post can delete
  canDelete = () => {
    const commenterID = this.props.commenter.id.toString();
    const currentUserID = userProfile.getUserProfile().id.toString();
    return commenterID === currentUserID;
  };

  deleteComment = () => {
    const reactionKind = JSON.stringify({kind: 'comment'});
    rwbApi
      .deleteReaction(
        this.props.posterID,
        this.props.postID,
        reactionKind,
        this.props.commentID,
      )
      .then(() => {
        this.props.handleCommentDeletion();
        this.setState({deleted: true});
      });
  };

  render() {
    const {commenter, time, text} = this.props;
    return !this.state.deleted ? (
      <SafeAreaView style={styles.container}>
        <View style={{flexDirection: 'row', width: '90%'}}>
          <TouchableOpacity
            style={{width: '100%', margin: 0, padding: 0}}
            onPress={() =>
              NavigationService.navigateIntoInfiniteStack(
                'FeedProfileAndEventDetailsStack',
                'profile',
                {id: commenter.id},
              )
            }
            accessibilityRole={'button'}
            accessible={true}
            accessibilityLabel={`Go to ${commenter.first_name} ${commenter.last_name}'s profile`}>
            <View style={styles.userContainer}>
              <Image
                style={[globalStyles.mediumProfileImage, {marginRight: 20}]}
                source={
                  commenter.profile_photo_url
                    ? {uri: commenter.profile_photo_url}
                    : require('../../shared/images/DefaultProfileImg.png')
                }
              />
              <Text style={globalStyles.bodyCopyForm}>
                <Text style={globalStyles.h3}>
                  {commenter.first_name} {commenter.last_name}
                </Text>{' '}
                <Text style={{fontWeight: 'bold'}}>&middot;</Text>{' '}
                {howLongAgo(time)}
                <Text>
                  {this.props.edited && (
                    <Text
                      style={{
                        color: RWBColors.grey20,
                        fontStyle: 'italic',
                      }}>
                      {' '}
                      Edited
                    </Text>
                  )}
                </Text>
              </Text>
            </View>
          </TouchableOpacity>
          <ReportAndDeleteModal
            canDelete={this.canDelete}
            deletePost={this.deleteComment}
            streamID={this.props.postID} // id of the post the comment is on
            posterID={this.props.posterID}
            commentID={this.props.commentID}
            text={text}
            tagged={this.props.tagged}
            type="comment"
            eventStatusPost={false}
            poster={this.props.poster}
            time={time}
            posterText={this.props.posterText}
            posterTagged={this.props.posterTagged}
            posterTime={this.props.posterTime}
            handleLike={this.props.handleLike}
            title={this.props.title}
            verb={this.props.verb}
            eventName={this.props.eventName}
            liked={this.props.liked}
            likeAmount={this.props.likeAmount}
            close={this.props.close}
            index={this.props.index}
          />
        </View>

        <View style={[{marginLeft: 20, marginBottom: 10}]}>
          <FormattedPostText
            text={text}
            linkableUsers={true}
            tagged={this.props.tagged}
          />
        </View>
        {/* Currently unused like/replying */}
        {/* <View
          style={{
            flex: 1,
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              accessibilityRole={'button'}
              accessible={true}
              accessibilityLabel={`Like this post`}>
              <Text>{'<3 Likes'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            accessibilityRole={'button'}
            accessible={true}
            accessibilityLabel={`Reply to ${commenter}'s comment`}>
            <Text>reply</Text>
          </TouchableOpacity>
        </View> */}
      </SafeAreaView>
    ) : null;
  }
}

const styles = StyleSheet.create({
  container: {
    borderBottomColor: RWBColors.grey8,
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingBottom: 40,
    width: '95%',
    marginTop: 10,
  },
  userContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '5%',
    marginBottom: 15,
  },
});
