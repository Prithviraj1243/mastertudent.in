import { supabaseAdmin } from './supabase';
import crypto from 'crypto';
import path from 'path';
import { readFileSync } from 'fs';

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  filePath?: string;
  error?: string;
}

/**
 * Supabase Storage Integration
 * 
 * This module handles file uploads to Supabase Storage
 * Storage bucket: 'notes-files'
 */

const STORAGE_BUCKET = process.env.SUPABASE_BUCKET_NAME || 'notes';

/**
 * Upload a file to Supabase Storage
 * @param file - Multer file object
 * @param userId - User ID who is uploading
 * @param subject - Subject category for organization
 * @returns Upload result with file URL
 */
export async function uploadToSupabase(
  file: Express.Multer.File,
  userId: string,
  subject: string
): Promise<UploadResult> {
  try {
    // Generate unique file name
    const fileExt = path.extname(file.originalname);
    const fileName = `${crypto.randomUUID()}${fileExt}`;
    
    // Organize files: userId/subject/fileName
    const filePath = `${userId}/${subject}/${fileName}`;

    // Read file buffer
    const fileBuffer = readFileSync(file.path);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
        upsert: false,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    console.log('✅ File uploaded to Supabase:', filePath);

    return {
      success: true,
      fileUrl: urlData.publicUrl,
      filePath: filePath,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload multiple files to Supabase Storage
 * @param files - Array of Multer file objects
 * @param userId - User ID who is uploading
 * @param subject - Subject category for organization
 * @returns Array of upload results
 */
export async function uploadMultipleToSupabase(
  files: Express.Multer.File[],
  userId: string,
  subject: string
): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => 
    uploadToSupabase(file, userId, subject)
  );
  
  return Promise.all(uploadPromises);
}

/**
 * Delete a file from Supabase Storage
 * @param filePath - Path to file in storage
 * @returns Success status
 */
export async function deleteFromSupabase(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      return false;
    }

    console.log('✅ File deleted from Supabase:', filePath);
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

/**
 * Get signed URL for private file access
 * @param filePath - Path to file in storage
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL or null
 */
export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Signed URL error:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Get signed URL error:', error);
    return null;
  }
}

/**
 * List all files for a user
 * @param userId - User ID
 * @param subject - Optional subject filter
 * @returns Array of file paths
 */
export async function listUserFiles(
  userId: string,
  subject?: string
): Promise<string[]> {
  try {
    const prefix = subject ? `${userId}/${subject}` : userId;
    
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .list(prefix);

    if (error) {
      console.error('List files error:', error);
      return [];
    }

    return data.map(file => `${prefix}/${file.name}`);
  } catch (error) {
    console.error('List files error:', error);
    return [];
  }
}

export default {
  uploadToSupabase,
  uploadMultipleToSupabase,
  deleteFromSupabase,
  getSignedUrl,
  listUserFiles,
};
