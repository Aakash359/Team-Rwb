import React, {PureComponent} from 'react';
import styles from './Registration.module.css';
import RWBButton from '../RWBButton';
import RedShirtImage from '../../../../shared/images/RWBRedShirt.jpg';
import {withRouter} from 'react-router-dom';
import {TEAMRWB} from '../../../../shared/constants/URLs';
import {logOrderConfirmation} from '../../../../shared/models/Analytics';

class RegisterOrderConfirmation extends PureComponent {
  constructor(props) {
    super(props);
    this.receiptEmail = props.location.state?.receiptEmail || null;
    this.emailMessage = `A receipt has been sent to ${this.receiptEmail}. You will receive a separate email once tracking information is ready. If you have any questions or issues please contact us at `;
  }

  logInfo = () => {
    let analyticsObj = {};
    if (this.props.location.state && this.props.location.state.from)
      analyticsObj.previous_view = this.props.location.state.from;
    logOrderConfirmation(analyticsObj);
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <h3 className="title">Order Confirmation</h3>
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.formContainer}>
            <p className={styles.redShirtMottoOrderConfirmation}>
              Wear your Eagle with Pride!
            </p>
            <div>
              <img
                className={styles.imageContainer}
                src={RedShirtImage}
                alt="TeamRWB Red Shirt"
              />
            </div>
            <p className="bodyCopy">Your order is complete!</p>
            <p className={`bodyCopy ${styles.emailMessage}`}>
              {this.emailMessage}{' '}
              <a className="link" href={'mailto:' + 'weartheeagle@teamrwb.org'}>
                weartheeagle@teamrwb.org.
              </a>{' '}
            </p>
          </div>
          <div className={styles.buttonContainer}>
            <RWBButton
              link={true}
              onClick={this.logInfo}
              to={'/feed'}
              state={{from: 'Order Confirmation'}}
              label={'Continue'}
              buttonStyle={'primary'}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(RegisterOrderConfirmation);
