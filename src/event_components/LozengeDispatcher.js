import React, {Component} from 'react';
import {View, Text} from 'react-native';
import {
  LocalLozenges,
  MyLozenges,
  PastLozenges,
  PopularActivitiesLozenges,
  VirtualLozenges,
} from './LozengeSections';
import {
  EVENT_TAB_TYPES,
  GROUP_EVENT_TAB_TYPES,
} from '../../shared/constants/EventTabs';

export default class LozengeDispatcher extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      activeTab,
      eventCategory,
      eventDistance,
      hostType,
      sortBy,
      eventDate,
      activeMyEventsType,
      myEventType,
      openFilters,
      virtualSubtype,
      toggleLocalLozenge,
      toggleVirtualLozenge,
      toggleMyLozenge,
      togglePastLozenge,
      pastEventType,
      groupName,
      toggleGroupEventLozenge,
      groupEventType,
      eventFilterNavTab,
      eventGroupOption,
      virtualTime,
    } = this.props;
    return (
      <View>
        {activeTab === EVENT_TAB_TYPES.local && !groupName ? (
          <LocalLozenges
            eventCategory={eventCategory}
            eventDistance={eventDistance}
            hostType={hostType}
            sortBy={sortBy}
            eventDate={eventDate}
            toggleLozenge={toggleLocalLozenge}
            eventFilterNavTab={eventFilterNavTab}
            eventGroupOption={eventGroupOption}
            openFilters={openFilters}
          />
        ) : activeTab === EVENT_TAB_TYPES.virtual && !groupName ? (
          <VirtualLozenges
            eventCategory={eventCategory}
            virtualSubtype={virtualSubtype}
            sortBy={sortBy}
            eventDate={eventDate}
            toggleLozenge={toggleVirtualLozenge}
            eventGroupOption={eventGroupOption}
            openFilters={openFilters}
            virtualTime={virtualTime}
          />
        ) : activeTab === EVENT_TAB_TYPES.my ? (
          <MyLozenges
            myEventType={myEventType}
            toggleLozenge={toggleMyLozenge}
          />
        ) : activeTab === GROUP_EVENT_TAB_TYPES.past ? (
          <PastLozenges
            toggleLozenge={togglePastLozenge}
            pastEventType={pastEventType}
          />
        ) : (
          <PopularActivitiesLozenges
            toggleLozenge={toggleGroupEventLozenge}
            groupEventType={groupEventType}
          />
        )}
      </View>
    );
  }
}
