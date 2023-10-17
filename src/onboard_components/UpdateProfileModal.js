import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Image,
} from 'react-native';
import RWBButton from '../design_components/RWBButton';
import globalStyles, {RWBColors} from '../styles';
import NavigationService from '../models/NavigationService';
import SwipeGesture from '../../swipe-gesture/swipe-gesture';
import {
  NEW_V2,
  NEW_V2_CONTENT,
  NEW_V2_LINK,
  NEW_V2_LINK_TEXT,
  SOCIAL_FEEDS,
  SOCIAL_FEEDS_CONTENT,
  EVENT_CREATION,
  EVENT_CREATION_CONTENT,
  UPDATE_PROFILE,
  UPDATE_PROFILE_CONTENT,
} from '../../shared/constants/OnboardingMessages';
import {rwbApi} from '../../shared/apis/api';
import {getMissingInfoSections} from '../../shared/utils/OnboardingChecks';
import {UPDATED_FEED_VERSION} from '../../shared/constants/OnboardingVersions';

export default class UpdateProfileModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screenNum: 0,
    };
  }

  goToIncompleteSection() {
    // update the current app version, but do not let that stall the update flow
    rwbApi.updateAppVersion(UPDATED_FEED_VERSION);
    this.props.onClose();
    let user = this.props.user;
    let missingSections = getMissingInfoSections(user);
    if (
      !missingSections.militaryComplete ||
      !missingSections.personalComplete ||
      !missingSections.privacyComplete
    )
      this.goToProfile();
  }

  goToProfile() {
    let user = this.props.user;
    NavigationService.navigate('UpdateAccount', {
      value: {
        user: user,
      },
      incomplete: true,
    });
  }

  onSwipePerformed = (action) => {
    /// action : 'left' for left swipe
    /// action : 'right' for right swipe
    switch (action) {
      case 'left': {
        if (this.state.screenNum < 3)
          this.setState({screenNum: this.state.screenNum + 1});
        break;
      }
      case 'right': {
        if (this.state.screenNum > 0)
          this.setState({screenNum: this.state.screenNum - 1});
        break;
      }
      default: {
      }
    }
  };

  render() {
    const {screenNum} = this.state;
    return (
      <SwipeGesture onSwipePerformed={this.onSwipePerformed}>
        <View style={styles.container}>
          <View style={styles.top}>
            {screenNum === 0 ? (
              <View style={styles.topContainer}>
                <Text style={[globalStyles.h1, {textAlign: 'center'}]}>
                  {NEW_V2}
                </Text>
                <Text>{'\n'}</Text>
                <Text style={styles.socialText}>{NEW_V2_CONTENT}</Text>
                <Text>{'\n'}</Text>
                <Text
                  accessible={true}
                  accessibilityLabel={'Link to learn more about V2 of the app'}
                  accessibilityRole={'button'}
                  onPress={() => Linking.openURL(NEW_V2_LINK)}
                  style={[styles.socialText, {color: RWBColors.blue}]}>
                  {NEW_V2_LINK_TEXT}
                </Text>
              </View>
            ) : null}
            {screenNum === 1 ? (
              <View style={styles.topContainer}>
                <Text style={[globalStyles.h1, {textAlign: 'center'}]}>
                  {SOCIAL_FEEDS}
                </Text>
                <Text>{'\n'}</Text>
                <Text style={styles.socialText}>{SOCIAL_FEEDS_CONTENT}</Text>
                <Text>{'\n'}</Text>
                <View style={{height: 250, width: 300}}>
                  <Image
                    style={{
                      flex: 1,
                      width: null,
                      height: null,
                      resizeMode: 'contain',
                    }}
                    source={require('./../../shared/images/UserFeedExample.png')}
                  />
                </View>
              </View>
            ) : null}
            {screenNum === 2 ? (
              <View style={styles.topContainer}>
                <Text style={[globalStyles.h1, {textAlign: 'center'}]}>
                  {EVENT_CREATION}
                </Text>
                <Text>{'\n'}</Text>
                <Text style={styles.socialText}>{EVENT_CREATION_CONTENT}</Text>
                <View style={{height: 250, width: 300}}>
                  <Text>{'\n'}</Text>
                  <Image
                    style={{
                      flex: 1,
                      width: null,
                      height: null,
                      resizeMode: 'contain',
                    }}
                    source={require('./../../shared/images/EventCreationExample.png')}
                  />
                </View>
              </View>
            ) : null}
            {screenNum === 3 ? (
              <View style={styles.topContainer}>
                <Text style={[globalStyles.h1, {textAlign: 'center'}]}>
                  {UPDATE_PROFILE}
                </Text>
                <Text>{'\n'}</Text>
                <Text style={styles.socialText}>{UPDATE_PROFILE_CONTENT}</Text>
                <View style={{height: 250, width: 300}}>
                  <Text>{'\n'}</Text>
                  <Image
                    style={{
                      flex: 1,
                      width: null,
                      height: null,
                      resizeMode: 'contain',
                    }}
                    source={require('./../../shared/images/SocialProfileExample.png')}
                  />
                </View>
              </View>
            ) : null}
          </View>

          <View style={styles.bottom}>
            <View style={styles.bottomContainer}>
              {screenNum !== 3 ? (
                <View
                  style={{
                    flexDirection: 'row',
                  }}>
                  <TouchableOpacity
                    onPress={() => this.setState({screenNum: 0})}>
                    <View
                      style={[
                        styles.dot,
                        {backgroundColor: screenNum === 0 ? 'black' : null},
                      ]}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.setState({screenNum: 1})}>
                    <View
                      style={[
                        styles.dot,
                        {backgroundColor: screenNum === 1 ? 'black' : null},
                      ]}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.setState({screenNum: 2})}>
                    <View
                      style={[
                        styles.dot,
                        {backgroundColor: screenNum === 2 ? 'black' : null},
                      ]}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.setState({screenNum: 3})}>
                    <View style={styles.dot} />
                  </TouchableOpacity>
                </View>
              ) : (
                <RWBButton
                  buttonStyle="primary"
                  text="Continue"
                  onPress={() => this.goToIncompleteSection()}
                />
              )}
            </View>
          </View>
        </View>
      </SwipeGesture>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: RWBColors.white,
    height: 550,
    width: 300,
    borderRadius: 25,
    padding: 25,
    justifyContent: 'space-around',
  },
  socialText: {
    textAlign: 'left',
    color: RWBColors.grey,
    margin: 0,
    padding: 0,
  },
  topContainer: {
    flex: 1,
    width: '95%',
    alignItems: 'center',
  },
  bottomContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'flex-end',
  },
  dot: {
    marginLeft: 5,
    height: 20,
    width: 20,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: 'black',
  },
  bottom: {
    flex: 0.2,
  },
  top: {
    flex: 0.8,
  },
});
