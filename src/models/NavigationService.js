/**
 * NavigationService implements this.props.navigation.navigate
 * and similar methods in a functional manner. This allows
 * arbitrary navigation calls to happen from arbitrary places
 * in code, as well as the definition of convenience functions.
 *
 * Use this module instead of this.props.navigation.navigate
 * wherever possible.
 *
 * See: https://reactnavigation.org/docs/en/navigating-without-navigation-prop.html
 */

'use strict';

import {NavigationActions, StackActions} from 'react-navigation';

// Capture navigator reference from top-level component.
let _navigator;

function initializeTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

// Navigation function defs
function navigate(routeName, params) {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    }),
  );
}

/**
 * Navigate into the event-profile infinite stack.
 * @param {string} topRoute - Name of the sub-navigator the bottom-tab navigator owns.
 * @param {string} firstLayer - 'event' or 'profile', the desired screen to navigate into.
 * @param {object} params - navigation params to feed Event screen
 */
function navigateIntoInfiniteStack(topRoute, firstLayer, params) {
  const ALLOWED_ROUTES = [
    'EventsProfileAndEventDetailsStack',
    'MyProfileProfileAndEventDetailsStack',
    'FeedProfileAndEventDetailsStack',
    'GroupProfileAndEventDetailsStack',
    'ChallengeProfileAndEventDetailsStack',
  ];
  if (!ALLOWED_ROUTES.includes(topRoute)) {
    console.error(
      'topRoute must be one of: ',
      ALLOWED_ROUTES,
      '\ngot: ',
      topRoute,
    );
    throw new Error(
      'navigateIntoInfiniteStack called with non-allowed top route.',
    );
  }
  const ALLOWED_LAYERS = ['event', 'profile', 'group'];
  if (!ALLOWED_LAYERS.includes(firstLayer)) {
    console.error(
      'firstLayer must be one of: ',
      ALLOWED_LAYERS,
      '\ngot: ',
      firstLayer,
    );
    throw new Error(
      'navigateIntoInfinite called with non-allowed first layer.',
    );
  }

  const firstLayerPicker = (layer) => {
    return `${layer
      .slice(0, 1)
      .toUpperCase()
      .concat(layer.slice(1, layer.length))}View`;
  };

  const thirdNav = NavigationActions.navigate({
    routeName: firstLayerPicker(firstLayer),
    params,
  });
  const secondNav = NavigationActions.navigate({
    routeName:
      firstLayer === 'event' ? 'EventDetailsStack' : 'ProfileDetailsStack',
    action: thirdNav,
  });
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName: topRoute,
      action: secondNav,
    }),
  );
}

function push(routeName, params) {
  _navigator.dispatch(
    StackActions.push({
      routeName,
      params,
    }),
  );
}

function back() {
  _navigator.dispatch(NavigationActions.back());
}

function popStack() {
  _navigator.dispatch(StackActions.pop());
}

function popToTop() {
  _navigator.dispatch(StackActions.popToTop());
}

// https://github.com/react-navigation/react-navigation/issues/962#issuecomment-419632238
function getCurrentScreenName() {
  let route = _navigator.state.nav; // contains navInfo all the routes and the index (the current route)
  // go through the nested route of the index until at the end of the line
  // example flow (dealing with local notifications): App Route > Events > EventsProfileAndEventDetailsStack > EventDetailsStack > EventView
  while (route.routes) {
    route = route.routes[route.index];
  }
  return route.routeName;
}

function getCurrentTab() {
  let route = _navigator.state.nav; // contains navInfo all the routes and the index (the current route)
  // go through the nested route of the index until at the route name and key match, getting the active tab
  while (route.routes) {
    route = route.routes[route.index];
    if (route.key === route.routeName && route.key !== 'AppRoot') break;
  }
  return route.routeName;
}

export default {
  navigate,
  initializeTopLevelNavigator,
  push,
  back,
  popStack,
  navigateIntoInfiniteStack,
  popToTop,
  getCurrentScreenName,
  getCurrentTab,
};
