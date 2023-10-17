import React, {Component} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import globalStyles, {RWBColors} from '../styles';

export default class ExpandingText extends Component {
  constructor(props) {
    super(props);
    this.state = {
      measuredOnce: false,
      measuredTwice: false,
      shouldShowReadMore: false,
      showAllText: true,
      fullHeight: null,
      limitedHeight: null,
    };
    this.handleLayout = this.handleLayout.bind(this);
  }

  handleLayout(layout) {
    if (this.state.measuredOnce === false) {
      this.setState({
        measuredOnce: true,
        fullHeight: layout.height,
        showAllText: false,
      });
      return;
    }

    if (
      this.state.measuredOnce === true &&
      this.state.measuredTwice === false
    ) {
      const shouldShowReadMore = this.state.fullHeight > layout.height;
      this.setState({
        measuredTwice: true,
        limitedHeight: layout.height,
        shouldShowReadMore,
      });
      return;
    }
  }

  render() {
    const {measuredOnce, showAllText, shouldShowReadMore} = this.state;
    const {numberOfLines, truncatedFooter, revealedFooter} = this.props;

    return (
      <View>
        <Text
          style={globalStyles.bodyCopy}
          numberOfLines={measuredOnce && !showAllText ? numberOfLines : 0}
          onLayout={(event) => this.handleLayout(event.nativeEvent.layout)}>
          {this.props.children}
        </Text>

        {shouldShowReadMore ? (
          <View>
            <TouchableOpacity
              onPress={() => this.setState({showAllText: !showAllText})}>
              {showAllText ? revealedFooter : truncatedFooter}
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  }
}
