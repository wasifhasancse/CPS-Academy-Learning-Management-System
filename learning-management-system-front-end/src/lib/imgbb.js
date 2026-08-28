/**
 * ImgBB Image Upload Utility
 * API Reference: https://api.imgbb.com/
 */

const IMGBB_API_KEY = "07e805fdc8a1c6855e37aa4218e8f967";

/**
 * Upload an image file or base64 data to ImgBB.
 * @param {File | Blob | string} fileOrData - The image file object or base64 string
 * @returns {Promise<{ url: string, thumbUrl: string, deleteUrl: string }>}
 */
export async function uploadToImgBB(fileOrData) {
  if (!fileOrData) {
    throw new Error("No image file provided for upload.");
  }

  const formData = new FormData();
  formData.append("image", fileOrData);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData,
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    const errorMsg = json?.error?.message || "Failed to upload image to ImgBB.";
    throw new Error(errorMsg);
  }

  return {
    url: json.data.display_url || json.data.url,
    thumbUrl: json.data.thumb?.url || json.data.display_url || json.data.url,
    deleteUrl: json.data.delete_url || "",
  };
}
