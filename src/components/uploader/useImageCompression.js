// src/components/uploader/useImageCompression.js

// Exportamos una función que se puede usar en cualquier componente
export function useImageCompression() {
  
  /**
   * Comprime un archivo de imagen si excede un tamaño máximo.
   * @param {File} file - El archivo de imagen original.
   * @param {number} maxSizeMB - El tamaño máximo en Megabytes.
   * @returns {Promise<File>} - Una promesa que resuelve con el archivo comprimido (o el original si no se comprimió).
   */
  const compressImageIfNeeded = (file, maxSizeMB = 8) => {
    const MAX_FILE_SIZE_BYTES = maxSizeMB * 1024 * 1024;

    if (file.size <= MAX_FILE_SIZE_BYTES) {
      // No necesita compresión, devolvemos el archivo original
      return Promise.resolve(file);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const MAX_WIDTH = 1920;
          let { width, height } = img;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
              resolve(compressedFile);
            } else {
              reject(new Error('La compresión del canvas falló.'));
            }
          }, 'image/jpeg', 0.85);
        };
        img.onerror = error => reject(error);
      };
      reader.onerror = error => reject(error);
    });
  };

  // El composable devuelve la función para que el componente la use
  return { compressImageIfNeeded };
}