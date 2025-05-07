/**
 * Converts an image file to base64 string
 * @param {File} file - The image file to convert
 * @returns {Promise<Object>} Object containing success status and base64 string or error
 */
export const convertImageToBase64 = (file) => {
    return new Promise((resolve) => {
        try {
            if (!file) {
                resolve({
                    success: false,
                    error: 'No file provided'
                });
                return;
            }

            // Check if it's an image file
            if (!file.type.match('image.*')) {
                resolve({
                    success: false,
                    error: 'Not an image file'
                });
                return;
            }

            const reader = new FileReader();
            
            reader.onload = (event) => {
                resolve({
                    success: true,
                    url: event.target.result, // Base64 string
                    originalFile: {
                        name: file.name,
                        type: file.type,
                        size: file.size
                    }
                });
            };

            reader.onerror = () => {
                resolve({
                    success: false,
                    error: 'Error reading file'
                });
            };

            reader.readAsDataURL(file);
        } catch (error) {
            resolve({
                success: false,
                error: error.message
            });
        }
    });
};
