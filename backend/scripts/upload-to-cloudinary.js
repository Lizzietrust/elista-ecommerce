import { uploadMultipleImages } from "@/lib/cloudinary/config";
import { interiorProducts } from "@/data/interior-products";

async function uploadAllProductImages() {
  console.log("Starting image upload to Cloudinary...");

  for (const product of interiorProducts) {
    console.log(`Uploading images for: ${product.name}`);

    const uploadedImages = await uploadMultipleImages(
      product.images,
      "interior-products",
    );

    // Update product with Cloudinary URLs
    product.images = uploadedImages.map((img) => img.url);
    product.imageData = uploadedImages;

    console.log(
      `✓ Uploaded ${uploadedImages.length} images for ${product.name}`,
    );

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("All images uploaded successfully!");
  return interiorProducts;
}

// Run the upload
uploadAllProductImages().catch(console.error);
