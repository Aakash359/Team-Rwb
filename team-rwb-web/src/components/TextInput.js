import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from './TextInput.module.css';

export default class TextInput extends Component {
  render() {
    const {
      type,
      name,
      value,
      onValueChange,
      label,
      error,
      onEnter,
      maxCharacters,
      reducedMargin,
      autoFillLabel,
      className,
      min,
      placeholder,
    } = this.props;
    return (
      <div
        className={`${styles.container} ${
          reducedMargin ? styles.reducedMargin : null
        } ${className}`}>
        {/* Input type can be: text, password, email, tel, or url */}
        <input
          placeholder={placeholder}
          name={name}
          className={`${styles.textInput} formInput`}
          type={type}
          maxLength={maxCharacters}
          value={value}
          onChange={onValueChange}
          required //TODO: Remove this, use min or maybe value for :valid selector
          onKeyDown={(e) => e.key === 'Enter' && onEnter && onEnter()}
          autoComplete={autoFillLabel}
          min={min}
        />
        <label htmlFor="input" className={styles.label}>
          {label}
        </label>
        <p className="errorMessage">{error && error}</p>
        {maxCharacters ? (
          <p className={styles.characterCount}>
            {value.length} / {maxCharacters}
          </p>
        ) : null}
      </div>
    );
  }
}

TextInput.defaultProps = {
  type: 'text',
};

TextInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
};
