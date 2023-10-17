'use strict';

export function isDev() {
    return process.env.REACT_APP_FORCE_ISDEV_TRUE === '1' || process.env.NODE_ENV === 'development';
}
