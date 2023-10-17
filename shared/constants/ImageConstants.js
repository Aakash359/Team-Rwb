'use strict';

const extensions = {
    jpeg: 'jpeg',
    jpg: 'jpg',
    png: 'png',
    gif: 'gif',
    heif: 'heif', //apple still photo
    heic: 'heic',
    plist: 'plist', //apple's way of saving edited photos on iOS 13+
};

const mimetypes = {
    jpg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    heic: 'image/heic',
    heicSequence: 'image/heic-sequence'
};

export { extensions as EXTENSIONS, mimetypes as MIMETYPES };
