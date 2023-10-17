import React from 'react';
import {Appearance} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const DateTimePicker = (props) => {
  return (
    <DateTimePickerModal
      isDarkModeEnabled={Appearance.getColorScheme() === 'dark'} // when using the chrome/rn debugger "light" is always returned. The value update unless the user leaves the screen and comes back.
      value={new Date()}
      mode={props.pickerType === 'date' ? 'date' : 'time'}
      minimumDate={props.pickerType === 'date' ? new Date() : null} // This enabled selecting time earlier in the day but not a date in the past.
      // Time should have more checks, but for our current time we are leaving it that the user can select time in the past to avoid dealing with timezone issues. A quick fix could be to prevent making events on the current day.
      onConfirm={props.setDateAndTime}
      onCancel={() => props.hidePicker()}
      isVisible={props.isVisible}
      headerTextIOS={props.iOSTitle}
    />
  );
};

export default DateTimePicker;
