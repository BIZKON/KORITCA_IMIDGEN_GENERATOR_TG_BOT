/**
 * Получение OAuth2 Access Token из Service Account Key
 * для вызовов Vertex AI API (Gemini, Imagen)
 */

// Base64URL encode
function base64url(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Текстовый encoder
const encoder = new TextEncoder();

/**
 * Создаёт JWT и обменивает на access_token через Google OAuth2
 */
export async function getGoogleAccessToken(): Promise<string> {
  const keyRaw = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");
  if (!keyRaw) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");

  const serviceKey = JSON.parse(keyRaw);
  const now = Math.floor(Date.now() / 1000);

  // JWT Header
  const header = base64url(
    encoder.encode(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  );

  // JWT Claims
  const claims = base64url(
    encoder.encode(
      JSON.stringify({
        iss: serviceKey.client_email,
        sub: serviceKey.client_email,
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
        scope: "https://www.googleapis.com/auth/cloud-platform",
      })
    )
  );

  const signingInput = `${header}.${claims}`;

  // Импорт RSA private key
  const pemBody = serviceKey.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");

  const keyData = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Подпись
  const signature = new Uint8Array(
    await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      encoder.encode(signingInput)
    )
  );

  const jwt = `${signingInput}.${base64url(signature)}`;

  // Обмен JWT на access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    throw new Error(`Google OAuth2 token exchange failed: ${errText}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

/**
 * Vertex AI endpoint URL builder
 */
export function vertexAiUrl(model: string, method = "generateContent"): string {
  const project = Deno.env.get("GOOGLE_CLOUD_PROJECT_ID")!;
  const location = Deno.env.get("GOOGLE_CLOUD_LOCATION") || "us-central1";
  return `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:${method}`;
}
