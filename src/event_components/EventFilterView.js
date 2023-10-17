import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  EVENT_OPTIONS,
  GROUP_OPTIONS,
  VIRTUAL_GROUP_OPTIONS,
  SORT_OPTIONS,
  DATE_OPTIONS,
  VIRTUAL_EVENT_OPTIONS,
  VIRTUAL_TIME_OPTIONS,
  DISTANCE_OPTIONS,
} from '../../shared/constants/EventFilters';
import globalStyles, {RWBColors} from '../styles';
import RWBButton from '../design_components/RWBButton';
import {
  CustomScrollablePickerList,
  generateCustomPickerItems,
} from '../design_components/CustomScrollablePicker';
import {getDisplayableValue} from '../../shared/utils/Helpers';
import XIcon from '../../svgs/XIcon';
import {
  EVENT_TAB_TYPES,
  FILTER_NAV_TABS,
} from '../../shared/constants/EventTabs';
import {
  DEFAULT_LOCAL_OPTIONS,
  DEFAULT_VIRTUAL_OPTIONS,
} from '../../shared/constants/DefaultFilters';
import {filters} from '../models/Filters';
import NavTabs from '../design_components/NavTabs';
import {Picker} from '@react-native-picker/picker';
import { logDetailedEventFilters } from '../../shared/models/Analytics';
export default class EventFilterView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      distance: this.props.distance || DEFAULT_LOCAL_OPTIONS.eventDistance,
      date: this.props.date || DEFAULT_LOCAL_OPTIONS.eventDate,
      eventGroupOption:
        this.props.eventGroupOption || DEFAULT_LOCAL_OPTIONS.eventGroupOption,
      eventFilterNavTab:
        this.props.eventFilterNavTab || DEFAULT_LOCAL_OPTIONS.eventFilterNavTab,
      sort_by: this.props.sortBy || DEFAULT_LOCAL_OPTIONS.sortBy,
      activity_category:
        this.props.activityCategory || DEFAULT_LOCAL_OPTIONS.eventCategory,
      virtual_subtype:
        this.props.virtualSubtype || DEFAULT_VIRTUAL_OPTIONS.virtualSubtype,
      virtual_time:
        this.props.virtualTime || DEFAULT_VIRTUAL_OPTIONS.virtualTime,
      distanceVisible: false,
      dateVisible: false,
      groupVisible: false,
      sortVisible: false,
      activityVisible: false,
      sliderValue: this.props.sliderValue,
      virtualSubtypeVisible: false,
      timeVisible: false,
    };
  }

  getOptionKey(value, options) {
    const entries = Object.entries(options);
    let key;
    entries.map((entry) => {
      if (entry[1].display === value) {
        key = entry[0];
      }
    });
    return key;
  }

  handleIgnoreChanges = () => {
    // these are all the values shared between local and virtual
    let stateObj = {
      activity_category: this.props.activity,
      sort_by: this.props.sortBy,
      date: this.props.date,
    };
    if (this.props.type === EVENT_TAB_TYPES.local) {
      stateObj.distance = this.props.distance;

      this.setState({...stateObj});
    } else if (this.props.type === EVENT_TAB_TYPES.virtual) {
      this.setState({...stateObj});
    }
  };

  updateValues = () => {
    const {
      activity_category,
      date,
      sort_by,
      distance,
      virtual_subtype,
      eventGroupOption,
      eventFilterNavTab,
      virtual_time,
    } = this.state;
    if (distance !== this.props.distance)
      this.props.onDistancePressed(distance);
    if (activity_category !== this.props.activityCategory)
      this.props.onCategoryPressed(activity_category);
    if (sort_by !== this.props.sortBy) this.props.onSortByPressed(sort_by);
    if (date !== this.props.date) this.props.onDatePressed(date);
    if (eventFilterNavTab !== this.props.eventFilterNavTab)
      this.props.onNavTabPressed(eventFilterNavTab);
    if (eventGroupOption !== this.props.eventGroupOption)
      this.props.onGroupPressed(eventGroupOption);
    if (virtual_subtype !== this.props.virtualSubtype)
      this.props.onVirtualSubtypePressed(virtual_subtype);
    if (virtual_time !== this.props.virtualTime)
      this.props.onVirtualTimePressed(virtual_time);

    // analytics
    let analyticsObj = {};
    if (this.props.type === EVENT_TAB_TYPES.local) {
      analyticsObj = {
        'active_tab': eventFilterNavTab,
        'filter_distance': DISTANCE_OPTIONS[distance].label,
        'filter_date': DATE_OPTIONS[date].display,
        'filter_sort_by': SORT_OPTIONS[sort_by].display,
        'filter_activity_category': EVENT_OPTIONS[activity_category].display,
      }
      if (eventFilterNavTab === 'group') {
        analyticsObj['filter_group'] = GROUP_OPTIONS[eventGroupOption].display;
      }
    }
    else if (this.props.type === EVENT_TAB_TYPES.virtual) {
      analyticsObj = {
        // 'active_tab': FILTER_NAV_TABS_KEYS[activeFilterTab], // not applicable on virtual, should we state it is virtual
        'filter_date': DATE_OPTIONS[date].display,
        'virtual_event_type': VIRTUAL_EVENT_OPTIONS[virtual_subtype].display,
        'filter_sort_by': SORT_OPTIONS[sort_by].display,
        'filter_activity_category': EVENT_OPTIONS[activity_category].display,
        'filter_group': VIRTUAL_GROUP_OPTIONS[eventGroupOption].display,
        'filter_duration': VIRTUAL_TIME_OPTIONS[virtual_time].display,
      }
    }
    logDetailedEventFilters(analyticsObj);
  };

  closeModal(ignoreChanges) {
    // if the user hits the X revert things to how they were or android user presses back
    if (ignoreChanges) this.handleIgnoreChanges();
    else this.updateValues();
    this.props.onClose();
  }

  setOnlyVisible(field) {
    this.setState({
      distanceVisible: field === 'distance' ? true : false,
      dateVisible: field === 'date' && !this.state.dateVisible ? true : false,
      groupVisible:
        field === 'eventGroupOption' && !this.state.groupVisible ? true : false,
      sortVisible: field === 'sort' && !this.state.sortVisible ? true : false,
      activityVisible: field === 'activity' ? true : false,
      virtualSubtypeVisible: field === 'virtualSubtype' ? true : false,
      timeVisible: field === 'time' ? true : false,
    });
  }

  renderPickers(filter_options, filter_type) {
    const entries = Object.entries(filter_options);
    return entries.map((entry, i) => {
      return (
        <Picker.Item
          key={`${filter_type}-${i}`}
          label={entry[1].display}
          value={entry[0]}
        />
      );
    });
  }

  fillActionSheet(filter_options, filter_type) {
    const entries = Object.entries(filter_options);
    let actionSheetOptions = [];
    entries.map((entry, i) => {
      actionSheetOptions.push(entry[1].display);
    });
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: actionSheetOptions,
      },
      (buttonIndex) => {
        this.setOnlyVisible(null);
        this.setState({
          [filter_type]: this.getOptionKey(
            actionSheetOptions[buttonIndex],
            filter_options,
          ),
        });
      },
    );
  }

  locallySaveFilterType = (filter_type, value) => {
    this.setState({[filter_type]: value});
  };

  setFlag = (flag) => {
    this.setState({eventFilterNavTab: flag});
  };

  resetFilters = () => {
    if (this.props.type === EVENT_TAB_TYPES.local) {
      this.props.onDistancePressed(DEFAULT_LOCAL_OPTIONS.eventDistance);
      this.props.onDatePressed(DEFAULT_LOCAL_OPTIONS.eventDate);
      this.props.onSortByPressed(DEFAULT_LOCAL_OPTIONS.sortBy);
      this.props.onCategoryPressed(DEFAULT_LOCAL_OPTIONS.eventCategory);
      this.props.onGroupPressed(DEFAULT_LOCAL_OPTIONS.eventGroupOption);
      this.setState({
        sliderValue: 100, //100 is where 50 is
        distance: DEFAULT_LOCAL_OPTIONS.eventDistance,
        date: DEFAULT_LOCAL_OPTIONS.eventDate,
        sort_by: DEFAULT_LOCAL_OPTIONS.sortBy,
        activity_category: DEFAULT_LOCAL_OPTIONS.eventCategory,
        eventGroupOption: DEFAULT_LOCAL_OPTIONS.eventGroupOption,
        eventFilterNavTab: DEFAULT_LOCAL_OPTIONS.eventFilterNavTab,
      });
      // ensure this is called after all the sets from the onPresseds
      setTimeout(() => {
        filters.resetFilters(EVENT_TAB_TYPES.local);
      }, 1000);
    } else if (this.props.type === EVENT_TAB_TYPES.virtual) {
      this.props.onVirtualSubtypePressed(
        DEFAULT_VIRTUAL_OPTIONS.virtualSubtype,
      );
      this.props.onDatePressed(DEFAULT_VIRTUAL_OPTIONS.virtualEventDate);
      this.props.onSortByPressed(DEFAULT_VIRTUAL_OPTIONS.virtualSortBy);
      this.props.onCategoryPressed(
        DEFAULT_VIRTUAL_OPTIONS.virtualEventCategory,
      );
      this.props.onGroupPressed(
        DEFAULT_VIRTUAL_OPTIONS.virtualEventGroupOption,
      );
      this.props.onVirtualTimePressed(DEFAULT_VIRTUAL_OPTIONS.virtualTime);
      this.setState({
        virtual_subtype: DEFAULT_VIRTUAL_OPTIONS.virtualSubtype,
        date: DEFAULT_VIRTUAL_OPTIONS.virtualEventDate,
        sort_by: DEFAULT_VIRTUAL_OPTIONS.virtualSortBy,
        activity_category: DEFAULT_VIRTUAL_OPTIONS.virtualEventCategory,
        eventGroupOption: DEFAULT_VIRTUAL_OPTIONS.virtualEventGroupOption,
        virtual_time: DEFAULT_VIRTUAL_OPTIONS.virtualTime,
      });
      // ensure this is called after all the sets from the onPresseds
      setTimeout(() => {
        filters.resetFilters(EVENT_TAB_TYPES.virtual);
      }, 1000);
    }
  };

  render() {
    const {
      date,
      eventGroupOption,
      sort_by,
      activity_category,
      virtual_subtype,
      virtual_time,
    } = this.state;
    return (
      <View style={{flex: 1}}>
        <SafeAreaView style={{flex: 0, backgroundColor: RWBColors.magenta}} />
        <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle="light-content"
            animated={true}
            translucent={false}
            backgroundColor={RWBColors.magenta}
          />
          <View style={styles.header}>
            <View>
              <TouchableOpacity
                style={{marginLeft: '10%'}}
                onPress={() => this.closeModal(true)}>
                <XIcon
                  tintColor={RWBColors.white}
                  style={globalStyles.headerIcon}
                />
              </TouchableOpacity>
            </View>
            <View>
              <Text style={[globalStyles.title, {top: 3}]}>Event Filters</Text>
            </View>
            <TouchableOpacity
              onPress={this.resetFilters}
              accessibilityRole={'button'}
              accessible={true}
              accessibilityLabel={'Reset filters'}
              style={{marginTop: 5, marginRight: '5%'}}>
              <Text style={globalStyles.headerSaveText}>Reset</Text>
            </TouchableOpacity>
          </View>
          {this.props.type === EVENT_TAB_TYPES.local && (
            <NavTabs
              tabs={FILTER_NAV_TABS}
              selected={this.state.eventFilterNavTab}
              handleOnPress={this.setFlag}
            />
          )}
          <View style={{margin: '5%', flex: 1}}>
            {(this.props.type === EVENT_TAB_TYPES.virtual ||
              this.state.eventFilterNavTab === 'group') && (
              <View>
                <CustomScrollablePickerList
                  label={'GROUP'}
                  currentValue={
                    <Text style={globalStyles.formInput}>
                      {getDisplayableValue(
                        eventGroupOption,
                        this.props.type === EVENT_TAB_TYPES.virtual
                          ? VIRTUAL_GROUP_OPTIONS
                          : GROUP_OPTIONS,
                      )}
                    </Text>
                  }
                  onPress={() => this.setOnlyVisible('eventGroupOption')}
                  visible={this.state.groupVisible}>
                  {generateCustomPickerItems(
                    this.props.type === EVENT_TAB_TYPES.virtual
                      ? VIRTUAL_GROUP_OPTIONS
                      : GROUP_OPTIONS,
                    'eventGroupOption',
                    this.state.eventGroupOption,
                    this.locallySaveFilterType,
                  )}
                </CustomScrollablePickerList>
                <View style={styles.divider} />
              </View>
            )}
            {this.props.type === EVENT_TAB_TYPES.virtual && (
              <View>
                <CustomScrollablePickerList
                  label={'DURATION'}
                  currentValue={
                    <Text style={globalStyles.formInput}>
                      {getDisplayableValue(virtual_time, VIRTUAL_TIME_OPTIONS)}
                    </Text>
                  }
                  onPress={() => this.setOnlyVisible('time')}
                  visible={this.state.timeVisible}>
                  {generateCustomPickerItems(
                    VIRTUAL_TIME_OPTIONS,
                    'virtual_time',
                    this.state.virtual_time,
                    this.locallySaveFilterType,
                  )}
                </CustomScrollablePickerList>
                <View style={styles.divider} />
              </View>
            )}
            {this.props.type === EVENT_TAB_TYPES.local && (
              <View>
                <Text style={globalStyles.formLabel}>DISTANCE</Text>
                <Slider
                  style={{width: '100%', height: 40}}
                  minimumValue={25}
                  maximumValue={250}
                  minimumTrackTintColor={RWBColors.magenta}
                  maximumTrackTintColor={RWBColors.grey20}
                  thumbTintColor={RWBColors.magenta}
                  step={75}
                  value={this.state.sliderValue}
                  onValueChange={(sliderValue) => this.setState({sliderValue})}
                  //map slider's value to distance filter values
                  onSlidingComplete={(sliderValue) => {
                    if (sliderValue === 25) {
                      this.setState({distance: '25-miles'});
                    } else if (sliderValue === 100) {
                      this.setState({distance: '50-miles'});
                    } else if (sliderValue === 175) {
                      this.setState({distance: '100-miles'});
                    } else {
                      this.setState({distance: '250-miles'});
                    }
                  }}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <TouchableOpacity
                    style={styles.distanceMarkers}
                    onPress={() =>
                      this.setState({distance: '25-miles', sliderValue: 25})
                    }
                    accessibilityRole={'button'}
                    accessible={true}
                    accessibilityLabel={'Filter events to 25 miles'}>
                    <Text style={[globalStyles.formLabel, {paddingLeft: 4}]}>
                      25 MI
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.distanceMarkers}
                    onPress={() =>
                      this.setState({distance: '50-miles', sliderValue: 100})
                    }
                    accessibilityRole={'button'}
                    accessible={true}
                    accessibilityLabel={'Filter events to 25 miles'}>
                    <Text style={globalStyles.formLabel}>50 MI</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.distanceMarkers}
                    onPress={() =>
                      this.setState({distance: '100-miles', sliderValue: 175})
                    }
                    accessibilityRole={'button'}
                    accessible={true}
                    accessibilityLabel={'Filter events to 25 miles'}>
                    <Text style={globalStyles.formLabel}>100 MI</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.distanceMarkers}
                    onPress={() =>
                      this.setState({distance: '250-miles', sliderValue: 250})
                    }
                    accessibilityRole={'button'}
                    accessible={true}
                    accessibilityLabel={'Filter events to 25 miles'}>
                    <Text style={globalStyles.formLabel}>250 MI</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.divider} />
              </View>
            )}

            {this.props.type === EVENT_TAB_TYPES.virtual && (
              <View>
                <CustomScrollablePickerList
                  label={'VIRTUAL EVENT TYPE'}
                  currentValue={
                    <Text style={globalStyles.formInput}>
                      {getDisplayableValue(
                        virtual_subtype,
                        VIRTUAL_EVENT_OPTIONS,
                      )}
                    </Text>
                  }
                  onPress={() => this.setOnlyVisible('virtualSubtype')}
                  visible={this.state.virtualSubtypeVisible}>
                  {generateCustomPickerItems(
                    VIRTUAL_EVENT_OPTIONS,
                    'virtual_subtype',
                    this.state.virtual_subtype,
                    this.locallySaveFilterType,
                  )}
                </CustomScrollablePickerList>
                <View style={styles.divider} />
              </View>
            )}

            <View>
              <CustomScrollablePickerList
                label={'DATE'}
                currentValue={
                  <Text style={globalStyles.formInput}>
                    {getDisplayableValue(date, DATE_OPTIONS)}
                  </Text>
                }
                onPress={() => this.setOnlyVisible('date')}
                visible={this.state.dateVisible}>
                {generateCustomPickerItems(
                  DATE_OPTIONS,
                  'date',
                  this.state.date,
                  this.locallySaveFilterType,
                )}
              </CustomScrollablePickerList>
              <View style={styles.divider} />
            </View>

            <View>
              <CustomScrollablePickerList
                label={'SORT'}
                currentValue={
                  <Text style={globalStyles.formInput}>
                    {getDisplayableValue(sort_by, SORT_OPTIONS)}
                  </Text>
                }
                onPress={() => this.setOnlyVisible('sort')}
                visible={this.state.sortVisible}>
                {generateCustomPickerItems(
                  SORT_OPTIONS,
                  'sort_by',
                  this.state.sort_by,
                  this.locallySaveFilterType,
                )}
              </CustomScrollablePickerList>
            </View>

            <View style={styles.divider} />

            <View>
              <TouchableOpacity
                disabled={Platform.OS === 'android'}
                onPress={() => this.setOnlyVisible('activity')}>
                <Text style={globalStyles.formLabel}>ACTIVITY CATEGORY</Text>
                {Platform.OS === 'android' ? null : (
                  <View>
                    <Text style={globalStyles.formInput}>
                      {getDisplayableValue(activity_category, EVENT_OPTIONS)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {Platform.OS === 'android' ? (
                <Picker
                  selectedValue={activity_category}
                  style={styles.androidPicker}
                  onValueChange={(itemValue, itemIndex) =>
                    this.setState({activity_category: itemValue})
                  }>
                  {this.renderPickers(EVENT_OPTIONS, 'activity')}
                </Picker>
              ) : this.state.activityVisible ? (
                this.fillActionSheet(EVENT_OPTIONS, 'activity_category')
              ) : null}
              <View style={styles.divider} />
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}></View>
            <View style={{position: 'absolute', bottom: 0, width: '100%'}}>
              <RWBButton
                onPress={() => this.closeModal()}
                text="APPLY"
                buttonStyle="primary"
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  androidPicker: {
    width: '100%',
    height: 30,
    margin: 0,
    padding: 0,
    right: 8,
  },
  divider: {
    marginVertical: 8,
  },
  header: {
    height: 60,
    backgroundColor: RWBColors.magenta,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distanceMarkers: {
    height: 32,
    justifyContent: 'space-around',
    alignItems: 'center',
    width: 32,
  },
});
