'use strict';

import React from 'react';
import {StyleSheet, Text} from 'react-native';
import HTMLView from 'react-native-htmlview';
import ExpandingText from './ExpandingText';

import globalStyles, {RWBColors} from '../styles';

export default class RWBhtmlView extends React.PureComponent {
  unescapeNewlines = (string) => {
    // Needs to be regex for the //g flag.
    // Lets .replace find and replace all instances.
    return string.replace(/\\n/g, '\n');
  };

  render() {
    const {htmlContent} = this.props;
    return (
      <HTMLView
        value={this.unescapeNewlines(htmlContent)}
        stylesheet={htmlStyles}
        RootComponent={(element) => (
          <ExpandingText
            numberOfLines={4}
            truncatedFooter={
              <Text style={globalStyles.link}>Show More...</Text>
            }
            revealedFooter={<Text style={globalStyles.link}>Show Less</Text>}
            {...element}
          />
        )}
      />
    );
  }
}

const htmlStyles = StyleSheet.create({
  a: globalStyles.link,
  b: {
    fontWeight: 'bold',
  },
  i: {
    fontStyle: 'italic',
  },
  s: {
    textDecorationLine: 'line-through',
  },
  u: {
    textDecorationLine: 'underline',
  },
});
