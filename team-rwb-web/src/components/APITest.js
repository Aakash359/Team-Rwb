import React, {Component} from 'react';
import {rwbApi} from '../../../shared/apis/api';

export default class componentName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      succeeded: false,
      executed: false,
    };
  }
  componentDidMount() {
    rwbApi
      .loginUser('adam+d1908_00@retronyms.com', 'aaaaaaaa')
      .then((json) => {
        console.log(json);
        this.setState({succeeded: true});
      })
      .catch((e) => console.warn(e))
      .finally(() => this.setState({executed: true}));
  }
  render() {
    const {succeeded, executed} = this.state;
    const result = executed
      ? succeeded
        ? 'Succeeded'
        : 'Failed'
      : 'Unexecuted';
    return (
      <div>
        {' '}
        <p>API Call Test Component</p>
        <p>Result: {result}</p>
      </div>
    );
  }
}
