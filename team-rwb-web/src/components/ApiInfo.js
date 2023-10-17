import React, {Component} from 'react';
import {DOMAIN, ENVIRONMENT} from '../../../shared/constants/URLs';

export default class ApiInfo extends Component {
  render() {
    return (
      <>
        {window.location.host !== 'members.teamrwb.org' && (
          <div>
            <p>Current API Server: {DOMAIN}</p>
            <p>Environment: {ENVIRONMENT}</p>
            <p>Note: This info is not rendered on production.</p>
          </div>
        )}
      </>
    );
  }
}
