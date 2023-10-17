import React, {useState, useEffect, useRef} from 'react';
import styles from './FiltersBar.module.css';
import {IconButton} from '@material-ui/core';
import {
  ChevronLeft,
  ChevronRight,
  Event as EventIcon,
  Tune as FilterIcon,
} from '@material-ui/icons';
import EventFilters from './EventFilters';
import {filters} from '../../models/Filters';
import {
  logAccessFilters,
  logToggleLozenge,
} from '../../../../shared/models/Analytics';
import {
  EVENT_TAB_TYPES,
  MY_EVENT_TYPES,
  GROUP_EVENT_TAB_TYPES,
  PAST_EVENT_TYPES,
} from '../../../../shared/constants/EventTabs';
import {
  EVENT_OPTIONS,
  GROUP_EVENT_OPTIONS,
  PAST_GROUP_EVENT_OPTIONS,
  VIRTUAL_GROUP_OPTIONS,
} from '../../../../shared/constants/EventFilters';
import {
  DEFAULT_LOCAL_OPTIONS,
  DEFAULT_VIRTUAL_OPTIONS,
} from '../../../../shared/constants/DefaultFilters';

const Lozenge = ({slug, display, onClick, selected, group}) => (
  <IconButton
    className={styles.filterLozenges}
    size={'small'}
    onClick={onClick}>
    <div
      className={[
        styles.singleContainer,
        filters.eventCategory === slug && !group && styles.selected, // group statement is needed to avoid conflicts with selecting the first lozenge on group events
        filters.virtualEventGroupOption === slug && styles.selected,
        selected && styles.selected, // for my event types
      ].join(' ')}>
      {display}
    </div>
  </IconButton>
);

const GroupEventLozenges = ({
  activities,
  active,
  onChange,
  containerRef,
  onHorizontalScroll,
}) => {
  return (
    <div className={styles.groupEventLozengesContainer} ref={containerRef}>
      <button onClick={() => onHorizontalScroll('left')}>
        <ChevronLeft />
      </button>
      <div
        id="groupLozengeContainer"
        style={{overflowX: 'hidden', width: '95%'}}>
        {activities.map(({display, slug}, i) => (
          <Lozenge
            key={i}
            slug={slug}
            display={display}
            onClick={() => onChange(slug)}
            selected={active === slug}
            group
          />
        ))}
      </div>
      <button onClick={() => onHorizontalScroll('right')}>
        <ChevronRight />
      </button>
    </div>
  );
};

