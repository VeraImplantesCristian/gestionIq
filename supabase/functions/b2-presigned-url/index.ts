// supabase/functions/b2-presigned-url/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Importaciones "limpias" que usan la configuración de tu deno.json
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// --- CABECERAS CORS ---
// Definimos las cabeceras aquí para que la función sea autocontenida
// y no dependa de archivos externos, evitando errores de despliegue.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Permitimos POST para la data y OPTIONS para el pre-vuelo
};

// --- CONFIGURACIÓN DE R2 ---
// Obtenemos las credenciales y la configuración de R2 desde las variables de entorno de Supabase.
// El '!' al final asegura que Deno lance un error si estas variables no están definidas.
const R2_ACCOUNT_ID = Deno.env.get("R2_ACCOUNT_ID")!;
const R2_ACCESS_KEY_ID = Deno.env.get("R2_ACCESS_KEY_ID")!;
const R2_SECRET_ACCESS_KEY = Deno.env.get("R2_SECRET_ACCESS_KEY")!;
const R2_BUCKET_NAME = Deno.env.get("R2_BUCKET_NAME")!;

// Inicializa el cliente S3 que se comunicará con Cloudflare R2.
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Requerido para la compatibilidad de R2 con el SDK de S3
});

// Inicia el servidor de la función Deno.
serve(async (req) => {
  // Manejo de la solicitud pre-vuelo (preflight) del navegador para CORS.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Extrae los datos enviados desde el frontend.
    // Aceptamos 'baseName' para asegurar la sincronización entre original y miniatura.
    const { area, contentType, owner, extension, isThumb, baseName } = await req.json();

    // Validación para asegurar que los parámetros esenciales fueron recibidos.
    if (!area || !contentType || !extension || !baseName) {
      throw new Error("Faltan parámetros requeridos (area, contentType, extension, baseName).");
    }

    // --- GENERACIÓN DE LA RUTA DEL OBJETO (OBJECT KEY) ---
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '/'); // Formato YYYY/MM/DD
    
    // Añade el sufijo '_thumb' al nombre base SOLO si 'isThumb' es verdadero.
    const finalName = isThumb ? `${baseName}_thumb` : baseName;
    
    // Construye la ruta final con la extensión correcta.
    let objectKey = `${area}/${finalName}.${extension}`;
    if (area === 'logistica') {
      objectKey = `logistica/${timestamp}/${finalName}.${extension}`;
    } else if (area === 'instrumentadores') {
      objectKey = `instrumentadores/${owner}/comprobantes/${finalName}.${extension}`;
    }
    // --- FIN DE LA GENERACIÓN DE RUTA ---

    // Define el "Comando" o la acción que queremos realizar: subir un objeto (PutObjectCommand).
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType,
    });

    // Genera la URL firmada que el frontend usará para subir el archivo directamente a R2.
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // Válida por 5 minutos

    // Devuelve la URL de subida y la clave del objeto (objectKey) al frontend.
    return new Response(
      JSON.stringify({ uploadUrl, objectKey }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    // Si ocurre algún error durante el proceso, lo capturamos aquí.
    console.error("!!! ERROR EN LA EDGE FUNCTION b2-presigned-url !!!", error);
    // Devolvemos una respuesta de error clara al frontend.
    return new Response(
      JSON.stringify({ error: "Error en el servidor.", details: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});