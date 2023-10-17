import React from 'react';
import styles from './CountryModal.module.css';
import {Modal, Backdrop, Fade} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';

const _styles = {
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: 'var(--white)',
    boxShadow: null,
    padding: '20px',
    maxHeight: '90%',
    overflowY: 'scroll',
  },
};

const CountryModal = ({
  classes,
  title,
  isOpen,
  items,
  selectedValue,
  modalHandler,
  onSelect,
  placeholder,
}) => (
  <>
    <div className={styles.labelContainer} onClick={modalHandler}>
      <p className={`formLabel ${styles.label}`}>{title}</p>
      <p className="bodyCopyForm">
        {items[selectedValue]?.display
          ? items[selectedValue]?.display
          : placeholder}
      </p>
    </div>
    <Modal
      aria-labelledby="transition-modal-title"
      className={classes.modal}
      open={isOpen}
      onClose={modalHandler}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}>
      <Fade in={isOpen}>
        <div className={classes.paper}>
          {Object.keys(items).map((item, i) => (
            <h2
              key={i}
              className={[
                styles.h2,
                (items[item].value || 'US') === selectedValue &&
                  styles.selected,
              ].join(' ')}
              onClick={() => onSelect(items[item].value)}>
              {items[item].display}
            </h2>
          ))}
        </div>
      </Fade>
    </Modal>
  </>
);

export default withStyles(_styles)(CountryModal);
