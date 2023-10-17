import React, {Component} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import globalStyles, {RWBColors} from '../styles';

export class CustomScrollablePickerList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      expandAnimation: new Animated.Value(0),
    };
  }

  toggle() {
    let finalValue = !this.state.expanded ? 150 : 0;
    this.setState({
      expanded: !this.state.expanded,
    });
    Animated.timing(this.state.expandAnimation, {
      toValue: finalValue,
      duration: 250,
    }).start();
  }

  componentDidUpdate() {
    if (this.props.visible == false) {
      Animated.timing(this.state.expandAnimation, {
        toValue: 0,
        duration: 250,
      }).start();
      if (this.state.expanded == true) {
        this.setState({expanded: false});
      }
    }
  }

  render() {
    return (
      <View>
        <TouchableOpacity onPress={() => this.props.onPress() + this.toggle()}>
          {this.props.label ? (
            <Text style={globalStyles.formLabel}>{this.props.label}</Text>
          ) : null}
          {this.props.currentValue}
        </TouchableOpacity>
        <Animated.View style={{height: this.state.expandAnimation}}>
          <View style={{marginVertical: 25}}>
            <ScrollView
              nestedScrollEnabled={true}
              contentContainerStyle={{
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {this.props.children}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    );
  }
}

class CustomScrollablePickerItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <TouchableOpacity onPress={() => this.props.onPress()}>
        <Text
          style={[
            styles.selectableItem,
            this.props.selected ? styles.selected : null,
          ]}>
          {this.props.text}
        </Text>
      </TouchableOpacity>
    );
  }
}

export function generateCustomPickerItems(
  filter_options,
  filter_type,
  stateFilterType,
  onPress,
) {
  const entries = Object.entries(filter_options);
  return entries.map((entry, i) => {
    return (
      <CustomScrollablePickerItem
        key={`${filter_type}-${i}`}
        selected={stateFilterType === entry[1].slug}
        text={entry[1].display}
        value={entry[0]}
        onPress={() => onPress(filter_type, entry[1].slug)}
      />
    );
  });
}

const styles = StyleSheet.create({
  selectableItem: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 20,
    color: RWBColors.grey40,
  },
  selected: {
    color: RWBColors.magenta,
  },
});
