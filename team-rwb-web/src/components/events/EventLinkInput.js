import React from 'react';
import TextInput from '../TextInput';

const EventLinkInput = ({
  value,
  onChangeText,
  label,
  error,
  maxCharacters,
  reducedMargin,
}) => {
  const inputHandler = (e) => onChangeText(e.target.value);
  return (
    <>
      <TextInput
        label={label}
        // pass in a blank space as the placeholder to achieve floating-label input
        placeholder={' '}
        value={value}
        onValueChange={inputHandler}
        error={error}
        maxCharacters={maxCharacters}
        reducedMargin={reducedMargin}
      />
    </>
  );
};

export default EventLinkInput;
