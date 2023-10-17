import React, {PureComponent} from 'react';
import {FlatList, SafeAreaView} from 'react-native';
import Event from './Event';

export default class EventList extends PureComponent {
  render() {
    const {
      events,
      loadMore,
      refreshing,
      onRefresh,
      renderFooter,
      renderSeparator,
      renderHeader,
      extraData,
      visible,
      handleScroll,
      disableOlderEvents,
      alertLimitUsersDisplayed,
      navigation,
      loadAttendees,
      onEventPressed,
      activeTab,
    } = this.props;
    return (
      <SafeAreaView
        style={{
          width: '100%',
          display: visible === false ? 'none' : null,
          flex: 1,
        }}>
        <FlatList
          data={events}
          keyExtractor={(item, index) => {
            return `${item.id}`;
          }}
          renderItem={({item}) => (
            <Event
              event={item}
              disableOlderEvents={disableOlderEvents}
              alertLimitUsersDisplayed={alertLimitUsersDisplayed}
              navigation={navigation}
              loadAttendees={loadAttendees}
              onEventPressed={onEventPressed()} //fix for on my events
              activeTab={activeTab}
            />
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReachedThreshold={0.5}
          onEndReached={loadMore}
          ListHeaderComponent={renderHeader}
          ItemSeparatorComponent={renderSeparator}
          ListFooterComponent={renderFooter}
          onScroll={handleScroll}
          extraData={extraData} // allows header to re-render on state change
        />
      </SafeAreaView>
    );
  }
}
