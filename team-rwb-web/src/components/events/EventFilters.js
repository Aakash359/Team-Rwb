import React, {useState} from 'react';
import styles from './EventFilters.module.css';
import {
  Paper,
  Toolbar,
  IconButton,
  Slider,
  Typography,
} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import CustomPicker from './CustomPicker';
import CustomModal from './CustomModal';

import {filters} from '../../models/Filters';
import {
  EVENT_OPTIONS,
  SORT_OPTIONS,
  DATE_OPTIONS,
  VIRTUAL_EVENT_OPTIONS,
  GROUP_OPTIONS,
  VIRTUAL_GROUP_OPTIONS,
  VIRTUAL_TIME_OPTIONS,
} from '../../../../shared/constants/EventFilters';
import XIcon from '../svgs/XIcon';
import RWBButton from '../RWBButton';
import {
  logDateFilter,
  logDetailedEventFilters,
  logDistanceFilter,
  logSortFilter,
} from '../../../../shared/models/Analytics';
import {
  DEFAULT_LOCAL_OPTIONS,
  DEFAULT_VIRTUAL_OPTIONS,
} from '../../../../shared/constants/DefaultFilters';
import {
  EVENT_TAB_TYPES,
  FILTER_NAV_TABS,
} from '../../../../shared/constants/EventTabs';
import ReusableTabs from '../ReusableTabs';
import {AllInbox} from '@material-ui/icons';

const _styles = {
  root: {
    flexGrow: 1,
  },
  toolbar: {
    backgroundColor: 'var(--magenta)',
    height: 64,
    position: 'relative',
    justifyContent: 'space-between',
  },
  menuButton: {
    marginRight: '15px',
    color: 'var(--white)',
  },
  title: {
    color: 'var(--white)',
    textTransform: 'capitalize',
    textAlign: 'center',
    // title should always center, regardless of length of siblings
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    fontWeight: 'bold',
  },
  slider: {
    color: 'var(--magenta)',
    width: 'calc(100% - 40px)',
    left: '20px',
  },
  button: {
    backgroundColor: 'var(--magenta)',
    color: 'var(--white)',
    width: '70%',
    height: '50px',
    '&:hover': {
      backgroundColor: 'var(--magenta)',
    },
  },
  reset: {
    color: 'var(--white)',
    textTransform: 'capitalize',
    fontWeight: 'bold',
  },
};

const DISTANCE_OPTIONS = [
  {
    label: '25 MI',
    slug: '25-miles',
    value: 25,
  },
  {
    label: '50 MI',
    slug: '50-miles',
    value: 50,
  },
  {
    label: '100 MI',
    slug: '100-miles',
    value: 100,
  },
  {
    label: '250 MI',
    slug: '250-miles',
    value: 250,
  },
];

const FILTER_NAV_TABS_KEYS = ['all', 'group', 'member'];

