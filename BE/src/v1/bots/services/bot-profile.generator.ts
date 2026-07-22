import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface BotProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  country: string;
  isBot: boolean;
}

@Injectable()
export class BotProfileGenerator {
  private readonly botFirstNames = [
    'Alex',
    'Jordan',
    'Taylor',
    'Morgan',
    'Sam',
    'Chris',
    'Pat',
    'Riley',
    'Casey',
    'Dakota',
    'Avery',
    'Logan',
    'Quinn',
    'Reese',
    'Rowan',
    'Skyler',
    'Viktor',
    'Dmitri',
    'Klaus',
    'Sven',
    'Kenji',
    'Hiroshi',
    'Minho',
    'Linh',
  ];

  private readonly botSuffixes = [
    'Pro',
    'Shark',
    'Ace',
    'King',
    'Bluffer',
    'Hero',
    'Maverick',
    'Viper',
    'Falcon',
    'Titan',
    'Legend',
    'Ninja',
    'Master',
    'Star',
    'Wolf',
    'Fox',
  ];

  private readonly countries = [
    'US',
    'VN',
    'JP',
    'KR',
    'GB',
    'DE',
    'FR',
    'CA',
    'AU',
    'BR',
    'RU',
    'SE',
  ];

  generateProfile(
    customName?: string,
    customAvatar?: string,
    customCountry?: string,
  ): BotProfile {
    const botId = `bot-${uuidv4()}`;
    const nameIndex = Math.floor(Math.random() * this.botFirstNames.length);
    const suffixIndex = Math.floor(Math.random() * this.botSuffixes.length);
    const randomNumber = Math.floor(10 + Math.random() * 90);

    const displayName =
      customName ||
      `${this.botFirstNames[nameIndex]}_${this.botSuffixes[suffixIndex]}${randomNumber}`;

    const country =
      customCountry ||
      this.countries[Math.floor(Math.random() * this.countries.length)];

    const seed = encodeURIComponent(displayName);
    const avatar =
      customAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

    return {
      id: botId,
      username: displayName,
      displayName,
      avatar,
      country,
      isBot: true,
    };
  }
}
