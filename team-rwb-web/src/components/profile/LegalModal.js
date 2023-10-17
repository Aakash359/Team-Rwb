import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import PrivacyPolicyCopy from './PrivacyPolicyCopy';
import LegalWaiver from './LegalWaiver';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    overflowY: 'scroll',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'justify',
    height: '90%',
    width: '60%',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  goBackButton: {
    width: '150px',
    padding: '15px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '5px',
    backgroundColor: 'var(--magenta)',
    color: 'white',
    alignSelf: 'center',
    marginTop: '20px',
    cursor: 'pointer',
  },
}));

export default function LegalModal({modalHandler, type}) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={open}
        onClose={() => modalHandler(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}>
        <Fade in={open}>
          <div className={classes.paper}>
            {type === 'privacy' ? <PrivacyPolicyCopy /> : <LegalWaiver />}
            <div
              className={classes.goBackButton}
              onClick={() => modalHandler(false)}>
              Go Back
            </div>
          </div>
        </Fade>
      </Modal>
    </div>
  );
}
