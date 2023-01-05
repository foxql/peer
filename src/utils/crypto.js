export async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["sign", "verify"]
  );

  const publicKey = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKey = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

  return {
    dump: {
      publicKey: publicKey.n,
      privateKey: privateKey,
    },
    keyPair: keyPair
  };
}

export async function importKeyPair(publicKey, privateKey) {
  const publicJwk = {
    kty: "RSA",
    e: "AQAB",
    n: publicKey
  };

  const publicKeyObject = await window.crypto.subtle.importKey(
    "jwk",
    publicJwk,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    true,
    ["verify"]
  );
    
  const privateKeyObject = await window.crypto.subtle.importKey(
    "jwk",
    privateKey,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    true,
    ["sign"]
  );
    
  return {
    publicKey: publicKeyObject,
    privateKey: privateKeyObject
  };
}
export async function sign(privateKey, data) {
  // Convert the data to an ArrayBuffer
  const dataBuffer = new TextEncoder().encode(data);

  // Sign the data using the private key
  const signature = await window.crypto.subtle.sign(
    {
      name: "RSASSA-PKCS1-v1_5"
    },
    privateKey,
    dataBuffer
  );

  // Return the signature as a base64-encoded string
  return window.btoa(String.fromCharCode(...new Uint8Array(signature)));
}

export async function verify(publicKey, signature, data) {
  // Convert the signature and data to ArrayBuffers
  const signatureBuffer = new Uint8Array(
    window.atob(signature).split("").map(c => c.charCodeAt(0))
  ).buffer;
  const dataBuffer = new TextEncoder().encode(data);

  // Verify the signature using the public key
  const isValid = await window.crypto.subtle.verify(
    {
      name: "RSASSA-PKCS1-v1_5"
    },
    publicKey,
    signatureBuffer,
    dataBuffer
  );

  return isValid;
}

