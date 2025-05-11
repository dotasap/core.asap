
export async function encryptMnemonic(mnemonic: string, password: string): Promise<string> {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
  
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(password.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
  
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(mnemonic)
    );
  
    const ivStr = btoa(String.fromCharCode(...iv));
    const encryptedStr = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  
    return `v1.${ivStr}.${encryptedStr}`;
  }
  
  export async function decryptMnemonic(data: string, password: string): Promise<string> {
    const [version, ivStr, encStr] = data.split('.');
    if (version !== 'v1') throw new Error('Unsupported encryption version');
  
    const enc = new TextEncoder();
    const dec = new TextDecoder();
  
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(password.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
  
    const iv = Uint8Array.from(atob(ivStr), c => c.charCodeAt(0));
    const encrypted = Uint8Array.from(atob(encStr), c => c.charCodeAt(0));
  
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
  
    return dec.decode(decrypted);
  }
  