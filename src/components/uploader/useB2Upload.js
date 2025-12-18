// src/components/uploader/useB2Upload.js
import { ref } from 'vue';

export function useB2Upload() {
  const uploadProgress = ref(0);
  const isUploading = ref(false);

  /**
   * Sube un archivo a una URL pre-firmada de B2 usando XMLHttpRequest para monitorear el progreso.
   * @param {string} uploadUrl - La URL pre-firmada obtenida de la Edge Function.
   * @param {File} file - El archivo a subir.
   * @returns {Promise<any>} - Una promesa que resuelve cuando la subida es exitosa.
   */
  const uploadFile = (uploadUrl, file) => {
    return new Promise((resolve, reject) => {
      isUploading.value = true;
      uploadProgress.value = 0;

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          uploadProgress.value = Math.round((event.loaded / event.total) * 100);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject(new Error(`Fallo en la subida a B2: Status ${xhr.status}`));
        }
      };
      
      xhr.onerror = () => reject(new Error('Error de red durante la subida.'));

      xhr.onloadend = () => {
        isUploading.value = false;
      };

      xhr.setRequestHeader("Content-Type", "image/jpeg");
      xhr.send(file);
    });
  };

  return {
    uploadProgress,
    isUploading,
    uploadFile
  };
}