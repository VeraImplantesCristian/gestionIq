// src/composables/useDeviceDetection.js
import { ref, onMounted } from 'vue';

export function useDeviceDetection() {
  const isMobile = ref(false);

  onMounted(() => {
    // Una forma simple y efectiva de detectar dispositivos móviles basándose en el User Agent.
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent) || (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)) {
      isMobile.value = true;
    }
  });

  return { isMobile };
}