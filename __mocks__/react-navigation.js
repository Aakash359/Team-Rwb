import React from 'react';
import { createComponent } from './utils/createComponent';
const AppContainer = createComponent('AppContainer');
const NavMock = {
  router: {
    getActionForPathAndParams: () => ({})
  }
};



export const createSwitchNavigator = (props) => (Object.assign({}, NavMock, props));
export const createStackNavigator = (props) => (Object.assign({}, NavMock, props));
export const createAppContainer = (props) => (AppContainer);
export const createBottomTabNavigator = (props) => (Object.assign({}, NavMock, props));
export const withNavigation = (props) => (Object.assign({}, NavMock, props));
export const NavigationEvents = createComponent('NavigationEvents');
export const SafeAreaView = createComponent('SafeAreaView');
