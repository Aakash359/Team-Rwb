import React, {Component} from 'react';
import {
  version as WebAppVersion,
  build as WebAppBuild,
} from '../../package.json';

export default class BuildInfo extends Component {
  render() {
    return (
      <div className="build-info" style={{display: 'none'}}>
        <div className="version">Version number {WebAppVersion}</div>
        <div className="build">Build number {WebAppBuild}</div>
      </div>
    );
  }
}
