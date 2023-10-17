/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import {
  StyleSheet,
  Animated,
  View,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import RegisterCreateAccount from './src/register_components/RegisterCreateAccountView';
import LoginScreen from './src/login_components/LoginScreen';
import RegisterPersonalInfo from './src/register_components/RegisterPersonalInfoView';
import RegisterSocialProfile from './src/register_components/RegisterSocialProfileView';
import RegisterMilitaryService from './src/register_components/RegisterMilitaryServiceView';
import RegisterPrivacyWaiver from './src/register_components/RegisterPrivacyWaiverView';
import LocationPicker from './src/event_components/LocationPicker';
import MyProfileScreen from './src/profile_components/MyProfileScreen';
import MyNotificationView from './src/design_components/NotificationsView';
import WaiverView from './src/design_components/WaiverView';
import RegisterRedShirt from './src/register_components/RegisterRedShirtView';
import RedShirtSizePicker from './src/register_components/RedShirtSizePicker';
import RegisterGetRedShirt from './src/register_components/RegisterGetRedShirt';
import RegisterOrderConfirmation from './src/register_components/RegisterOrderConfirmation';
import PrivacyPolicyView from './src/design_components/PrivacyPolicyView';
import RegisterVerifyEmail from './src/register_components/RegisterVerifyEmailView';
import CameraRollView from './src/design_components/CameraRollView';
import CameraView from './src/design_components/CameraView';
import ProfilePersonalInfo from './src/profile_components/ProfilePersonalInfo';
import AutoCompleteMelissa from './src/autocomplete_components/AutoCompleteMelissa';
import ProfilePasswordUpdate from './src/profile_components/ProfilePasswordUpdate';
import ProfileDeleteAccount from './src/profile_components/ProfileDeleteAccount';
import ProfileMilitaryService from './src/profile_components/ProfileMilitaryService';
import ProfilePrivacy from './src/profile_components/ProfilePrivacy';
import SplashScreen from './src/design_components/SplashScreen';
import EventView from './src/event_components/EventView';
import EventAttendees from './src/attendee_components/AttendeesView';
import SaveModal from './src/profile_components/SaveModal';
import SizeChart from './src/register_components/SizeChart';
import FeedTab from './src/post_components/FeedTab';
import CreatePostView from './src/post_components/CreatePostView';
import PostView from './src/post_components/PostView';
import NotificationSettingsView from './src/profile_components/NotificationSettingsView';
import ProfileView from './src/profile_components/ProfileView';
import AppSettings from './src/profile_components/AppSettings';
import GroupTab from './src/group_components/GroupTab';
import GroupView from './src/group_components/GroupView';
import GroupMemberList from './src/group_components/GroupMemberList';
import ChallengeTab from './src/challenge_components/ChallengeTab';
import ChallengeDetailView from './src/challenge_components/ChallengeDetailView';
import EventListManager from './src/event_components/EventListManager';
import GroupEventList from './src/group_components/GroupEventList';
import NotificationsView from './src/design_components/NotificationsView';
import ChallengeEventList from './src/challenge_components/ChallengeEventList';
import ChallengeParticipantList from './src/challenge_components/ChallengeParticipantList';
import LeaderboardView from './src/challenge_components/LeaderboardView';
import TrophiesAndBadgesView from './src/profile_components/TrophiesAndBadgesView';
import WorkoutLogView from './src/profile_components/WorkoutLogView';
import BlockedUsersView from './src/profile_components/BlockedUsersView';
import "react-native-get-random-values";

import {notificationController} from './src/NotificationController';

import {RWB_DEEP_LINK_PREFIX} from './shared/constants/URLs';
import {
  logAccessEvents,
  logAccessFeed,
  logAccessMyProfile,
} from './shared/models/Analytics';
import {authentication} from './shared/models/Authentication';
import NavigationService from './src/models/NavigationService';
import messaging from '@react-native-firebase/messaging';
// SVGs
import MyProfileIcon from './svgs/MyProfileIcon';
import EventsIcon from './svgs/EventsIcon';
import HomeIcon from './svgs/HomeIcon';
import ChallengeTabIcon from './svgs/ChallengeTabIcon';
import ChevronBack from './svgs/ChevronBack';
import GroupsIcon from './svgs/GroupsIcon';
import FollowListView from './src/design_components/FollowListView';

import globalStyles, {RWBColors} from './src/styles';
import {rwbApi} from './shared/apis/api';
import {userProfile} from './shared/models/UserProfile';

/*
++++++++++++++++++++++++++++
Outline of the nav routes to show nesting more clearly
This will continue to expand and increase nesting as needed.
The modal nesting is what's confusing.
++++++++++++++++++++++++++++

AppContainer (switchNavigator)
  Splash                    : SplashScreen
  AuthRoot                  : AuthRootStack
    AuthStack               : AuthStack
      Login                 : LoginScreen
      Register              : RegisterCreateAccount
    PrivacyPolicyModal      : PrivacyPolicyView

  VerifyEmail               : RegisterVerifyEmail

  RegisterRoot              : RegisterRootStack
    RegisterSteps           : RegisterStack
      PersonalInfo          : RegisterPersonalInfo
      MilitaryService       : RegisterMilitaryService
      PrivacyWaiver         : RegisterPrivacyWaiver
      RedShirt              : RegisterRedShirt
    WaiverModal             : WaiverView
    RedshirtSizeModal       : RedShirtSizePicker
    RedshirtSizeChart       : SizeChart
    CameralRollModal        : CameraRollView
    CameraModal             : CameraView
    AutoCompleteMelissa     : AutoCompleteMelissa

  AppRoot                   : AppRootStack
    AppHeirarchy            : AppHerarchyStack
      App                   : AppTabs
        Feed                : FeedView
        Groups              : GroupsView
        Events              : EventsListView
        Challenges          : ChallengeView
        MyProfile           : MyProfileScreen
      PasswordUpdate        : ProfilePasswordUpdate
      PersonalInfo          : ProfilePersonalInfo
      MilitaryService       : ProfileMilitaryService
      SaveModal             : SaveModal
      Privacy               : ProfilePrivacy
      BlockedUsers          : BlockedUsersView
      NotificationSettings  : NotificationSettingsView
      Location              : LocationPicker
      EventView             : EventView
      AttendeesView         : AttendeesView
      Notifications         : MyNotificationView
    CreatePost              : CreatePostView
    Post                    : PostView
    CameralRollModal        : CameraRollView
    CameraModal             : CameraView

*/

const STACK_NAVIGATION_STYLING = {
  mode: 'modal',
  transitionSpec: {
    duration: 250,
    timing: Animated.timing,
  },
  screenInterpolator: (sceneProps) => {
    const {position, scene} = sceneProps;
    const {index} = scene;

    const opacity = position.interpolate({
      inputRange: [index - 1, index - 0.99, index],
      outputRange: [0, 0.25, 1],
    });

    return {opacity};
  },
};

const UpdateAccountStack = createStackNavigator(
  {
    PersonalInfo: {
      screen: RegisterPersonalInfo,
      path: 'personal',
      navigationOptions: {
        headerTitleAlign: 'center',
      },
    },
    SocialProfile: {
      screen: RegisterSocialProfile,
      navigationOptions: {
        headerTitleAlign: 'center',
      },
    },
    MilitaryService: {
      screen: RegisterMilitaryService,
      navigationOptions: {
        headerTitleAlign: 'center',
      },
    },
    PrivacyWaiver: {
      screen: RegisterPrivacyWaiver,
      navigationOptions: {
        headerTitleAlign: 'center',
      },
    },
    WaiverModal: {
      screen: WaiverView,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  {
    navigationOptions: {
      gestureEnabled: false,
      headerShown: false,
    },
  },
);

const RegisterStack = createStackNavigator({
  PersonalInfo: {
    screen: RegisterPersonalInfo,
    path: 'personal',
    navigationOptions: {
      headerTitleAlign: 'center',
    },
  },
  SocialProfile: {
    screen: RegisterSocialProfile,
    navigationOptions: {
      headerTitleAlign: 'center',
    },
  },
  MilitaryService: {
    screen: RegisterMilitaryService,
    navigationOptions: {
      headerTitleAlign: 'center',
    },
  },
  PrivacyWaiver: {
    screen: RegisterPrivacyWaiver,
    navigationOptions: {
      headerTitleAlign: 'center',
    },
  },
  RedShirt: RegisterRedShirt,
  GetRedShirt: RegisterGetRedShirt,
  OrderConfirmation: RegisterOrderConfirmation,
});
const RegisterRootStack = createStackNavigator(
  {
    RegisterSteps: {
      screen: RegisterStack,
      navigationOptions: {
        headerShown: false,
      },
    },
    WaiverModal: {
      screen: WaiverView,
      navigationOptions: {
        headerShown: false,
      },
    },
    RedShirtSizeModal: {
      screen: RedShirtSizePicker,
      navigationOptions: {
        headerShown: false,
      },
    },
    RedshirtSizeChart: {
      screen: SizeChart,
      navigationOptions: {
        headerShown: false,
      },
    },
    CameraRollModal: {
      screen: CameraRollView,
      navigationOptions: {
        headerShown: false,
      },
    },
    CameraModal: {
      screen: CameraView,
      navigationOptions: {
        headerShown: false,
      },
    },
    AutoComplete: {
      screen: AutoCompleteMelissa,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  STACK_NAVIGATION_STYLING,
);
const AuthStack = createStackNavigator({
  Login: {
    screen: LoginScreen,
    path: 'wp-login-reset-completed.php',
    navigationOptions: {
      headerShown: false,
    },
  },
  Register: {
    screen: RegisterCreateAccount,
    navigationOptions: {
      headerTitleAlign: 'center',
      // prevent extra spacing on android, while keeping to default iOS height
      headerStatusBarHeight:
        Platform.OS === 'android' ? 0 : StatusBar.currentHeight,
    },
  },
});
const AuthRootStack = createStackNavigator(
  {
    AuthStack: {
      screen: AuthStack,
      navigationOptions: {
        headerShown: false,
      },
    },
    PrivacyPolicyModal: {
      screen: PrivacyPolicyView,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  STACK_NAVIGATION_STYLING,
);

// View and create events
const EventDetailsStack = createStackNavigator(
  {
    // navigate to specific event
    EventView: {
      screen: EventView,
      path: 'events/:id',
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  {
    initialRouteName: 'EventView',
  },
  STACK_NAVIGATION_STYLING,
);
const PostDetailsStack = createStackNavigator(
  {
    PostView: {
      screen: PostView,
      path: 'post/:postID',
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  {
    initialRouteName: 'PostView',
  },
  STACK_NAVIGATION_STYLING,
);
// View profiles
const ProfileDetailsStack = createStackNavigator(
  {
    ProfileView: {
      screen: ProfileView,
      path: 'profile/:profileID',
      navigationOptions: {
        headerShown: false,
      },
    },
    TrophiesAndBadges: {
      screen: TrophiesAndBadgesView,
      navigationOptions: {
        headerTitleAlign: 'center',
      },
    },
  },
  STACK_NAVIGATION_STYLING,
);

const ProfileAndEventDetailsStack = createStackNavigator(
  {
    EventDetailsStack: {
      screen: EventDetailsStack,
      path: '',
      navigationOptions: {
        headerShown: false,
      },
    },
    ProfileDetailsStack: {
      screen: ProfileDetailsStack,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  STACK_NAVIGATION_STYLING,
);

const ProfileAndPostDetailsStack = createStackNavigator(
  {
    PostDetailsStack: {
      screen: PostDetailsStack,
      path: '',
      navigationOptions: {
        headerShown: false,
      },
    },
    ProfileDetailsStack: {
      screen: ProfileDetailsStack,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  STACK_NAVIGATION_STYLING,
);

const EventsStack = createStackNavigator(
  {
    // navigate to the events tab
    EventsScreen: {
      screen: EventListManager,
      path: 'events/',
      navigationOptions: {
        headerShown: false,
      },
    },
    EventsProfileAndEventDetailsStack: {
      screen: ProfileAndEventDetailsStack,
      path: '',
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  STACK_NAVIGATION_STYLING,
);

const AppSettingsStack = createStackNavigator(
  {
    AppSettings: {
      screen: AppSettings,
      navigationOptions: {
        headerTitleAlign: 'center',
      },
    },
    SettingsPersonalInfo: {
      screen: ProfilePersonalInfo,
      navigationOptions: {
        headerTitleAlign: 'center',
      },
    },
    SettingsPasswordUpdate: {
      screen: ProfilePasswordUpdate,
      navigationOptions: {
        headerTitleAlign: 'center',
      },
    },
    SettingsPrivacySettings: {
      screen: ProfilePrivacy,
      navigationOptions: {
        headerTitleAlign: 'center',
      },
    },
    SettingsBlockedUsers: {
      screen: BlockedUsersView,
      navigationOptions: {
        headerTitleAlign: 'center',
      },
    },
    SettingsNotificationSettings: {
      screen: NotificationSettingsView,
      navigationOptions: {
        headerTitleAlign: 'center',
      },
    },
    SettingsLegalWaiver: {
      screen: WaiverView,
      navigationOptions: {
        headerShown: false,
        cardStyle: 'modal',
      },
    },
    SettingsDeleteAccount: {
      screen: ProfileDeleteAccount,
      navigationOptions: {
        headerTitleAlign: 'center',
      },
    },
    SettingsPrivacyPolicyModal: {
      screen: PrivacyPolicyView,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  {
    initialRouteName: 'AppSettings',
  },
  STACK_NAVIGATION_STYLING,
);

const MyProfileStack = createStackNavigator(
  {
    MyProfile: {
      screen: MyProfileScreen,
      navigationOptions: {
        headerShown: false,
      },
    },
    MyProfileMilitaryService: {
      screen: ProfileMilitaryService,
      navigationOptions: {
        headerTitleAlign: 'center',
      },
    },
    MyProfileProfileAndEventDetailsStack: {
      screen: ProfileAndEventDetailsStack,
      navigationOptions: {
        headerShown: false,
      },
    },
    AppSettingsStack: {
      screen: AppSettingsStack,
      navigationOptions: {
        headerShown: false,
      },
    },
    MyProfileWorkoutLog: {
      screen: WorkoutLogView,
      navigationOptions: {
        headerTitleAlign: 'center',
      },
    },
    TrophiesAndBadges: {
      screen: TrophiesAndBadgesView,
      navigationOptions: {
        headerTitleAlign: 'center',
      },
    },
  },
  STACK_NAVIGATION_STYLING,
);
const FeedStack = createStackNavigator({
  Feed: {
    screen: FeedTab,
    navigationOptions: {
      headerShown: false,
    },
  },
  Notifications: {
    screen: MyNotificationView,
    navigationOptions: {
      headerTitleAlign: 'center',
    },
  },
  FeedProfileAndEventDetailsStack: {
    screen: ProfileAndEventDetailsStack,
    navigationOptions: {
      headerShown: false,
    },
  },
  FeedProfileAndPostDetailsStack: {
    screen: ProfileAndPostDetailsStack,
    navigationOptions: {
      headerShown: false,
    },
  },
});
const GroupStack = createStackNavigator({
  GroupsTab: {
    screen: GroupTab,
    path: 'groups/:groupID?',
    navigationOptions: {
      headerShown: false,
    },
  },
  GroupView: {
    screen: GroupView,
    navigationOptions: {
      headerShown: false,
    },
  },
  GroupProfileAndEventDetailsStack: {
    screen: ProfileAndEventDetailsStack,
    navigationOptions: {
      headerShown: false,
    },
  },
  GroupMemberList: {
    screen: GroupMemberList,
    navigationOptions: {
      headerShown: true,
      headerTitleAlign: 'center',
    },
  },
  GroupEventList: {
    screen: GroupEventList,
    navigationOptions: {
      headerShown: false,
    },
  },
});
const ChallengeStack = createStackNavigator({
  ChallengesTab: {
    screen: ChallengeTab,
    path: 'challenges/:challengeID?/:events?/:tab?',
    navigationOptions: {
      headerShown: false,
    },
  },
  ChallengeView: {
    screen: ChallengeDetailView,
    navigationOptions: {
      headerShown: false,
    },
  },
  ChallengeEventList: {
    screen: ChallengeEventList,
    navigationOptions: {
      headerTitleAlign: 'center',
    },
  },
  ChallengeProfileAndEventDetailsStack: {
    screen: ProfileAndEventDetailsStack,
    navigationOptions: {
      headerShown: false,
    },
  },
  ChallengeParticipantList: {
    screen: ChallengeParticipantList,
    navigationOptions: {
      headerTitleAlign: 'center',
    },
  },
  ChallengeLeaderboardStack: {
    screen: LeaderboardView,
    navigationOptions: {
      headerTitleAlign: 'center',
    },
  },
});
MyProfileStack.navigationOptions = ({navigation}) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) tabBarVisible = false;
  return {tabBarVisible};
};
FeedStack.navigationOptions = ({navigation}) => {
  let tabBarVisible = true;
  const routes = navigation.state.routes;
  if (routes[routes.length - 1]?.routeName === 'Notifications')
    tabBarVisible = false;
  return {tabBarVisible};
};
ChallengeStack.navigationOptions = ({navigation}) => {
  let tabBarVisible = true;
  const routes = navigation.state.routes;
  if (
    routes[routes.length - 1]?.routeName === 'ChallengeLeaderboardStack' ||
    routes[routes.length - 1]?.routeName === 'ChallengeParticipantList'
  )
    tabBarVisible = false;
  return {tabBarVisible};
};
// for deep linking setup, ensure the stack is set as the screen and the default path is empty
const AppTabs = createBottomTabNavigator(
  {
    Feed: FeedStack,
    Groups: {
      screen: GroupStack,
      path: '',
    },
    Events: {
      screen: EventsStack,
      path: '',
      navigationOptions: ({navigation}) => ({
        tabBarVisible:
          navigation.state.routes[navigation.state.index].routeName !==
          'EventsMyEvents',
      }),
    },
    Challenges: {
      screen: ChallengeStack,
      path: '',
    },
    'My Profile': MyProfileStack,
  },
  {
    defaultNavigationOptions: ({navigation}) => ({
      tabBarIcon: ({focused, horizontal, tintColor}) => {
        const {routeName} = navigation.state;
        if (routeName === 'Feed')
          return (
            <HomeIcon
              filledIcon={focused}
              tintColor={focused ? RWBColors.magenta : RWBColors.grey80}
              style={styles.tabIcon}
            />
          );
        else if (routeName === 'Events')
          return (
            <EventsIcon
              filledIcon={focused}
              tintColor={focused ? RWBColors.magenta : RWBColors.grey80}
              style={styles.tabIcon}
            />
          );
        else if (routeName === 'Groups')
          return (
            <GroupsIcon
              filledIcon={focused}
              tintColor={focused ? RWBColors.magenta : RWBColors.grey80}
              style={styles.tabIcon}
            />
          );
        else if (routeName === 'Challenges') {
          return (
            <ChallengeTabIcon
              filledIcon={focused}
              tintColor={focused ? RWBColors.magenta : RWBColors.grey80}
              style={styles.tabIcon}
            />
          );
        } else if (routeName === 'My Profile')
          return (
            <MyProfileIcon
              filledIcon={focused}
              tintColor={focused ? RWBColors.magenta : RWBColors.grey80}
              style={styles.tabIcon}
            />
          );
      },
      tabBarOnPress: ({navigation, defaultHandler}) => {
        const {
          state: {routeName},
        } = navigation;

        if (routeName === 'Feed') logAccessFeed();
        else if (routeName === 'Events') logAccessEvents();
        else if (routeName === 'My Profile') logAccessMyProfile();

        return defaultHandler();
      },
    }),
    tabBarOptions: {
      activeTintColor: RWBColors.magenta,
      inactiveTintColor: RWBColors.grey80,
      style: {backgroundColor: RWBColors.grey5},
      allowFontScaling: false,
    },
  },
);

const AppHeirarchyStack = createStackNavigator(
  {
    App: {
      screen: AppTabs,
      path: '',
    },
    ProfilePersonalInfo: ProfilePersonalInfo,
    PasswordUpdate: ProfilePasswordUpdate,
    MilitaryService: ProfileMilitaryService,
    Privacy: ProfilePrivacy,
    LocationPicker: LocationPicker,
    EventAttendees: EventAttendees,
    CreatePost: CreatePostView,
    Notifications: NotificationsView,
    Post: {
      screen: PostView,
      // path: 'post/:postID', // will need some thought for deep linking
      navigationOptions: {
        headerShown: false,
      },
    },
    FollowList: {
      screen: FollowListView,
      navigationOptions: {
        headerShown: false,
      },
    },
    BlockedUsers: BlockedUsersView,
    NotificationSettings: NotificationSettingsView,
    UpdateAccount: UpdateAccountStack,
  },
  {
    defaultNavigationOptions: ({navigation}) => {
      const {routeName} = navigation.state;
      if (routeName === 'App') {
        return {headerShown: false};
      } else {
        return {
          // view-specific header config is in its respective file.
          headerStyle: {backgroundColor: RWBColors.magenta},
          headerTintColor: RWBColors.white,
          headerLeft: () => (
            <TouchableOpacity
              style={globalStyles.backButton}
              onPress={() => navigation.goBack()}
              accessibilityRole={'button'}
              accessible={true}
              accessibilityLabel={'Go Back'}>
              <ChevronBack style={globalStyles.chevronBackImage} />
            </TouchableOpacity>
          ),
        };
      }
    },
    navigationOptions: {
      headerShown: false,
    },
  },
);
const AppRootStack = createStackNavigator(
  {
    AppHeirarchy: {
      screen: AppHeirarchyStack,
      path: '',
      navigationOptions: {
        headerShown: false,
      },
    },
    AppAutoComplete: {
      screen: AutoCompleteMelissa,
      navigationOptions: {
        headerShown: false,
      },
    },
    CameraModal: {
      screen: CameraView,
      navigationOptions: {
        headerShown: false,
      },
    },
    CameraRollModal: {
      screen: CameraRollView,
      navigationOptions: {
        headerShown: false,
      },
    },
    SaveModal: {
      screen: SaveModal,
      navigationOptions: {
        headerShown: false,
      },
    },
    PersonalInfo: {
      screen: RegisterPersonalInfo,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  STACK_NAVIGATION_STYLING,
);

const MainNavigation = createSwitchNavigator(
  {
    Splash: SplashScreen,
    AuthRoot: AuthRootStack,
    VerifyEmail: {
      screen: RegisterVerifyEmail,
      path: 'verify',
    },
    RegisterRoot: RegisterRootStack,
    AppRoot: {
      screen: AppRootStack,
      path: '',
    },
  },
  {
    paths: [''],
  },
);

const previousGetActionForPathAndParams =
  MainNavigation.router.getActionForPathAndParams;

Object.assign(MainNavigation.router, {
  getActionForPathAndParams(path, params) {
    const accessToken = authentication.getAccessTokenSync();
    // check if user is logged in
    if (!accessToken) {
      // redirect to splash screen
      return NavigationService.navigate('Splash', {...params, path});
    } else {
      return previousGetActionForPathAndParams(path, params);
    }
  },
});

const AppContainer = createAppContainer(MainNavigation);
notificationController.init();

export default class App extends Component {
  render() {
    return (
      <View style={{flex: 1}}>
        <AppContainer
          ref={(appContainer) => {
            NavigationService.initializeTopLevelNavigator(appContainer);
          }}
          uriPrefix={RWB_DEEP_LINK_PREFIX}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 24,
    height: 24,
  },
});
