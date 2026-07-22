import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export class Chacha20RNG {
  private key: Buffer;
  private iv: Buffer;
  private cipher: crypto.Cipher;
  private buffer: Buffer;
  private offset: number;

  constructor(seed: Buffer) {
    this.key = seed; // 32-bytes key
    this.iv = Buffer.alloc(16, 0); // 16-bytes IV of zeroes
    this.cipher = crypto.createCipheriv('chacha20', this.key, this.iv);
    // Pre-generate a pool of 1024 pseudo-random bytes
    const plaintext = Buffer.alloc(1024, 0);
    this.buffer = this.cipher.update(plaintext);
    this.offset = 0;
  }

  nextUint32(): number {
    if (this.offset + 4 > this.buffer.length) {
      // Re-populate random bytes pool if depleted
      const plaintext = Buffer.alloc(1024, 0);
      this.buffer = Buffer.concat([
        this.buffer.subarray(this.offset),
        this.cipher.update(plaintext),
      ]);
      this.offset = 0;
    }
    const val = this.buffer.readUInt32LE(this.offset);
    this.offset += 4;
    return val;
  }

  nextIntRange(min: number, max: number): number {
    const range = max - min + 1;
    // Rejection sampling method to eliminate modulo bias
    const limit = Math.floor(0xffffffff / range) * range;
    let val = this.nextUint32();
    while (val >= limit) {
      val = this.nextUint32();
    }
    return min + (val % range);
  }
}

@Injectable()
export class ProvablyFairService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Generates a secure random 32-byte server seed in hex format.
   */
  generateServerSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generates SHA-256 hash of a server seed.
   */
  hashServerSeed(serverSeed: string): string {
    return crypto.createHash('sha256').update(serverSeed).digest('hex');
  }

  /**
   * Encrypts the server seed using AES-256-GCM and the secret key.
   * Format of output: "ivHex:encryptedSeedHex"
   */
  encryptServerSeed(serverSeed: string): {
    encryptedSeed: string;
    authTag: string;
  } {
    const keyString = this.configService.get<string>('RNG_ENCRYPTION_KEY');
    if (!keyString) {
      throw new Error('RNG_ENCRYPTION_KEY is not defined in the environment.');
    }
    const key = crypto.createHash('sha256').update(keyString).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(serverSeed, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
      encryptedSeed: `${iv.toString('hex')}:${encrypted}`,
      authTag,
    };
  }

  /**
   * Decrypts the encrypted server seed using AES-256-GCM.
   */
  decryptServerSeed(encryptedData: string, authTagHex: string): string {
    const keyString = this.configService.get<string>('RNG_ENCRYPTION_KEY');
    if (!keyString) {
      throw new Error('RNG_ENCRYPTION_KEY is not defined in the environment.');
    }
    const key = crypto.createHash('sha256').update(keyString).digest();

    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted server seed format.');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Shuffles a standard 52-card deck using ChaCha20 RNG seeded by combined final seed.
   * Final Seed = HMAC-SHA256(ServerSeed, ClientSeed + ":" + Nonce)
   */
  shuffleDeck(serverSeed: string, clientSeed: string, nonce: number): string[] {
    const deck = [
      '2C',
      '3C',
      '4C',
      '5C',
      '6C',
      '7C',
      '8C',
      '9C',
      'TC',
      'JC',
      'QC',
      'KC',
      'AC', // Clubs
      '2D',
      '3D',
      '4D',
      '5D',
      '6D',
      '7D',
      '8D',
      '9D',
      'TD',
      'JD',
      'QD',
      'KD',
      'AD', // Diamonds
      '2H',
      '3H',
      '4H',
      '5H',
      '6H',
      '7H',
      '8H',
      '9H',
      'TH',
      'JH',
      'QH',
      'KH',
      'AH', // Hearts
      '2S',
      '3S',
      '4S',
      '5S',
      '6S',
      '7S',
      '8S',
      '9S',
      'TS',
      'JS',
      'QS',
      'KS',
      'AS', // Spades
    ];

    const serverSeedBuf = Buffer.from(serverSeed, 'hex');
    const message = `${clientSeed}:${nonce}`;
    const finalSeed = crypto
      .createHmac('sha256', serverSeedBuf)
      .update(message)
      .digest();

    const rng = new Chacha20RNG(finalSeed);

    for (let i = deck.length - 1; i > 0; i--) {
      const j = rng.nextIntRange(0, i);
      const temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }

    return deck;
  }

  /**
   * Computes the SHA-256 hash of a shuffled deck.
   */
  calculateDeckHash(shuffledDeck: string[]): string {
    return crypto
      .createHash('sha256')
      .update(shuffledDeck.join(','))
      .digest('hex');
  }
}
