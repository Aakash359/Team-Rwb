import React, {PureComponent} from 'react';
import {TextInput, TouchableOpacity, View} from 'react-native';

import globalStyles, {RWBColors} from '../styles';

// SVGs
import SearchIcon from '../../svgs/SearchIcon';
import ClearSearchIcon from '../../svgs/ClearSearchIcon';
import LocationIcon from '../../svgs/LocationIcon';

class SearchBar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {clearSearchShowing: false};
    this.clearSearch = this.clearSearch.bind(this);
    this.onSubmitSearch = this.onSubmitSearch.bind(this);
  }

  clearSearch() {
    const {onClearSearchPressed} = this.props;
    this.setState({clearSearchShowing: false}, () => onClearSearchPressed());
  }

  onSubmitSearch() {
    const {searchSubmit} = this.props;
    this.setState({clearSearchShowing: true}, () => searchSubmit());
  }

  render() {
    const {
      search,
      onSearchTextChange,
      onFocus,
      iconType,
      propClearSearchShowing,
      clearText,
    } = this.props;
    const {clearSearchShowing} = this.state;
    return (
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: RWBColors.white,
          padding: 4,
          borderRadius: 2,
          width: '90%',
          alignSelf: 'center',
          alignItems: 'center',
          borderRadius: 30,
          borderWidth: 1,
          borderColor: RWBColors.grey20,
        }}>
        {iconType === 'mapMarker' ? (
          <LocationIcon style={{height: 24, width: '10%'}} />
        ) : (
          <SearchIcon style={{height: 24, width: '10%'}} />
        )}
        <TextInput
          style={[globalStyles.formInput, {width: '80%', height: 34, top: 2}]}
          autoCorrect={false}
          placeholder={this.props.placeholder || 'Search'}
          placeholderTextColor={RWBColors.grey40}
          clearTextOnFocus={clearText !== undefined ? clearText : true}
          returnKeyType={'search'}
          onSubmitEditing={this.onSubmitSearch}
          onChangeText={onSearchTextChange}
          value={search}
          onFocus={onFocus}
        />

        {(clearSearchShowing || propClearSearchShowing) && (
          <TouchableOpacity
            style={{height: 24, width: '10%'}}
            onPress={this.clearSearch}>
            <ClearSearchIcon style={{height: 24, width: '100%'}} />
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

export default SearchBar;
