// supabase/functions/b2-presigned-url/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Importaciones "limpias" que usan la configuración de tu deno.json
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cabeceras CORS para permitir la comunicación desde tu frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Inicia el servidor de la función
serve(async (req) => {
  // Log inicial para confirmar que la función fue invocada
  console.log("Función b2-presigned-url invocada.");

  // Manejo de la solicitud pre-vuelo (preflight) del navegador para CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Extrae los datos enviados desde el frontend
    const { area, contentType, owner, extension } = await req.json();
    console.log("Payload recibido:", { area, contentType, owner, extension });

    // --- OBTENCIÓN Y LOG DE SECRETS ---
    const accountId = Deno.env.get("R2_ACCOUNT_ID");
    const accessKeyId = Deno.env.get("R2_ACCESS_KEY_ID");
    const secretAccessKey = Deno.env.get("R2_SECRET_ACCESS_KEY");
    const bucketName = Deno.env.get("R2_BUCKET_NAME");

    // Logs de depuración para verificar los valores de los secrets
    console.log("--- Verificando Secrets ---");
    console.log(`R2_ACCOUNT_ID: ${accountId}`);
    console.log(`R2_ACCESS_KEY_ID: ${accessKeyId}`);
    // Por seguridad, nunca logueamos el secret completo, solo su existencia y longitud
    console.log(`R2_SECRET_ACCESS_KEY presente: ${!!secretAccessKey}, Longitud: ${secretAccessKey?.length || 0}`);
    console.log(`R2_BUCKET_NAME: ${bucketName}`);
    console.log("--------------------------");

    // Validación para asegurar que todos los secrets fueron cargados
    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error("Uno o más secrets de R2 no están configurados correctamente en el dashboard de Supabase.");
    }

    // Construye el endpoint de Cloudflare R2
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    console.log(`Endpoint construido: ${endpoint}`);

    // Inicializa el cliente S3 que se comunicará con R2
    console.log("Inicializando S3Client...");
    const s3Client = new S3Client({
      region: "auto",
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      forcePathStyle: true,
    });
    console.log("S3Client inicializado correctamente.");
    
    // Crea una ruta única y organizada para el archivo
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    const uuid = crypto.randomUUID();
    let objectKey = `${area}/${uuid}.${extension}`;
    if (area === 'logistica') objectKey = `logistica/${timestamp}/${uuid}.${extension}`;
    else if (area === 'instrumentadores') objectKey = `instrumentadores/${owner}/comprobantes/${uuid}.${extension}`;

    // Define el "Comando" o la acción que queremos realizar (subir un objeto)
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: contentType,
    });

    // Genera la URL firmada que el frontend usará para subir el archivo directamente a R2
    console.log("Generando URL firmada...");
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // Válida por 5 minutos
    console.log("URL firmada generada con éxito.");

    // Devuelve la URL y la ruta del objeto al frontend
    return new Response(JSON.stringify({ uploadUrl, objectKey }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    // Si algo falla en el bloque 'try', este bloque lo capturará
    console.error("!!! ERROR CAPTURADO EN EL BLOQUE CATCH !!!", error);
    // Devuelve una respuesta de error clara al frontend
    return new Response(JSON.stringify({ error: "Error en el servidor.", details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});