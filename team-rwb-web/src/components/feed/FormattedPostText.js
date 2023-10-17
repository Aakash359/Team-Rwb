import React from 'react';
import styles from './FormattedPostText.module.css';
import {
  separatePunctuation,
  lastCharSymbolRegex,
} from '../../../../shared/utils/FeedHelpers';

const validPunctuation = [',', '.', '!', '?'];

const FormattedPostText = ({
  text,
  tagged,
  linkableUsers,
  history,
  clickable,
}) => {
  if (!tagged || !tagged.length) {
    return (
      <div className={styles.container}>
        <p className={`bodyCopy ${styles.postText}`}>{text}</p>
      </div>
    );
  }
  let expectedNames = [];
  for (let i = 0; i < tagged.length; i++) {
    expectedNames.push(`${tagged[i].first_name} ${tagged[i].last_name}`);
  }
  let words;
  if (text) words = text.split(' ');

  words = separatePunctuation(words, validPunctuation);

  return (
    <div className={`bodyCopy ${styles.container}`}>
      {!words
        ? null
        : words.map((word, i) => {
            let formattedName = `${word} ${words[i + 1]}`.replace(
              lastCharSymbolRegex,
              '',
            );
            if (word.charAt(0) === '@') {
              formattedName = formattedName.slice(1);
              // support more than two words in name
              if (!expectedNames.includes(formattedName)) {
                formattedName = `${formattedName} ${words[i + 2]}`.replace(
                  lastCharSymbolRegex,
                  '',
                );
              }
              if (expectedNames.includes(formattedName)) {
                const userId = tagged[expectedNames.indexOf(formattedName)].id;
                return linkableUsers ? (
                  <h3
                    key={i}
                    className={styles.fullName}
                    onClick={() =>
                      clickable && history.push(`/profile/${userId}`)
                    }>
                    {/* avoid adding a space if the value after the name is a punctuation mark */}
                    {`${formattedName}`}
                    {validPunctuation.includes(words[i + 2]) ? '' : ' '}
                  </h3>
                ) : (
                  <h3
                    key={i}
                    className={styles.fullName}
                    onClick={() =>
                      clickable && history.push(`/profile/${userId}`)
                    }>
                    {/* avoid adding a space if the value after the name is a punctuation mark */}
                    {`${formattedName}`}
                    {validPunctuation.includes(words[i + 2]) ? '' : ' '}
                  </h3>
                );
              } else {
                return (
                  <p key={i} style={{display: 'inline'}}>
                    {word}
                    {validPunctuation.includes(words[i + 1]) ? '' : ' '}
                  </p>
                );
              }
            } // add anything that isn't the last name of a tagged user, as the last name gets added above
            else if (
              // remove the first name
              !expectedNames.includes(
                `${words[i - 1]} ${word.replace(
                  lastCharSymbolRegex,
                  '',
                )}`.slice(1),
              ) && // used for three worded names
              !expectedNames.includes(
                `${words[i - 2]} ${words[i - 1]} ${word.replace(
                  lastCharSymbolRegex,
                  '',
                )}`.slice(1),
              ) && // used for three worded names
              !expectedNames.includes(
                `${words[i - 1]} ${word} ${words[i + 1]?.replace(
                  lastCharSymbolRegex,
                  '',
                )}`.slice(1),
              )
            )
              return (
                <p key={i} style={{display: 'inline'}}>
                  {word}
                  {validPunctuation.includes(words[i + 1]) ? '' : ' '}
                </p>
              );
          })}
    </div>
  );
};

export default FormattedPostText;
