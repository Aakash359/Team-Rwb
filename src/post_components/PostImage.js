import React, {PureComponent} from 'react';
import {Image} from 'react-native';

export default class PostImage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};

    Image.getSize(
      this.props.source,
      (width, height) => {
        // somehow an csv was uploaded as an image
        // height and width are both zero, creating NAN for aspect ratio, crashing iOS devices
        if (width === 0 || height === 0)
          this.setState({imgAspectRatio: 'invalid'});
        else this.setState({imgAspectRatio: width / height});
      },
      (err) => {
        // unknown image format happens with the csv file
        if (err.toString() === 'Error: unknown image format')
          this.setState({imgAspectRatio: 'invalid'});
        else this.setState({imgAspectRatio: 3 / 4});
      },
    );
  }

  render() {
    const {imgAspectRatio} = this.state;
    return (
      imgAspectRatio !== 'invalid' && (
        <Image
          resizeMode="cover"
          style={[
            {
              width: '100%',
              borderRadius: 5,
              aspectRatio: imgAspectRatio <= 3 / 4 ? 3 / 4 : imgAspectRatio,
            },
            this.props.customStyles,
          ]}
          source={{uri: this.props.source}}
          alt={this.props.alt}
        />
      )
    );
  }
}
