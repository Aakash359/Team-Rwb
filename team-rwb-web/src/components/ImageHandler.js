import {rwbApi} from '../../../shared/apis/api';

// this file handles uploading and setting images
// this primarily is used to ensure any photos that should be sent to azure do, and we use their url
const imageHandler = async (file, type) => {
  const validTypes = ['cover', 'profile', 'event', 'post'];
  if (!validTypes.includes(type))
    throw new Error(
      "imageHandler expects a type of 'cover', 'profile', 'event', or 'post'",
    );
  const reader = new FileReader();
  if (file) {
    if (type === 'profile') {
      return new Promise((resolve, reject) => {
        reader.readAsDataURL(file);
        reader.onload = () => {
          resolve(reader.result);
        };
      });
    } else {
      return new Promise((resolve, reject) => {
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
          const data = {
            media_filename: file.name.replace(/ /g, ''), //avoid spaces in the name used for the url
            media_intent: 'cover',
          };
          let imgBlob = new Blob([reader.result], {type: file.type});
          return rwbApi
            .getMediaUploadURL(JSON.stringify(data))
            .then((result) => {
              const mediaURL = result.data;
              return rwbApi.putMediaUpload(mediaURL, imgBlob).then(() => {
                const imageURL = mediaURL.split('?')[0];
                resolve(imageURL);
              });
            });
        };
      });
    }
  }
};

export default imageHandler;
