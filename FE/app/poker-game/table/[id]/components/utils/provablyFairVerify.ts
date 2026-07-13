// Client-side Provably Fair validation engine matching the backend 100%

function quarterround(x: Uint32Array, a: number, b: number, c: number, d: number) {
  x[a] += x[b]; x[d] ^= x[a]; x[d] = (x[d] << 16) | (x[d] >>> 16);
  x[c] += x[d]; x[b] ^= x[c]; x[b] = (x[b] << 12) | (x[b] >>> 20);
  x[a] += x[b]; x[d] ^= x[a]; x[d] = (x[d] << 8) | (x[d] >>> 24);
  x[c] += x[d]; x[b] ^= x[c]; x[b] = (x[b] << 7) | (x[b] >>> 25);
}

function chacha20Block(key: Uint32Array, counter: number, iv: Uint32Array): Uint8Array {
  const state = new Uint32Array(16);
  // Constants (sigma)
  state[0] = 0x61707865;
  state[1] = 0x3320646e;
  state[2] = 0x79622d32;
  state[3] = 0x6b206574;
  
  // Key
  for (let i = 0; i < 8; i++) {
    state[4 + i] = key[i];
  }
  
  // Counter
  state[12] = counter;
  
  // IV
  state[13] = iv[0];
  state[14] = iv[1];
  state[15] = iv[2];

  const initial = new Uint32Array(state);

  for (let i = 0; i < 10; i++) {
    // Column rounds
    quarterround(state, 0, 4, 8, 12);
    quarterround(state, 1, 5, 9, 13);
    quarterround(state, 2, 6, 10, 14);
    quarterround(state, 3, 7, 11, 15);
    // Diagonal rounds
    quarterround(state, 0, 5, 10, 15);
    quarterround(state, 1, 6, 11, 12);
    quarterround(state, 2, 7, 8, 13);
    quarterround(state, 3, 4, 9, 14);
  }

  const out = new Uint8Array(64);
  for (let i = 0; i < 16; i++) {
    const val = state[i] + initial[i];
    out[i * 4] = val & 0xff;
    out[i * 4 + 1] = (val >>> 8) & 0xff;
    out[i * 4 + 2] = (val >>> 16) & 0xff;
    out[i * 4 + 3] = (val >>> 24) & 0xff;
  }
  return out;
}

export class Chacha20RNG {
  private key32: Uint32Array;
  private iv32: Uint32Array;
  private buffer: Uint8Array;
  private offset: number;
  private blockCounter: number;

  constructor(seed: Uint8Array) {
    this.key32 = new Uint32Array(8);
    for (let i = 0; i < 8; i++) {
      this.key32[i] = seed[i * 4] | (seed[i * 4 + 1] << 8) | (seed[i * 4 + 2] << 16) | (seed[i * 4 + 3] << 24);
    }
    this.iv32 = new Uint32Array(3); // Zeroes
    this.blockCounter = 0;
    this.buffer = new Uint8Array(0);
    this.offset = 0;
    this.generateMoreKeystream();
  }

  private generateMoreKeystream() {
    const newBlocks = new Uint8Array(1024);
    for (let i = 0; i < 16; i++) {
      const block = chacha20Block(this.key32, this.blockCounter++, this.iv32);
      newBlocks.set(block, i * 64);
    }

    const merged = new Uint8Array(this.buffer.length - this.offset + newBlocks.length);
    merged.set(this.buffer.subarray(this.offset), 0);
    merged.set(newBlocks, this.buffer.length - this.offset);

    this.buffer = merged;
    this.offset = 0;
  }

  nextUint32(): number {
    if (this.offset + 4 > this.buffer.length) {
      this.generateMoreKeystream();
    }
    const val = this.buffer[this.offset] |
                (this.buffer[this.offset + 1] << 8) |
                (this.buffer[this.offset + 2] << 16) |
                (this.buffer[this.offset + 3] << 24);
    this.offset += 4;
    return val >>> 0; // force unsigned
  }

  nextIntRange(min: number, max: number): number {
    const range = max - min + 1;
    const limit = Math.floor(0xffffffff / range) * range;
    let val = this.nextUint32();
    while (val >= limit) {
      val = this.nextUint32();
    }
    return min + (val % range);
  }
}

function hexToUint8Array(hexString: string): Uint8Array {
  const cleanHex = hexString.replace(/^0x/i, '').trim();
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  const array = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    array[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return array;
}

export async function localShuffleDeck(
  serverSeedHex: string,
  clientSeedStr: string,
  nonce: number
): Promise<string[]> {
  const deck = [
    '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC', 'AC', // Clubs
    '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', 'TD', 'JD', 'QD', 'KD', 'AD', // Diamonds
    '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH', 'AH', // Hearts
    '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', 'TS', 'JS', 'QS', 'KS', 'AS', // Spades
  ];

  // 1. Get server seed Uint8Array
  const serverSeedBuf = hexToUint8Array(serverSeedHex);

  // 2. Prepare message (ClientSeed + ":" + Nonce)
  const message = `${clientSeedStr}:${nonce}`;
  const messageBuf = new TextEncoder().encode(message);

  // 3. Compute HMAC-SHA256 of message using serverSeed as key via Web Crypto API
  const hmacKey = await window.crypto.subtle.importKey(
    'raw',
    serverSeedBuf.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const finalSeedBuffer = await window.crypto.subtle.sign(
    'HMAC',
    hmacKey,
    messageBuf.buffer as ArrayBuffer
  );
  
  const finalSeed = new Uint8Array(finalSeedBuffer);

  // 4. Initialize ChaCha20 RNG
  const rng = new Chacha20RNG(finalSeed);

  // 5. Fisher-Yates shuffle
  const shuffledDeck = [...deck];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = rng.nextIntRange(0, i);
    const temp = shuffledDeck[i];
    shuffledDeck[i] = shuffledDeck[j];
    shuffledDeck[j] = temp;
  }

  return shuffledDeck;
}

export async function calculateDeckHash(shuffledDeck: string[]): Promise<string> {
  const data = new TextEncoder().encode(shuffledDeck.join(','));
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
