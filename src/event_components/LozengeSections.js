import React, {Component} from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import {capitalizeFirstLetter} from '../../shared/utils/Helpers';
import EventFilterPill from './EventFilterPill';
import {
  EVENT_OPTIONS,
  GROUP_EVENT_OPTIONS,
  VIRTUAL_EVENT_OPTIONS,
  VIRTUAL_GROUP_OPTIONS,
  VIRTUAL_TIME_OPTIONS,
} from '../../shared/constants/EventFilters';
import {
  logAccessFilters,
} from '../../shared/models/Analytics';
import {
  MY_EVENT_TYPES,
  PAST_EVENT_TYPES,
} from '../../shared/constants/EventTabs';
import {
  DEFAULT_LOCAL_OPTIONS,
  DEFAULT_VIRTUAL_OPTIONS,
} from '../../shared/constants/DefaultFilters';

const LOZENGE_VIEW_HEIGHT = 50;

export class LocalLozenges extends Component {
  modifiedFilterCount() {
    const {
      eventCategory,
      eventDistance,
      sortBy,
      eventDate,
      eventFilterNavTab,
      eventGroupOption,
    } = this.props;
    let count = 0;
    if (eventDistance !== DEFAULT_LOCAL_OPTIONS.eventDistance) count++;
    if (eventCategory !== DEFAULT_LOCAL_OPTIONS.eventCategory) count++;
    if (eventDate !== DEFAULT_LOCAL_OPTIONS.eventDate) count++;
    if (sortBy !== DEFAULT_LOCAL_OPTIONS.sortBy) count++;
    if (eventFilterNavTab !== DEFAULT_LOCAL_OPTIONS.eventFilterNavTab) count++;
    if (
      eventFilterNavTab === 'group' &&
      eventGroupOption !== DEFAULT_LOCAL_OPTIONS.eventGroupOption
    )
      count++;
    return count;
  }
  render() {
    const {eventCategory} = this.props;
    return (
      <View style={{height: LOZENGE_VIEW_HEIGHT}}>
        <ScrollView
          style={styles.scrollContainer}
          horizontal={true}
          showsHorizontalScrollIndicator={false}>
          <EventFilterPill
            key={0}
            text="Filters"
            accessibilityLabel="Access all Event Filters"
            active={this.modifiedFilterCount() > 0}
            count={this.modifiedFilterCount()}
            onPress={() => {
              logAccessFilters();
              this.props.openFilters();
            }}
          />
          <EventFilterPill
            key={1}
            text={EVENT_OPTIONS['run-walk'].display}
            onPress={() => {
              this.props.toggleLozenge(EVENT_OPTIONS['run-walk'].slug);
            }}
            accessibilityLabel="Toggle 'Run/Walk' event filter"
            accessibilityHint={
              eventCategory === 'run-walk'
                ? 'View activities of all types'
                : 'View run/walk activities only'
            }
            active={eventCategory === EVENT_OPTIONS['run-walk'].slug}
          />
          <EventFilterPill
            key={2}
            text={EVENT_OPTIONS['hike-ruck'].display}
            onPress={() => {
              this.props.toggleLozenge(EVENT_OPTIONS['hike-ruck'].slug);
            }}
            accessibilityLabel="Toggle 'Hike/Ruck' event filter"
            accessibilityHint={
              eventCategory === 'hike-ruck'
                ? 'View activities of all types'
                : 'View hike/ruck activities only'
            }
            active={eventCategory === EVENT_OPTIONS['hike-ruck'].slug}
          />
          <EventFilterPill
            key={3}
            text={EVENT_OPTIONS.social.display}
            onPress={() => {
              this.props.toggleLozenge(EVENT_OPTIONS.social.slug);
            }}
            accessibilityLabel="Toggle 'Social' event filter"
            accessibilityHint={
              eventCategory === 'social'
                ? 'View activities of all types'
                : 'View social activities only'
            }
            active={eventCategory === EVENT_OPTIONS.social.slug}
          />
        </ScrollView>
      </View>
    );
  }
}
// NOTE: This is not done, just some set up
export class VirtualLozenges extends Component {
  modifiedFilterCount() {
    const {
      eventCategory,
      sortBy,
      eventDate,
      virtualSubtype,
      eventGroupOption,
      virtualTime,
    } = this.props;
    let count = 0;
    if (virtualSubtype !== DEFAULT_VIRTUAL_OPTIONS.virtualSubtype) count++;
    if (eventCategory !== DEFAULT_VIRTUAL_OPTIONS.virtualEventCategory) count++;
    if (eventDate !== DEFAULT_VIRTUAL_OPTIONS.virtualEventDate) count++;
    if (sortBy !== DEFAULT_VIRTUAL_OPTIONS.virtualSortBy) count++;
    if (eventGroupOption !== DEFAULT_VIRTUAL_OPTIONS.virtualEventGroupOption)
      count++;
    if (virtualTime !== DEFAULT_VIRTUAL_OPTIONS.virtualTime) count++;
    return count;
  }
  render() {
    const {eventGroupOption} = this.props;
    return (
      <View style={{height: LOZENGE_VIEW_HEIGHT}}>
        <ScrollView
          style={styles.scrollContainer}
          horizontal={true}
          showsHorizontalScrollIndicator={false}>
          <EventFilterPill
            key={0}
            text="Filters"
            accessibilityLabel="Access all Event Filters"
            active={this.modifiedFilterCount() > 0}
            count={this.modifiedFilterCount()}
            onPress={() => {
              logAccessFilters();
              this.props.openFilters();
            }}
          />
          <EventFilterPill
            key={1}
            text={VIRTUAL_GROUP_OPTIONS.national.display}
            onPress={() => {
              this.props.toggleLozenge('national');
            }}
            accessibilityLabel="Toggle 'National' events filter"
            accessibilityHint={
              eventGroupOption === 'national'
                ? 'View events only from groups you joined'
                : 'View events only from national and activity groups'
            }
            active={eventGroupOption === VIRTUAL_GROUP_OPTIONS.national.slug}
          />
          <EventFilterPill
            key={2}
            text={VIRTUAL_GROUP_OPTIONS['my-groups'].display}
            onPress={() => {
              this.props.toggleLozenge('my-groups');
            }}
            accessibilityLabel="Toggle 'My Groups' events filter"
            accessibilityHint={
              eventGroupOption === 'my-groups'
                ? 'View events from national, all activity, and groups you joined'
                : 'View events only from groups you joined'
            }
            active={
              eventGroupOption === VIRTUAL_GROUP_OPTIONS['my-groups'].slug
            }
          />
        </ScrollView>
      </View>
    );
  }
}

