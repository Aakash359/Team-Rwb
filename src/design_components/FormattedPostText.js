import React from 'react';
import {Text} from 'react-native';
import globalStyles, {RWBColors} from '../styles';
import NavigationService from '../models/NavigationService';
import {
  separatePunctuation,
  lastCharSymbolRegex,
} from '../../shared/utils/FeedHelpers';

export default class FormattedPostText extends React.PureComponent {
  render() {
    const postText = this.props.text;
    const tagged = this.props.tagged;
    const linkableUsers = this.props.linkableUsers;
    const validPunctuation = [',', '.', '!', '?'];
    if (!tagged || !tagged.length)
      return <Text style={globalStyles.bodyCopy}>{postText}</Text>;
    let expectedNames = [];
    for (let i = 0; i < tagged.length; i++) {
      if (tagged[i].first_name)
        expectedNames.push(`${tagged[i].first_name} ${tagged[i].last_name}`);
      // this is primarily used for when a user tags someone in a comment and we want to display that tagged user at the bottom
      else if (tagged[i].name) expectedNames.push(tagged[i].name);
    }
    let words;
    if (postText) words = postText.split(' ');

    words = separatePunctuation(words, validPunctuation);
    const displayTaggedUser = (word, i) => {
      // remove punctuation at the end
      let formattedName = `${word} ${words[i + 1]}`.replace(
        lastCharSymbolRegex,
        '',
      );
      // if the word starts with @, check to see if it makes up a tagged user's name
      if (word.charAt(0) === '@') {
        formattedName = formattedName.slice(1);
        // TODO: This edgecase will take quite a while. Probably not worth the time.
        // formattedName = formattedName.split("@")[0]; // an extraodinary edgecase if a user does something like @user one-@user two
        // formattedName = formattedName.replace(lastCharSymbolRegex, '');

        // support more than two words in a name (currently only supporting 3 words)
        if (!expectedNames.includes(formattedName)) {
          formattedName = `${formattedName} ${words[i + 2]}`.replace(
            lastCharSymbolRegex,
            '',
          );
        }

        if (expectedNames.includes(formattedName)) {
          const userId = tagged[expectedNames.indexOf(formattedName)].id;
          return linkableUsers ? (
            <Text // Note, not using a TouchableOpacity because putting that inside a text component causes issues on android devices
              style={globalStyles.h3}
              accessible={true}
              accessibilityLabel={`Visit ${formattedName}'s profile`}
              accessibilityRole="button"
              onPress={() =>
                NavigationService.navigateIntoInfiniteStack(
                  'FeedProfileAndEventDetailsStack',
                  'profile',
                  {id: userId},
                )
              }>
              {/* avoid adding a space if the value after the name is a punctuation mark */}
              {`${formattedName}`}
              {validPunctuation.includes(words[i + 2]) ? '' : ' '}
            </Text>
          ) : (
            /* avoid adding a space if the value after the name is a punctuation mark */
            <Text style={globalStyles.h3}>
              {`${formattedName}`}
              {validPunctuation.includes(words[i + 2]) ? '' : ' '}
            </Text>
          );
        } else {
          return (
            <Text style={globalStyles.bodyCopy}>
              {word}
              {validPunctuation.includes(words[i + 1]) ? '' : ' '}
            </Text>
          );
        }
      }
      // add anything that isn't the last name of a tagged user, as the last name gets added above
      else if (
        !expectedNames.includes(
          `${words[i - 1]} ${words[i].replace(lastCharSymbolRegex, '')}`.slice(
            1,
          ),
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
      ) {
        return (
          <Text>
            {word}
            {validPunctuation.includes(words[i + 1]) ? '' : ' '}
          </Text>
        );
      }
    };
    return (
      <Text style={globalStyles.bodyCopy}>
        {React.Children.map(words, displayTaggedUser)}
      </Text>
    );
  }
}
