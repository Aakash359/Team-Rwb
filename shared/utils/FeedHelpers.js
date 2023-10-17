export function separatePunctuation(words, validPunctuation) {
  if (!words) return words; // edge case of no words
  let updatedWords = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (validPunctuation.includes(word.charAt(word.length - 1))) {
      // add the word without the punctuation
      updatedWords.push(word.slice(0, word.length - 1));
      // add the punctuation
      updatedWords.push(word.slice(word.length - 1));
    }
    else {
      updatedWords.push(word);
    }
  }
  return updatedWords;
}

export function formatEventCardTitle(eventTitle) {
  if (eventTitle) {
    if (eventTitle.length > 30) return `${eventTitle.substring(0, 27)}...`.toUpperCase();
    else return eventTitle.toUpperCase();
  }
  else return 'INVALID EVENT';
}

  // filter out the pinned post that would show up in the feed
export function isPostVisible(pinnedPost, item) {
    if (pinnedPost === undefined || pinnedPost === []) return true;
    return (
      item.activities[0].id !== pinnedPost[0].activities[0].id ||
      (item.activities[0].id === pinnedPost[0].activities[0].id &&
        item.activities[0].is_pinned)
    );
  };

export const lastCharSymbolRegex = /[.,\/#!$%\^&\*;:{}=\-_`~()]$/;