const FiltersBar = ({
  onSubmit,
  activeTab,
  activeMyEventsType,
  onFilterMyEvents,
  virtualSubtype,
  virtualSortBy,
  virtualEventDate,
  virtualEventCategory,
  groupId,
  activeGroupEventActivity,
  changeGroupEventActivity,
  activePastEventType,
  onChangeActivePastEventType,
}) => {
  const [openEventFilters, setopenEventFilters] = useState(false);
  const [filterCounter, setfilterCounter] = useState(
    filters.eventCategory === 'all-activities' ? 1 : 0,
  );
  const groupLozengesRef = useRef();

  // when the active tab changes, update the count
  useEffect(() => {
    filterCounterHandler();
  }, [activeTab]);

  const eventFilterHandler = (isSubmit) => {
    setopenEventFilters((prevState) => !prevState);
    filterCounterHandler();

    if (isSubmit) {
      onSubmit();
    }
  };

  /* 
    Unideal code to keep the UX similar to mobile, despite how filters are handled being quite different.
    This fix is solely for when refreshing on the event page. Tab changes are properly handled in a use effect.
    This makes sure the filterCounterHandler is called and has the proper values from filters to deal with the async nature.
    Additionally, passing filters as props is not ideal as filter setting is done in this file.
  */
  setTimeout(() => {
    filterCounterHandler();
  }, 100);

  // handle the specific lozenge logging type
  // this is only called when one is selected, as opposed to deselecting the toggeled lozenge
  const filterLogType = (category) => {
    const analytics_params = {
      active_tab: activeTab,
      click_text: EVENT_OPTIONS[category].display,
    }
    logToggleLozenge(analytics_params);
  };

  const filterEvents = async (category) => {
    if (filters.eventCategory === category) {
      await filters.setFilter({
        eventCategory: 'all-activities',
      });
    } else {
      filterLogType(category);
      await filters.setFilter({
        eventCategory: category,
      });
    }
    filterCounterHandler();
    onSubmit();
  };

  const filterVirtualEvents = async (type) => {
    if (filters.virtualEventGroupOption === type) {
      await filters.setFilter({
        virtualEventGroupOption: VIRTUAL_GROUP_OPTIONS.national.slug,
      });
    } else {
      await filters.setFilter({
        virtualEventGroupOption: type,
      });
    }
    filterCounterHandler();
    onSubmit();
  };

  const filterCounterHandler = () => {
    let counter = 0;
    if (activeTab === EVENT_TAB_TYPES.local) {
      if (filters.eventDistance !== DEFAULT_LOCAL_OPTIONS.eventDistance)
        counter++;
      if (filters.eventDate !== DEFAULT_LOCAL_OPTIONS.eventDate) counter++;
      if (filters.sortBy !== DEFAULT_LOCAL_OPTIONS.sortBy) counter++;
      if (filters.eventCategory !== DEFAULT_LOCAL_OPTIONS.eventCategory)
        counter++;
      if (filters.eventFilterNavTab !== DEFAULT_LOCAL_OPTIONS.eventFilterNavTab)
        counter++;
      if (
        filters.eventFilterNavTab === 'group' &&
        filters.eventGroupOption !== DEFAULT_LOCAL_OPTIONS.eventGroupOption
      )
        counter++;
    } else if (activeTab === EVENT_TAB_TYPES.virtual) {
      // only using props for virtual due to link specific virtual links
      if (virtualSubtype !== DEFAULT_VIRTUAL_OPTIONS.virtualSubtype) counter++;
      if (virtualEventDate !== DEFAULT_VIRTUAL_OPTIONS.virtualEventDate)
        counter++;
      if (virtualSortBy !== DEFAULT_VIRTUAL_OPTIONS.virtualSortBy) counter++;
      if (virtualEventCategory !== DEFAULT_VIRTUAL_OPTIONS.virtualEventCategory)
        counter++;
      if (
        filters.virtualEventGroupOption !==
        DEFAULT_VIRTUAL_OPTIONS.virtualEventGroupOption
      )
        counter++;
      if (filters.virtualTime !== DEFAULT_VIRTUAL_OPTIONS.virtualTime)
        counter++;
    }
    setfilterCounter(counter);
  };

  const handleHorizontalScroll = (direction) => {
    // move by the width of the container, showing new results on each click
    const containerWidth = document.getElementById('groupLozengeContainer')
      .offsetWidth;
    const scrollMovement =
      direction === 'left' ? containerWidth * -1 : containerWidth;
    groupLozengesRef.current.children[1].scrollTo({
      top: 0,
      left: groupLozengesRef.current.children[1].scrollLeft + scrollMovement,
      behaviour: 'smooth', // for smooth scrolling
    });
  };

  return (
    <>
      {groupId ? (
        <>
          {(activeTab === GROUP_EVENT_TAB_TYPES.local ||
            activeTab === GROUP_EVENT_TAB_TYPES.virtual) && (
            <GroupEventLozenges
              activities={Object.values(GROUP_EVENT_OPTIONS)}
              active={activeGroupEventActivity}
              onChange={(slug) => changeGroupEventActivity(slug)}
              containerRef={groupLozengesRef}
              onHorizontalScroll={handleHorizontalScroll}
            />
          )}
          {activeTab === GROUP_EVENT_TAB_TYPES.past && (
            <div className={styles.filtersContainer}>
              <Lozenge
                slug={PAST_GROUP_EVENT_OPTIONS.local.slug}
                display={PAST_GROUP_EVENT_OPTIONS.local.display}
                onClick={() =>
                  onChangeActivePastEventType(PAST_EVENT_TYPES.local)
                }
                selected={activePastEventType === PAST_EVENT_TYPES.local}
              />
              <Lozenge
                slug={PAST_GROUP_EVENT_OPTIONS.virtual.slug}
                display={PAST_GROUP_EVENT_OPTIONS.virtual.display}
                onClick={() =>
                  onChangeActivePastEventType(PAST_EVENT_TYPES.virtual)
                }
                selected={activePastEventType === PAST_EVENT_TYPES.virtual}
              />
            </div>
          )}
        </>
      ) : (
        <div className={styles.filtersContainer}>
          {['local', 'virtual'].includes(activeTab) && (
            <IconButton
              className={styles.filterLozenges}
              size={'small'}
              onClick={() => {
                logAccessFilters();
                eventFilterHandler(false);
              }}>
              {filterCounter ? (
                <div className={styles.filterCounterContainer}>
                  <div className={styles.filterCounter}>
                    <h4>{filterCounter}</h4>
                  </div>
                  Filters
                </div>
              ) : (
                <div className={styles.singleContainer}>
                  <FilterIcon />
                  Filters
                </div>
              )}
            </IconButton>
          )}
          {activeTab === EVENT_TAB_TYPES.local && (
            <>
              <Lozenge
                slug={'run-walk'}
                display={'Run/Walk'}
                onClick={() => filterEvents('run-walk')}
              />
              <Lozenge
                slug={'hike-ruck'}
                display={'Hike/Ruck'}
                onClick={() => filterEvents('hike-ruck')}
              />
              <Lozenge
                slug={'social'}
                display={'Social'}
                onClick={() => filterEvents('social')}
              />
            </>
          )}
          {activeTab === EVENT_TAB_TYPES.virtual && (
            <>
              <Lozenge
                slug={VIRTUAL_GROUP_OPTIONS.national.slug}
                display={VIRTUAL_GROUP_OPTIONS.national.display}
                onClick={() =>
                  filterVirtualEvents(VIRTUAL_GROUP_OPTIONS.national.slug)
                }
              />
              <Lozenge
                slug={VIRTUAL_GROUP_OPTIONS['my-groups'].slug}
                display={VIRTUAL_GROUP_OPTIONS['my-groups'].display}
                onClick={() =>
                  filterVirtualEvents(VIRTUAL_GROUP_OPTIONS['my-groups'].slug)
                }
              />
            </>
          )}
          {activeTab === EVENT_TAB_TYPES.my && (
            <>
              <Lozenge
                slug={MY_EVENT_TYPES.hosting}
                display={MY_EVENT_TYPES.hosting}
                onClick={() => onFilterMyEvents(MY_EVENT_TYPES.hosting)}
                selected={activeMyEventsType === MY_EVENT_TYPES.hosting}
              />
              <Lozenge
                slug={MY_EVENT_TYPES.upcoming}
                display={MY_EVENT_TYPES.upcoming}
                onClick={() => onFilterMyEvents(MY_EVENT_TYPES.upcoming)}
                selected={activeMyEventsType === MY_EVENT_TYPES.upcoming}
              />
              <Lozenge
                slug={MY_EVENT_TYPES.past}
                display={MY_EVENT_TYPES.past}
                onClick={() => onFilterMyEvents(MY_EVENT_TYPES.past)}
                selected={activeMyEventsType === MY_EVENT_TYPES.past}
              />
            </>
          )}
        </div>
      )}
      {openEventFilters && (
        <EventFilters
          onCloseFilters={eventFilterHandler}
          activeTab={activeTab}
        />
      )}
    </>
  );
};

export default FiltersBar;
