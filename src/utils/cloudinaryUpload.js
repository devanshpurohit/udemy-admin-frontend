import { getCloudinarySignature } from "../services/courseService";
import axios from "axios";

/**
 * Utility to upload files directly to Cloudinary using signed requests
 * @param {File} file - The file object to upload
 * @param {string} folder - The Cloudinary folder to upload to
 * @param {Function} onProgress - Optional callback for upload progress
 * @returns {Promise<string>} - The secure URL of the uploaded resource
 */
export const uploadToCloudinary = async (file, folder = 'udemy/videos', onProgress = null) => {
  try {
    // 1. Get signature from backend
    const signResponse = await getCloudinarySignature(folder);
    if (!signResponse.success) {
      throw new Error(signResponse.message || "Failed to get Cloudinary signature");
    }

    const { signature, timestamp, cloudName, apiKey } = signResponse.data;

    const resourceType = file.type.startsWith('video/') ? 'video' : 'auto';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    // 2. Setup chunk upload
    const chunkSize = 20 * 1024 * 1024; // 20 MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uniqueUploadId = Math.random().toString(36).substring(2, 15);
    
    let secureUrl = null;

    // 3. Upload chunks
    for (let currentChunk = 0; currentChunk < totalChunks; currentChunk++) {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("file", chunk);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", folder);

      const headers = {
        "X-Unique-Upload-Id": uniqueUploadId,
        "Content-Range": `bytes ${start}-${end - 1}/${file.size}`,
      };

      const response = await axios.post(uploadUrl, formData, {
        headers,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            // Calculate overall progress based on chunk
            const maxUploaded = start + progressEvent.loaded;
            const percentCompleted = Math.round((maxUploaded * 100) / file.size);
            onProgress(percentCompleted > 100 ? 100 : percentCompleted);
          }
        }
      });

      // The last chunk will return the full response with secure_url
      if (response.data && response.data.secure_url) {
        secureUrl = response.data.secure_url;
      }
    }

    if (!secureUrl) {
      throw new Error("Upload completed but no secure URL was returned from Cloudinary.");
    }

    return secureUrl;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error(error.response?.data?.error?.message || error.message || "Cloudinary upload failed");
  }
};
