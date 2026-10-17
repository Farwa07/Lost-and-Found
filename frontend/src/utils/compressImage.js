// Shrinks large photos in the browser before upload: phone pictures of 4-8 MB
// become a few hundred KB, which uploads faster on mobile data and uses less
// storage. Small images, GIFs and non-images (PDF) are returned unchanged.
const MAX_DIMENSION = 1600;
const QUALITY = 0.85;
const SKIP_BELOW_BYTES = 400 * 1024;

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read image"));
    };
    image.src = url;
  });

export default async function compressImage(file) {
  if (!file?.type?.startsWith("image/") || file.type === "image/gif" || file.size < SKIP_BELOW_BYTES) {
    return file;
  }

  try {
    const image = await loadImage(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.round(image.naturalWidth * scale);
    const height = Math.round(image.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    // PNGs with transparency would turn black as JPEG; paint a white background first.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}
