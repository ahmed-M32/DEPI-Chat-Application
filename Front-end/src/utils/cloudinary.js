/**
 * Converts and optimizes an image file to a base64 string.
 * - Validates type/size
 * - Downscales to a max dimension
 * - Encodes as WebP where possible, falling back to the original type
 * @param {File} file
 * @returns {Promise<{success: boolean, url?: string, error?: string, originalFile?: object}>}
 */
export const convertImageToBase64 = (file) => {
    const MAX_DIMENSION = 1280;
    const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

    return new Promise((resolve) => {
        try {
            if (!file) {
                resolve({
                    success: false,
                    error: "No file provided",
                });
                return;
            }

            if (!file.type.match("image.*")) {
                resolve({
                    success: false,
                    error: "Not an image file",
                });
                return;
            }

            if (file.size > MAX_SIZE_BYTES) {
                resolve({
                    success: false,
                    error: "Image is too large",
                });
                return;
            }

            const image = new Image();
            const url = URL.createObjectURL(file);

            image.onload = () => {
                try {
                    let { width, height } = image;

                    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                        const scale = Math.min(
                            MAX_DIMENSION / width,
                            MAX_DIMENSION / height
                        );
                        width = Math.round(width * scale);
                        height = Math.round(height * scale);
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");

                    if (!ctx) {
                        URL.revokeObjectURL(url);
                        resolve({
                            success: false,
                            error: "Unable to process image",
                        });
                        return;
                    }

                    ctx.drawImage(image, 0, 0, width, height);

                    let dataUrl;
                    try {
                        dataUrl = canvas.toDataURL("image/webp", 0.8);
                    } catch {
                        dataUrl = canvas.toDataURL(file.type || "image/jpeg", 0.8);
                    }

                    URL.revokeObjectURL(url);

                    resolve({
                        success: true,
                        url: dataUrl,
                        originalFile: {
                            name: file.name,
                            type: file.type,
                            size: file.size,
                        },
                    });
                } catch (error) {
                    URL.revokeObjectURL(url);
                    resolve({
                        success: false,
                        error: error.message,
                    });
                }
            };

            image.onerror = () => {
                URL.revokeObjectURL(url);
                resolve({
                    success: false,
                    error: "Error loading image",
                });
            };

            image.src = url;
        } catch (error) {
            resolve({
                success: false,
                error: error.message,
            });
        }
    });
};
