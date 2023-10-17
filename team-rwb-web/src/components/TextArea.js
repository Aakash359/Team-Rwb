import React, {useEffect, useState} from 'react';

import styles from './TextArea.module.css';

const TextArea = ({
  autoFocus,
  maxCharacters,
  placeholder,
  value,
  onChange,
  label,
  taggedUsers,
  error,
}) => {
  const lineHeight = 20;
  const [rows, setRows] = useState(1);
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  const checkNewLine = (textareaElement) => {
    const oldRows = textareaElement?.rows;
    const newRows = ~~(textareaElement?.scrollHeight / lineHeight);

    if (newRows === oldRows) {
      textareaElement.rows = newRows;
    }
    setRows(newRows);
  };

  useEffect(() => {
    const textareaElement = document.getElementById('textareaElement');
    checkNewLine(textareaElement);
  }, [taggedUsers]);

  return (
    <div className={styles.container}>
      <textarea
        id="textareaElement"
        value={value}
        rows={rows}
        className={`${styles.textArea} formInput`}
        placeholder={placeholder}
        onChange={(event) => {
          handleChange(event);
          checkNewLine(event);
        }}
        style={{lineHeight: `${lineHeight}px`}}
        maxLength={maxCharacters}
        autoFocus={autoFocus || false}
      />
      <label className="formLabel">{label}</label>
      {maxCharacters ? (
        <p className={styles.characterCount}>
          {value.length} / {maxCharacters}
        </p>
      ) : null}
      <p className="errorMessage">{error}</p>
    </div>
  );
};

export default TextArea;
