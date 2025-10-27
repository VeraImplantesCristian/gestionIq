// src/services/supabase.js

// Importamos la función 'createClient' desde la librería de Supabase.
import { createClient } from '@supabase/supabase-js'

// Obtenemos la URL y la clave anónima de nuestras variables de entorno.
// Vite las hace accesibles a través del objeto `import.meta.env`.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Creamos una instancia del cliente de Supabase con nuestras credenciales.
// Esta instancia 'supabase' será nuestro punto de acceso a todos los servicios de Supabase.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)