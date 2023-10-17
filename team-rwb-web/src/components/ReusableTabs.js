import React from 'react';
import {Paper, makeStyles, Tabs, Tab} from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    boxShadow: '0px 0px 0px 0px',
    position: 'sticky',
  },
  menuButton: {
    color: 'var(--white)',
  },
  title: {
    color: 'var(--white)',
    textTransform: 'capitalize',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'var(--magenta)',
    height: 64,
  },
  button: {
    color: 'white',
    textTransform: 'capitalize',
  },
  iconLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    fontWeight: 'bold',
    color: 'var(--grey)',
  },
  iconLabelWrapperSelected: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    fontWeight: 'bold',
    color: 'var(--magenta)',
  },
  tabs: {
    borderBottom: '1px solid var(--grey20)',
  },
  indicator: {
    backgroundColor: 'var(--magenta)',
    border: null,
    borderColor: null,
  },
}));

const ReusableTabs = ({selectedValue, values, onChangeHandler, children}) => {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <Tabs
        className={classes.tabs}
        value={selectedValue}
        onChange={(_, i) => onChangeHandler(i)}
        variant="fullWidth"
        classes={{
          indicator: classes.indicator,
        }}>
        {values.map((value, i) => (
          <Tab
            key={i}
            label={value}
            classes={{
              wrapper:
                selectedValue === i
                  ? classes.iconLabelWrapperSelected
                  : classes.iconLabelWrapper,
            }}
          />
        ))}
      </Tabs>
      {children}
    </Paper>
  );
};

export default ReusableTabs;
