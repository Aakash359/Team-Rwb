import React, {Component} from 'react';
import RWBButton from '../RWBButton';
import styles from './Registration.module.css';
import RedShirtImage from '../../../../shared/images/RWBRedShirt.jpg';
import {logGetRedShirt} from '../../../../shared/models/Analytics';
import {withRouter} from 'react-router-dom';

const REDSHIRT_COPY =
  'You are eligible for one free Nike Team RWB shirt*, just pay $5 for shipping and handling. The Nike Challenger Short-Sleeve Running Top is made of 100% recycled polyester material with Dri-FIT fabric technology that wicks sweat away from the skin to help keep you cool and dry. The short sleeves and round neck offer a comfortable fit, and the shirt is designed with the Nike Swoosh trademark in reflective heat transfer material at the left chest. Dri-FIT trademark heat transfer at the bottom hem.';
const REDSHIRT_NOTE =
  '*or a comparable moisture-wicking shirt, depending on size availability.';

class RegisterRedShirt extends Component {
  state = {
    partial_user: null,
  };

  componentDidMount() {
    const partial_user = this.props.location.state?.value || null; //cannot be done in constructor
    if (partial_user === null)
      throw new Error('RegisterRedShirt must be provided a navigation value.');
    this.setState({
      partial_user,
    });
  }

  logInfo = () => {
    let analyticsObj = {};
    if (this.props.location.state && this.props.location.state.from)
      analyticsObj.previous_view = this.props.location.state.from;
    logGetRedShirt(analyticsObj);
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <h3 className="title">Welcome to the Team!</h3>
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.formContainer}>
            <h4 className={styles.redShirtMotto}>
              Wear your Eagle with Pride!
            </h4>
            <div>
              <img
                className={styles.imageContainer}
                src={RedShirtImage}
                alt="TeamRWB Red Shirt"
              />
            </div>
            <p className="bodyCopy">{REDSHIRT_COPY}</p>
            <p className="radioFormLabel">{REDSHIRT_NOTE}</p>
          </div>
          <div className={styles.buttonContainer}>
            <RWBButton
              link={true}
              to={{
                pathname: '/registration/shipping_info',
                state: {value: this.state.partial_user, from: 'Welcome to the Team!'},
              }}
              label={'GET MY RED SHIRT!'}
              onClick={this.logInfo}
              buttonStyle={'primary'}
            />
            <RWBButton
              link={true}
              to={{
                pathname: '/feed',
                state: {newAccount: true},
              }}
              label={'No Thanks'}
              buttonStyle={'tertiary'}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(RegisterRedShirt);
