// lib/crypto.ts
import { webcrypto as crypto } from 'crypto';

const SECRET_KEY = process.env.ENCRYPTION_KEY; 

if(!SECRET_KEY){
    throw new Error('ENCRYPTION_KEY is not set');
}

if (SECRET_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 characters');
  }
  

const ALGORITHM = 'AES-GCM';

function getKey() {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET_KEY),
    { name: ALGORITHM },
    false,
    ['encrypt', 'decrypt']
  );
}

// Returns: "iv:encrypted_data"
export async function encrypt(text: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  const encoder = new TextEncoder();
  
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(text)
  );

  const ivHex = Buffer.from(iv).toString('hex');
  const encryptedHex = Buffer.from(encrypted).toString('hex');
  
  return `${ivHex}:${encryptedHex}`;
}

export async function decrypt(cipherText: string): Promise<string> {
  const [ivHex, encryptedHex] = cipherText.split(':');
  if (!ivHex || !encryptedHex) throw new Error('Invalid cipher format');

  const key = await getKey();
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}