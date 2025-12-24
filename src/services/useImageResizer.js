// src/services/useImageResizer.js

export function resizeImage(file, maxWidth = 400, quality = 0.7) {
  console.log(`[Image Resizer] Iniciando redimensión para: ${file.name}, Tamaño Original: ${(file.size / 1024).toFixed(2)} KB`);

  return new Promise((resolve, reject) => {
    // Validación inicial: si el archivo no es una imagen, no podemos procesarlo.
    if (!file.type.startsWith('image/')) {
      console.warn(`[Image Resizer] El archivo ${file.name} no es una imagen, se omite la redimensión.`);
      // Resolvemos con 'null' para indicar que no se generó miniatura.
      return resolve(null);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        ctx.canvas.toBlob((blob) => {
          if (!blob || blob.size === 0) {
            console.error("[Image Resizer] ¡ERROR! El blob generado es nulo o tiene tamaño 0.");
            return reject(new Error("No se pudo crear el blob de la imagen redimensionada."));
          }

          const newFileName = file.name.split('.').slice(0, -1).join('.') + '_thumb.webp';
          const resizedFile = new File([blob], newFileName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          console.log(`[Image Resizer] Redimensión completa. Nuevo archivo: ${resizedFile.name}, Tamaño Redimensionado: ${(resizedFile.size / 1024).toFixed(2)} KB`);
          
          resolve(resizedFile);
        }, 'image/webp', quality);
      };
      
      img.onerror = (err) => {
        console.error("[Image Resizer] ¡ERROR! No se pudo cargar la imagen en el elemento Image.", err);
        reject(err);
      };
    };
    
    reader.onerror = (err) => {
      console.error("[Image Resizer] ¡ERROR! Falló el FileReader.", err);
      reject(err);
    };
  });
}