// src/components/uploader/useB2Upload.js (Corregido)
import { ref } from 'vue';

export function useB2Upload() {
  const uploadProgress = ref(0);
  const isUploading = ref(false);

  /**
   * Sube un archivo a una URL pre-firmada de B2 usando XMLHttpRequest.
   * @param {string} uploadUrl - La URL pre-firmada.
   * @param {File} file - El archivo a subir.
   * @returns {Promise<any>}
   */
  const uploadFile = (uploadUrl, file) => {
    return new Promise((resolve, reject) => {
      isUploading.value = true;
      uploadProgress.value = 0;

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      
      // ***** INICIO DE LA CORRECCIÓN *****
      // 1. Añadimos un timeout generoso (60 segundos).
      // El valor está en milisegundos. 60000ms = 1 minuto.
      xhr.timeout = 60000;

      // 2. Manejamos el evento de timeout.
      xhr.ontimeout = () => {
        reject(new Error('La subida tardó demasiado y fue cancelada (timeout).'));
      };
      // ***** FIN DE LA CORRECCIÓN *****
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          uploadProgress.value = Math.round((event.loaded / event.total) * 100);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          // Damos un mensaje de error más específico.
          reject(new Error(`Fallo en la subida a R2. El servidor respondió con el estado ${xhr.status}.`));
        }
      };
      
      xhr.onerror = () => reject(new Error('Error de red durante la subida. Revisa tu conexión.'));

      xhr.onloadend = () => {
        isUploading.value = false;
      };

      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  };

  return {
    uploadProgress,
    isUploading,
    uploadFile
  };
}