import React, {useState, memo} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import styles from './MenuButton.module.css';
import {isObject} from '../../../../shared/utils/Helpers';
import ChevronDownIcon from '../svgs/ChevronDownIcon';

const MenuButton = memo(
  ({label, data, setMilitaryValue, userProp, fullWidth, placeholder}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedItem, setSelectedItem] = useState(userProp);

    // this file manages what is displayed instead of displaying props
    // because of this, we want to reset the item in here if it should be empty
    // this case is when a user swithces the branch and forces the rank to change, but the text needs to be updated here
    if (userProp === null && selectedItem !== null) {
      setSelectedItem(null);
    }

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const selectHandler = (item) => {
      setSelectedItem(item);
      setMilitaryValue(item);
      setAnchorEl(null);
    };

    return (
      <div className={styles.container}>
        <p className="formLabel">{label}</p>
        <Button
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={handleClick}
          className={styles.button}>
          {isObject(selectedItem) ? (
            <div className={styles.selectedValue}>
              {selectedItem.name ||
                selectedItem.title ||
                selectedItem.label ||
                'Select One'}
            </div>
          ) : (
            <div className={styles.selectedValue}>
              {selectedItem || placeholder}
            </div>
          )}
          <ChevronDownIcon />
        </Button>
        <Menu
          id="simple-menu"
          className={fullWidth ? styles.menu : null}
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}>
          {data && isObject(data)
            ? Object.keys(data).map((item, key) => (
                <MenuItem key={key} onClick={() => selectHandler(data[item])}>
                  {data[item]}
                </MenuItem>
              ))
            : data.map((item, key) => (
                <MenuItem key={key} onClick={() => selectHandler(item)}>
                  {item.name || item.label || item}
                </MenuItem>
              ))}
        </Menu>
      </div>
    );
  },
);

MenuButton.defaultProps = {
  placeholder: 'Select One',
};

export default MenuButton;