export class MyLozenges extends Component {
  render() {
    const {myEventType} = this.props;
    return (
      <View style={{height: LOZENGE_VIEW_HEIGHT}}>
        <ScrollView
          style={styles.scrollContainer}
          horizontal={true}
          showsHorizontalScrollIndicator={false}>
          <EventFilterPill
            key={0}
            text={capitalizeFirstLetter(MY_EVENT_TYPES.hosting)}
            onPress={() => {
              // if (myEventType !== MY_EVENT_TYPES.hosting) logAccessHostingEvents(); // this never needed to be added to analytics
              this.props.toggleLozenge(MY_EVENT_TYPES.hosting);
            }}
            accessibilityLabel="Toggle 'Hosting' event filter"
            accessibilityHint={
              myEventType === MY_EVENT_TYPES.hosting
                ? 'View all of my events'
                : `View my ${MY_EVENT_TYPES.hosting} events only`
            }
            active={myEventType === MY_EVENT_TYPES.hosting}
          />
          <EventFilterPill
            key={1}
            text={capitalizeFirstLetter(MY_EVENT_TYPES.upcoming)}
            onPress={() => {
              this.props.toggleLozenge(MY_EVENT_TYPES.upcoming);
            }}
            accessibilityLabel="Toggle 'Upcoming' event filter"
            accessibilityHint={
              myEventType === MY_EVENT_TYPES.upcoming
                ? 'View all of my events'
                : `View my ${MY_EVENT_TYPES.upcoming} events only`
            }
            active={myEventType === MY_EVENT_TYPES.upcoming}
          />
          <EventFilterPill
            key={2}
            text={capitalizeFirstLetter(MY_EVENT_TYPES.past)}
            onPress={() => {
              this.props.toggleLozenge(MY_EVENT_TYPES.past);
            }}
            accessibilityLabel="Toggle 'Past' event filter"
            accessibilityHint={
              myEventType === MY_EVENT_TYPES.past
                ? 'View all of my events'
                : `View my ${MY_EVENT_TYPES.past} events only`
            }
            active={myEventType === MY_EVENT_TYPES.past}
          />
        </ScrollView>
      </View>
    );
  }
}

export class PastLozenges extends Component {
  render() {
    const {pastEventType} = this.props;
    return (
      <View style={{height: LOZENGE_VIEW_HEIGHT}}>
        <ScrollView
          style={styles.scrollContainer}
          horizontal={true}
          showsHorizontalScrollIndicator={false}>
          <EventFilterPill
            key={0}
            text={`${capitalizeFirstLetter(PAST_EVENT_TYPES.local)} Events`}
            onPress={() => {
              this.props.toggleLozenge(PAST_EVENT_TYPES.local);
            }}
            accessibilityLabel="Toggle 'past' event filter"
            accessibilityHint={
              pastEventType === PAST_EVENT_TYPES.local
                ? 'View all past events'
                : `View past ${PAST_EVENT_TYPES.local} events only`
            }
            active={pastEventType === PAST_EVENT_TYPES.local}
          />
          <EventFilterPill
            key={1}
            text={`${capitalizeFirstLetter(PAST_EVENT_TYPES.virtual)} Events`}
            onPress={() => {
              this.props.toggleLozenge(PAST_EVENT_TYPES.virtual);
            }}
            accessibilityLabel="Toggle 'Virtual' event filter"
            accessibilityHint={
              pastEventType === PAST_EVENT_TYPES.virtual
                ? 'View all past virtual events'
                : `View past ${PAST_EVENT_TYPES.virtual} events only`
            }
            active={pastEventType === PAST_EVENT_TYPES.virtual}
          />
        </ScrollView>
      </View>
    );
  }
}

export class PopularActivitiesLozenges extends Component {
  render() {
    const {groupEventType} = this.props;
    return (
      <View style={{height: LOZENGE_VIEW_HEIGHT}}>
        <ScrollView
          style={styles.scrollContainer}
          horizontal={true}
          showsHorizontalScrollIndicator={false}>
          {Object.keys(GROUP_EVENT_OPTIONS).map((result, i) => (
            <EventFilterPill
              key={i}
              text={`${GROUP_EVENT_OPTIONS[result].display}`}
              onPress={() => {
                this.props.toggleLozenge(GROUP_EVENT_OPTIONS[result].slug);
              }}
              accessibilityLabel={`Toggle ${GROUP_EVENT_OPTIONS[result].display} event filter`}
              accessibilityHint={
                groupEventType === GROUP_EVENT_OPTIONS[result].slug
                  ? `View activities of all types`
                  : `View ${GROUP_EVENT_OPTIONS[result].display} activities only`
              }
              active={groupEventType === GROUP_EVENT_OPTIONS[result].slug}
            />
          ))}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scrollContainer: {
    marginVertical: 10,
    paddingHorizontal: '5%',
  },
});
