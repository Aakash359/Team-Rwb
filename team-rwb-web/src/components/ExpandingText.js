import React from 'react';
import styles from './ExpandingText.module.css';
import {useState} from 'react';

const ExpandingText = ({text, containerStyle}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <>
      {text && text.length > 0 && (
        <div className={`${containerStyle}`}>
          <p className={!isExpanded ? styles.lessText : null}>{text}</p>
          <br />
          <a
            className={styles.showMoreLink}
            onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Show less...' : 'Show more...'}
          </a>
        </div>
      )}
    </>
  );
};

export default ExpandingText;
