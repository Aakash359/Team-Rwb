import React, {PureComponent} from 'react';
import styles from './ShirtSizesModal.module.css';
import {Modal, Backdrop, Fade} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';

import {SHIRTSIZE_DATA} from '../../../../shared/constants/ShirtSizeData';
import RWBButton from '../RWBButton';

const _styles = {
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

const ShirtSizesModal = ({classes, isOpen, modalHandler}) => (
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
      <div className={styles.container}>
        <h2 className={styles.mainText}>{'Size Chart'}</h2>
        <div className={styles.contentContainer}>
          {SHIRTSIZE_DATA.map((item, index, separators) => {
            const {type, cells} = item;
            if (type === 'header') {
              return (
                <div className={styles.headerContainer}>
                  <p className={styles.headerText}>{item.cells[0]}</p>
                </div>
              );
            } else if (type === 'legend') {
              return (
                <div className={styles.legendContainer}>
                  {cells.map((cell, i) => (
                    <p className={styles.legendText}>{cell}</p>
                  ))}
                </div>
              );
            } else {
              return (
                <div className={styles.rowContainer}>
                  {cells.map((cell, i) => (
                    <p className={styles.rowText}>{cell}</p>
                  ))}
                </div>
              );
            }
          })}
        </div>
        <RWBButton
          onClick={modalHandler}
          label="Close"
          buttonStyle="secondary"
        />
      </div>
    </Fade>
  </Modal>
);

export default withStyles(_styles)(ShirtSizesModal);
