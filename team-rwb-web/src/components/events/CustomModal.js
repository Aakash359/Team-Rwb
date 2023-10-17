import React from 'react';
import styles from './CustomModal.module.css';
import {Modal, Backdrop, Fade} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import XIcon from '../svgs/XIcon';

const _styles = {
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: 'var(--white)',
    boxShadow: null,
    padding: '30px',
    maxHeight: '90%',
    overflowY: 'scroll',
    position: 'relative',
  },
};

const CustomModal = ({
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
        {items[selectedValue]?.display || placeholder || selectedValue}
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
          <div className={styles.xIconContainer} onClick={modalHandler}>
            <XIcon width={30} height={30} tintColor={'var(--grey80)'} />
          </div>
          {Object.keys(items).map((item, i) => (
            <h2
              key={i}
              className={[
                styles.h2,
                (items[item].slug || 'all-activities') === selectedValue &&
                  styles.selected,
              ].join(' ')}
              onClick={() => onSelect(items[item].slug || items[item])}>
              {items[item].display || items[item]}
            </h2>
          ))}
        </div>
      </Fade>
    </Modal>
  </>
);

export default withStyles(_styles)(CustomModal);
