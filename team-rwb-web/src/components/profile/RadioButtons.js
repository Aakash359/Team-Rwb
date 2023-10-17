import React, {useState} from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

export default function RadioButtons({
  label,
  data,
  userProp,
  setMilitaryValue,
  setMilitaryRank,
  extraMarginBottom,
}) {
  const [value, setValue] = useState(userProp);

  const handleChange = (event) => {
    if (event.target.value === 'true') {
      setValue(true);
      setMilitaryValue(true);
    } else if (event.target.value === 'false') {
      setValue(false);
      setMilitaryValue(false);
    } else {
      setValue(event.target.value);
      setMilitaryValue(event.target.value);
      if (label === 'Military Branch') setMilitaryRank(null);
    }
  };

  return (
    <FormControl component="fieldset">
      <FormLabel
        style={{marginBottom: extraMarginBottom ? 15 : null}}
        component="legend">
        <p className={'formLabel'}>{label}</p>
      </FormLabel>
      <RadioGroup
        aria-label="status"
        name="status1"
        value={value}
        onChange={handleChange}
        style={{
          marginBottom: '20px',
        }}>
        {data &&
          data.map((item, key) => (
            <FormControlLabel
              key={key}
              value={item.status || item.value}
              control={<Radio />}
              label={item.label.toString()}
              style={{
                position: 'relative',
                marginBottom: extraMarginBottom ? 25 : null,
              }}
            />
          ))}
      </RadioGroup>
    </FormControl>
  );
}
