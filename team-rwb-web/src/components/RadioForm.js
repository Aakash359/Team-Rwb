import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from './RadioForm.module.css';

export default class RadioForm extends Component {
  render() {
    const listRadioItems = this.props.radioProps.map((i, index) => (
      <div
        className={[
          `${styles.radioInput} ${this.props.inline && styles.inlineContainer}`,
        ]}
        key={index}>
        <input
          type="radio"
          id={i.value}
          name={this.props.name}
          value={i.value}
          checked={i.value === this.props.value}
          onChange={(val) => this.props.onValueChange(val.target.value)}
        />
        <label htmlFor={i.value}>{i.label}</label>
      </div>
    ));
    return (
      <form className={`${styles.container} ${this.props.className}`}>
        <p className="formLabel">{this.props.label}</p>
        <p className="bodyCopyForm">{this.props.desc}</p>
        {listRadioItems}
        <p className={`errorMessage ${styles.error}`}>{this.props.error}</p>
      </form>
    );
  }
}

RadioForm.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  name: PropTypes.string.isRequired,
  radioProps: PropTypes.array,
  label: PropTypes.string.isRequired,
  desc: PropTypes.string,
  error: PropTypes.string,
};
