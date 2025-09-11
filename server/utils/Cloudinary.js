import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log('No local file path provided');
      return null;
    }
    
    console.log('Attempting to upload file:', localFilePath);
    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET 
    });
    
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });
    
    console.log('file uploaded on cloudinary source:' + response.url);
    //once file uploaded we will delete it from our local storage / server
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log('Cloudinary upload error:', error.message);
    console.log('Error details:', error);
    // will Only delete file if it exists
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('deleted from cloudinary , public id:', publicId);
  } catch (error) {
    console.log('error deleting from cloudinary', error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
