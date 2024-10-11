// C:\Users\sefan\Desktop\AE1\AE1\src\utils\validation.js
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

export const validatePhotoUrl = (url) => {
  if (!url) return "Photo URL is required";
  if (!isValidUrl(url)) return "Invalid URL format";
  return null;
};