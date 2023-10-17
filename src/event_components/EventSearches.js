import React from 'react';
import {View} from 'react-native';
import SearchBar from '../design_components/SearchBar';
import DualSearchBox from '../design_components/DualSearchBox';
import {EVENT_TAB_TYPES} from '../../shared/constants/EventTabs';

const EventSearches = ({
  searchSubmit,
  onClearSearchPressed,
  search,
  onSearchTextChange,
  showLocation,
  city,
  onLocationInput,
  locationSearch,
  searchingLocation,
  activeTab,
}) => (
  <View>
    {activeTab === EVENT_TAB_TYPES.local ? (
      <DualSearchBox
        leftPlaceholder="Search for Events"
        leftSearchSubmit={searchSubmit}
        leftOnClearSearchPressed={onClearSearchPressed}
        leftSearch={search}
        leftOnSearchTextChange={onSearchTextChange}
        leftPropClearSearchShowing={false}
        leftClearText={false}
        leftFocusedEvent={null}
        rightPlaceholder={city ? `${city}` : ''}
        rightSearchSubmit={searchSubmit}
        rightOnClearSearchPressed={onLocationInput}
        rightPropClearSearchShowing={
          searchingLocation ||
          (locationSearch !== undefined && locationSearch.length > 0)
        }
        rightSearch={locationSearch}
        rightOnSearchTextChange={onLocationInput}
        rightClearText={false}
        rightFocusedEvent={showLocation}
      />
    ) : (
      <SearchBar
        placeholder={
          activeTab === EVENT_TAB_TYPES.virtual
            ? 'Search for virtual events…'
            : 'Search your events…'
        }
        searchSubmit={searchSubmit}
        onClearSearchPressed={onClearSearchPressed}
        search={search}
        onSearchTextChange={onSearchTextChange}
        clearText={false}
      />
    )}
  </View>
);

export default EventSearches;
