import {Linking} from 'react-native';
import NavigationService from '../../src/models/NavigationService';
import {logAccessEventDetails} from '../models/Analytics';

export function handleInitialURL() {
  Linking.getInitialURL().then((url) => {
    if (url) {
      if (url.includes('challenges') && url.includes('events')) {
        let id = url.split('challenges/')[1];
        NavigationService.navigate('ChallengesTab', {
          challengeID: id,
        });
      } else if (url.includes('events')) {
        const id = url.split('events/')[1];
        if (id && id !== '/') {
          logAccessEventDetails();
          NavigationService.navigate('EventsScreen', {eventId: id});
        } else {
          NavigationService.navigate('EventsScreen');
        }
      } else if (url.includes('challenges')) {
        let id = url.split('challenges/')[1];
        if (id && id !== '/') {
          // truncate trailing parameter (e.g. valor-challenge:
          // DOMAIN/challenges/23?_ga=$GoogleAnalyticsParmeter)
          if (id.includes('?')) {
            id = id.split('?')[0];
          }
          NavigationService.navigate('ChallengesTab', {
            challengeID: id,
          });
        } else {
          NavigationService.navigate('ChallengesTab');
        }
      } else if (url.includes('groups')) {
        const id = url.split('groups/')[1];
        if (id && id !== '/') {
          NavigationService.navigate('GroupsTab', {groupID: id});
        } else {
          NavigationService.navigate('GroupsTab');
        }
      }
    }
  });
}
