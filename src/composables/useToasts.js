// src/composables/useToasts.js

// Importamos la función para usar toasts de la biblioteca.
import { useToast } from 'vue-toastification';

/**
 * Este es nuestro composable centralizado para gestionar notificaciones.
 * Encapsula la lógica para asegurar que siempre se muestren mensajes válidos.
 */
export function useToasts() {
  // Obtenemos la instancia del servicio de toasts.
  const toast = useToast();

  /**
   * Muestra una notificación de error de forma segura.
   * @param {any} error - El error capturado. Puede ser un objeto de error o un string.
   * @param {string} [defaultMessage] - Un mensaje por defecto si el error no tiene uno.
   */
  const showErrorToast = (error, defaultMessage = 'Ocurrió un error inesperado.') => {
    let message = defaultMessage;
    if (error && typeof error === 'object' && error.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    toast.error(message);
  };

  /**
   * Muestra una notificación de éxito.
   * @param {string} message - El mensaje a mostrar.
   */
  const showSuccessToast = (message) => {
    if (typeof message === 'string') {
      toast.success(message);
    }
  };

  // --- INICIO DE LA MODIFICACIÓN ---

  /**
   * Muestra una notificación de carga que no se cierra sola y devuelve su ID.
   * @param {string} message - El mensaje de carga a mostrar.
   * @returns {string|number} El ID del toast creado.
   */
  const showLoadingToast = (message = "Procesando...") => {
    return toast.info(message, { timeout: false });
  };

  /**
   * Actualiza un toast existente a un estado de éxito o error.
   * @param {string|number} toastId - El ID del toast a actualizar.
   * @param {string} content - El nuevo mensaje a mostrar.
   * @param {'success'|'error'|'info'} type - El nuevo tipo de notificación.
   */
  const updateToast = (toastId, content, type = 'success') => {
    toast.update(toastId, { 
      content, 
      options: { type, timeout: 5000 } 
    });
  };

  // --- FIN DE LA MODIFICACIÓN ---

  // Exponemos las funciones para que puedan ser usadas en cualquier componente.
  return {
    showErrorToast,
    showSuccessToast,
    // --- INICIO DE LA MODIFICACIÓN ---
    showLoadingToast,
    updateToast,
    // --- FIN DE LA MODIFICACIÓN ---
  };
}