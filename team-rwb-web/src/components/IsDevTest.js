import React, {Component} from 'react';

import {isDev} from '../../../shared/utils/IsDev';

export default class IsDevTest extends Component {
  render() {
    const isDevString = isDev()
      ? 'Environment is development.'
      : 'Environment is not development.';
    return <div> {isDevString} </div>;
  }
}