const EventFilters = ({classes, onCloseFilters, activeTab}) => {
  const [
    distanceSliderSelectedValue,
    setdistanceSliderSelectedValue,
  ] = useState(
    DISTANCE_OPTIONS.filter((opt) => opt.slug === filters.eventDistance)[0],
  );
  const [datePickerSelectedValue, setdatePickerSelectedValue] = useState(
    activeTab === EVENT_TAB_TYPES.local
      ? filters.eventDate
      : filters.virtualEventDate || DEFAULT_VIRTUAL_OPTIONS.virtualEventDate,
  );
  const [datePickerIsOpen, setdatePickerIsOpen] = useState(false);
  const [sortPickerSelectedValue, setsortPickerSelectedValue] = useState(
    activeTab === EVENT_TAB_TYPES.local
      ? filters.sortBy
      : filters.virtualSortBy || DEFAULT_VIRTUAL_OPTIONS.virtualSortBy,
  );
  const [sortPickerIsOpen, setsortPickerIsOpen] = useState(false);
  const [activityModalSelectedValue, setactivityModalSelectedValue] = useState(
    activeTab === EVENT_TAB_TYPES.local
      ? filters.eventCategory || 'all-activities'
      : filters.virtualEventCategory || 'all-activities',
  );
  const [activityModalIsOpen, setactivityModalIsOpen] = useState(false);
  const [
    virtualSubTypeSelectedValue,
    setVirtualSubTypeSelectedValue,
  ] = useState(filters.virtualSubtype || 'all');
  const [virtualSubTypeIsOpen, setVirtualSubTypeIsOpen] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState(
    FILTER_NAV_TABS_KEYS.indexOf(filters.eventFilterNavTab || 0), // to avoid using map each time
  );
  const [activeGroupOption, setActiveGroupOption] = useState(
    filters.eventGroupOption || DEFAULT_LOCAL_OPTIONS.eventGroupOption,
  );
  const [activeGroupOptionIsOpen, setActiveGroupOptionIsOpen] = useState(false);
  const [activeVirtualGroupOption, setActiveVirtualGroupOption] = useState(
    filters.virtualEventGroupOption ||
      DEFAULT_VIRTUAL_OPTIONS.virtualEventGroupOption,
  );
  const [
    activeVirtualGroupOptionIsOpen,
    setActiveVirtualGroupOptionIsOpen,
  ] = useState(false);

  const [virtualTimeValue, setVirtualTimeValue] = useState(
    filters.virtualTime || DEFAULT_VIRTUAL_OPTIONS.virtualTime,
  );

  const [virtualTimeIsOpen, setVirtualTimeIsOpen] = useState(false);

  const datePickerHandler = () => {
    setdatePickerIsOpen((prevState) => !prevState);
  };
  const datePickerSelectHandler = (value) => setdatePickerSelectedValue(value);

  const sortPickerHandler = () => {
    setsortPickerIsOpen((prevState) => !prevState);
  };
  const sortPickerSelectHandler = (value) => setsortPickerSelectedValue(value);

  const activityModalHandler = () => {
    setactivityModalIsOpen((prevState) => !prevState);
  };
  const activityModalSelectHandler = (value) => {
    setactivityModalSelectedValue(
      typeof value === 'string' ? value : 'all-activities',
    );
    setactivityModalIsOpen(false);
  };
  const virtualSubTypeSelectHandler = (value) =>
    setVirtualSubTypeSelectedValue(value);
  const virtualSubTypePickerHandler = () =>
    setVirtualSubTypeIsOpen((prevState) => !prevState);

  const virtualTimeSelectHandler = (value) => setVirtualTimeValue(value);
  const virtualTimePickerHandler = () =>
    setVirtualTimeIsOpen((prevState) => !prevState);

  const distanceSliderChangeHandler = (_, value) => {
    const newValue = DISTANCE_OPTIONS.filter((opt) => opt.value === value)[0];
    setdistanceSliderSelectedValue(newValue);
  };

  const activeGroupOptionHandler = () => {
    setActiveGroupOptionIsOpen((prevState) => !prevState);
  };

  const activeVirtualGroupOptionHandler = () => {
    setActiveVirtualGroupOptionIsOpen((prevState) => !prevState);
  };

  const handleAnalytics = () => {
    let analyticsObj = {};
    if (activeTab === EVENT_TAB_TYPES.local) {
      analyticsObj = {
        'active_tab': FILTER_NAV_TABS_KEYS[activeFilterTab],
        'filter_distance': distanceSliderSelectedValue.label,
        'filter_date': DATE_OPTIONS[datePickerSelectedValue].display,
        'filter_sort_by': SORT_OPTIONS[sortPickerSelectedValue].display,
        'filter_activity_category': EVENT_OPTIONS[activityModalSelectedValue].display,
      }
      if (activeFilterTab === 1) {
        analyticsObj['filter_group'] = GROUP_OPTIONS[activeGroupOption].display;
      }
    } else if (activeTab === 'virtual') {
      analyticsObj = {
        // 'active_tab': FILTER_NAV_TABS_KEYS[activeFilterTab], // not applicable on virtual, should we state it is virtual
        'filter_date': DATE_OPTIONS[datePickerSelectedValue].display,
        'virtual_event_type': VIRTUAL_EVENT_OPTIONS[virtualSubTypeSelectedValue].display,
        'filter_sort_by': SORT_OPTIONS[sortPickerSelectedValue].display,
        'filter_activity_category': EVENT_OPTIONS[activityModalSelectedValue].display,
        'filter_group': VIRTUAL_GROUP_OPTIONS[activeVirtualGroupOption].display,
        'filter_duration': VIRTUAL_TIME_OPTIONS[virtualTimeValue].display,
      }
    }
 
    logDetailedEventFilters(analyticsObj);
  };

  const applyFiltersHandler = async () => {
    handleAnalytics();
    if (activeTab === EVENT_TAB_TYPES.local) {
      await filters.setFilter({
        eventDistance: distanceSliderSelectedValue.slug,
        eventDate: datePickerSelectedValue,
        sortBy: sortPickerSelectedValue,
        eventCategory: activityModalSelectedValue,
        eventFilterNavTab: FILTER_NAV_TABS_KEYS[activeFilterTab],
        eventGroupOption: activeGroupOption,
      });
    } else if (activeTab === EVENT_TAB_TYPES.virtual) {
      await filters.setFilter({
        virtualEventDate: datePickerSelectedValue,
        virtualSortBy: sortPickerSelectedValue,
        virtualEventCategory: activityModalSelectedValue,
        virtualSubtype: virtualSubTypeSelectedValue,
        virtualEventGroupOption: activeVirtualGroupOption,
        virtualTime: virtualTimeValue,
      });
    }
    filters.getFilters();
    onCloseFilters(true);
  };

  const resetFilters = () => {
    if (activeTab === EVENT_TAB_TYPES.local) {
      setdistanceSliderSelectedValue({
        label: '50 MI',
        slug: DEFAULT_LOCAL_OPTIONS.eventDistance,
        value: 50,
      });
      setdatePickerSelectedValue(DEFAULT_LOCAL_OPTIONS.eventDate);
      setsortPickerSelectedValue(DEFAULT_LOCAL_OPTIONS.sortBy);
      setactivityModalSelectedValue(DEFAULT_LOCAL_OPTIONS.eventCategory);
      setActiveFilterTab(
        FILTER_NAV_TABS_KEYS.indexOf(DEFAULT_LOCAL_OPTIONS.eventFilterNavTab),
      );
      setActiveGroupOption(DEFAULT_LOCAL_OPTIONS.eventGroupOption);
    } else if (activeTab === EVENT_TAB_TYPES.virtual) {
      setVirtualSubTypeSelectedValue(DEFAULT_VIRTUAL_OPTIONS.virtualSubtype);
      setdatePickerSelectedValue(DEFAULT_VIRTUAL_OPTIONS.virtualEventDate);
      setsortPickerSelectedValue(DEFAULT_VIRTUAL_OPTIONS.virtualSortBy);
      setactivityModalSelectedValue(
        DEFAULT_VIRTUAL_OPTIONS.virtualEventCategory,
      );
      setActiveVirtualGroupOption(
        DEFAULT_VIRTUAL_OPTIONS.virtualEventGroupOption,
      );
      setVirtualTimeValue(DEFAULT_VIRTUAL_OPTIONS.virtualTime);
    }
  };

  const isVirtualTab = activeTab === EVENT_TAB_TYPES.virtual;
  return (
    <div className={styles.container}>
      <Paper className={classes.root}>
        <Toolbar className={classes.toolbar}>
          <div onClick={() => onCloseFilters(false)}>
            <IconButton className={classes.menuButton} color="inherit">
              <XIcon tintColor={'var(--white)'} />
            </IconButton>
          </div>
          <Typography variant="h6" className={classes.title}>
            Event Filters
          </Typography>
          <IconButton
            edge="end"
            className={classes.menuButton}
            color="inherit"
            onClick={resetFilters}>
            <Typography variant="h6" className={classes.reset}>
              Reset
            </Typography>
          </IconButton>
        </Toolbar>
      </Paper>
      {activeTab === EVENT_TAB_TYPES.local && (
        <div className={styles.tabsContainer}>
          <ReusableTabs
            selectedValue={activeFilterTab}
            values={FILTER_NAV_TABS.map(({name}) => name)}
            onChangeHandler={setActiveFilterTab}
          />
        </div>
      )}
      <div className={styles.contentScroll}>
        <div className={styles.contentContainer}>
          {(activeFilterTab === 1 || isVirtualTab) && (
            <CustomPicker
              title={'Group'}
              isOpen={
                isVirtualTab
                  ? activeVirtualGroupOptionIsOpen
                  : activeGroupOptionIsOpen
              }
              items={isVirtualTab ? VIRTUAL_GROUP_OPTIONS : GROUP_OPTIONS}
              selectedValue={
                isVirtualTab ? activeVirtualGroupOption : activeGroupOption
              }
              pickerHanlder={() =>
                isVirtualTab
                  ? activeVirtualGroupOptionHandler()
                  : activeGroupOptionHandler()
              }
              onSelect={(slug) =>
                isVirtualTab
                  ? setActiveVirtualGroupOption(slug)
                  : setActiveGroupOption(slug)
              }
            />
          )}
          {activeTab === EVENT_TAB_TYPES.local && (
            <>
              <p className={`formLabel ${styles.distanceLabel}`}>Distance</p>
              <Slider
                value={distanceSliderSelectedValue.value}
                className={classes.slider}
                aria-labelledby="discrete-slider-restrict"
                step={null}
                valueLabelDisplay="off"
                marks={DISTANCE_OPTIONS}
                min={25}
                max={250}
                onChange={distanceSliderChangeHandler}
              />
            </>
          )}
          {activeTab === EVENT_TAB_TYPES.virtual && (
            <CustomPicker
              title={'Duration'}
              isOpen={virtualTimeIsOpen}
              items={VIRTUAL_TIME_OPTIONS}
              selectedValue={virtualTimeValue}
              pickerHanlder={virtualTimePickerHandler}
              onSelect={virtualTimeSelectHandler}
            />
          )}
          {activeTab === EVENT_TAB_TYPES.virtual && (
            <CustomPicker
              title={'Virtual Event Type'}
              isOpen={virtualSubTypeIsOpen}
              items={VIRTUAL_EVENT_OPTIONS}
              selectedValue={virtualSubTypeSelectedValue}
              pickerHanlder={virtualSubTypePickerHandler}
              onSelect={virtualSubTypeSelectHandler}
            />
          )}
          <CustomPicker
            title={'Date'}
            isOpen={datePickerIsOpen}
            items={DATE_OPTIONS}
            selectedValue={datePickerSelectedValue}
            pickerHanlder={datePickerHandler}
            onSelect={datePickerSelectHandler}
          />

          <CustomPicker
            title={'Sort By'}
            isOpen={sortPickerIsOpen}
            items={SORT_OPTIONS}
            selectedValue={sortPickerSelectedValue}
            pickerHanlder={sortPickerHandler}
            onSelect={sortPickerSelectHandler}
          />
          <CustomModal
            title={'Activity Category'}
            isOpen={activityModalIsOpen}
            items={EVENT_OPTIONS}
            selectedValue={activityModalSelectedValue}
            modalHandler={activityModalHandler}
            onSelect={activityModalSelectHandler}
          />
          <div className={styles.buttonContainer} onClick={applyFiltersHandler}>
            <RWBButton label={'Apply'} buttonStyle={'primary'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default withStyles(_styles)(EventFilters);
