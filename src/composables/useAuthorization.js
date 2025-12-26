// src/composables/useAuthorization.js
import { ref } from 'vue';

// Definimos la duración de la autorización en milisegundos (15 minutos)
const AUTH_DURATION = 15 * 60 * 1000; 

export function useAuthorization() {
  const isAuthorizationModalVisible = ref(false);
  let resolvePromise = null;

  const requestAuthorization = () => {
    // COMENTARIO: INICIO DE LA MODIFICACIÓN
    // Verificamos si hay una autorización reciente guardada en sessionStorage.
    const lastAuthTime = sessionStorage.getItem('lastAuthorizedAt');
    if (lastAuthTime) {
      const timeSinceAuth = Date.now() - parseInt(lastAuthTime, 10);
      if (timeSinceAuth < AUTH_DURATION) {
        console.log("Autorización reciente encontrada. Omitiendo modal.");
        // Si la autorización es reciente, resolvemos la promesa inmediatamente.
        return Promise.resolve(true);
      }
    }
    // FIN DE LA MODIFICACIÓN

    // Si no hay autorización reciente, mostramos el modal.
    isAuthorizationModalVisible.value = true;
    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  };

  const onAuthorized = () => {
    isAuthorizationModalVisible.value = false;
    // COMENTARIO: INICIO DE LA MODIFICACIÓN
    // Al autorizar con éxito, guardamos la marca de tiempo actual.
    sessionStorage.setItem('lastAuthorizedAt', Date.now().toString());
    // FIN DE LA MODIFICACIÓN
    if (resolvePromise) {
      resolvePromise(true);
    }
  };

  const onCancelled = () => {
    isAuthorizationModalVisible.value = false;
    if (resolvePromise) {
      resolvePromise(false);
    }
  };

  return {
    isAuthorizationModalVisible,
    requestAuthorization,
    onAuthorized,
    onCancelled,
  };
}