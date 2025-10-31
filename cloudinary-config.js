// Cloudinary Configuration for File Storage
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary config with your credentials
const cloudinaryConfig = {
  cloud_name: "Root",
  api_key: "592113722334363",
  api_secret: "E75jAy0Vg34M_o1wRosI7-bWzfI"
};

// Configure Cloudinary
cloudinary.config(cloudinaryConfig);

// Helper functions for file operations
export const uploadFile = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto", // Automatically detect file type
      folder: "masterstudent/notes", // Organize files in folders
      ...options
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

export const getFileUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    resource_type: "auto",
    ...options
  });
};

export { cloudinary };
export default cloudinaryConfig;
