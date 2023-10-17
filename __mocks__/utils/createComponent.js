import React from 'react';
import { View } from 'react-native';

export const createComponent = function(name) {
  return class extends React.Component {
    // overwrite the displayName, since this is a class created dynamically
    static displayName = name;

    render() {
      return React.createElement(View, this.props, this.props.children);
    }
  };
};