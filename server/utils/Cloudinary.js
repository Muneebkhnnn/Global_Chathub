import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (buffer, options = {}) => {
  try {
    if (!buffer) {
      console.log('No buffer provided');
      return null;
    }

    // Return a promise for Cloudinary upload
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          secure: true, // Force HTTPS
          ...options
        },
        (error, result) => {
          if (error) {
            console.log('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('File uploaded to Cloudinary:', result.url);
            resolve(result);
          }
        }
      );

      // Write the buffer to the upload stream
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.log('Cloudinary upload error:', error);
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Deleted from Cloudinary, public id:', publicId);
    return result;
  } catch (error) {
    console.log('Error deleting from Cloudinary', error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };