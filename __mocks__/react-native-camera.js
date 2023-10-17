import { createComponent } from './utils/createComponent';

let RNCameraBase = createComponent('RNCamera');

class RNCamera extends RNCameraBase{
    static Constants = {
    Aspect: {},
    BarCodeType: {},
    Type: { back: 'back', front: 'front' },
    CaptureMode: {},
    CaptureTarget: {},
    CaptureQuality: {},
    Orientation: {},
    FlashMode: {},
    TorchMode: {},
  }
};

export {
    RNCamera
};