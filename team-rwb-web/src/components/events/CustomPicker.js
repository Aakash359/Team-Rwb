import React from 'react';
import styles from './CustomPicker.module.css';

const CustomPicker = ({
  title,
  isOpen,
  items,
  selectedValue,
  pickerHanlder,
  onSelect,
}) => (
  <>
    <div className={styles.labelContainer} onClick={pickerHanlder}>
      <p className={`formLabel ${styles.label}`}>{title}</p>
      <p className="bodyCopyForm">{items[selectedValue]?.display}</p>
    </div>
    <div className={isOpen ? styles.contentContainer : styles.invisible}>
      {isOpen &&
        Object.keys(items).map((item, i) => (
          <h2
            key={i}
            className={[
              styles.h2,
              items[item].slug === selectedValue && styles.selected,
            ].join(' ')}
            onClick={() => onSelect(items[item].slug)}>
            {items[item]?.display}
          </h2>
        ))}
    </div>
  </>
);

export default CustomPicker;
