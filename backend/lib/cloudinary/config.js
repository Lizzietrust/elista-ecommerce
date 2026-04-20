import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageFromUrl = async (
  imageUrl,
  folder = "interior-products",
) => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: folder,
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      thumbnail: result.secure_url.replace(
        "/upload/",
        "/upload/w_200,h_200,c_fill/",
      ),
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
};

// Helper to upload multiple images
export const uploadMultipleImages = async (
  imageUrls,
  folder = "interior-products",
) => {
  const uploadPromises = imageUrls.map((url) =>
    uploadImageFromUrl(url, folder),
  );
  const results = await Promise.all(uploadPromises);
  return results.filter((result) => result !== null);
};

// Export cloudinary instance as default
export default cloudinary;
