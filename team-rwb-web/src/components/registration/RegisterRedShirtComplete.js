import React, {Component} from 'react';
import RWBButton from '../RWBButton';
import styles from './Registration.module.css';
import RedShirtImage from '../../../../shared/images/RWBRedShirt.jpg';
import {logOrderConfirmation} from '../../../../shared/models/Analytics';

// NOTE: THIS IS A TEST FILE NOT USED

export default class RegisterRedShirtComplete extends Component {
  render() {
    return (
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <h3 className="title">Welcome Confirmation</h3>
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.formContainer}>
            <h4 className={styles.redShirtMotto}>Wear your Eagle with Pride</h4>
            <div>
              <img
                className={styles.imageContainer}
                src={RedShirtImage}
                alt="TeamRWB Red Shirt"
              />
            </div>
            <h2>Your order is complete!</h2>
            <p className="bodyCopy">
              Order confirmation number: <h3>#1234567890</h3>
            </p>
            <p>
              An email has also been sent to{' '}
              <span className="link">johnpaul@retronyms.com</span> with this
              confirmation number. A separate email will be sent once tracking
              information is ready. If you have any issues please contact us at{' '}
              <a className="link" href="mailto:info@teamrwb.org">
                info@teamrwb.org
              </a>
              .
            </p>
          </div>
          <div className={styles.buttonContainer}>
            <RWBButton
              link={true}
              to={'/feed'}
              label={'Complete'}
              buttonStyle={'primary'}
            />
          </div>
        </div>
      </div>
    );
  }
}
