// Seed helper utilities for generating fake data at scale

const firstNames = [
  'Nguyen',
  'Tran',
  'Le',
  'Pham',
  'Hoang',
  'Vo',
  'Dang',
  'Bui',
  'Do',
  'Ngo',
  'Duong',
  'Ly',
  'Ha',
  'Dinh',
  'Mai',
  'Truong',
  'Lam',
  'Cao',
  'Vu',
  'Ta',
];
const lastNames = [
  'Anh',
  'Binh',
  'Cuong',
  'Dung',
  'Giang',
  'Hoa',
  'Khanh',
  'Linh',
  'Minh',
  'Nam',
  'Phuc',
  'Quang',
  'Son',
  'Tuan',
  'Van',
  'Xuan',
  'Yen',
  'Dat',
  'Hieu',
  'Long',
];
const adjectives = [
  'Amazing',
  'Cool',
  'Great',
  'Super',
  'Awesome',
  'Fantastic',
  'Brilliant',
  'Epic',
  'Wonderful',
  'Modern',
];
const topics = [
  'Technology',
  'Science',
  'Art',
  'Music',
  'Sports',
  'Travel',
  'Food',
  'Fashion',
  'Education',
  'Health',
  'Finance',
  'Gaming',
  'Photography',
  'Design',
  'Programming',
];
const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '💯', '✨'];

export function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)];
}

export function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(n, arr.length));
}

export function fakeName() {
  return { first: pick(firstNames), last: pick(lastNames) };
}

export function fakeFullName() {
  const n = fakeName();
  return `${n.first} ${n.last}`;
}

export function fakeEmail(i: number) {
  return `user${i}@knowblock.dev`;
}

export function fakeUsername(i: number) {
  return `user_${i}`;
}

export function fakeBio(i: number) {
  return `${pick(adjectives)} developer #${i}. Love ${pick(topics)} & ${pick(topics)}.`;
}

export function fakePostContent(i: number) {
  return `${pick(adjectives)} post #${i} about ${pick(topics)}! #${pick(topics).toLowerCase()}`;
}

export function fakeArticleTitle(i: number) {
  return `${pick(adjectives)} Guide to ${pick(topics)} - Part ${i}`;
}

export function fakeSlug(text: string, i: number) {
  return `${text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')}-${i}`;
}

export function fakeGroupName(i: number) {
  return `${pick(adjectives)} ${pick(topics)} Club #${i}`;
}

export function fakePageName(i: number) {
  return `${pick(topics)} ${pick(adjectives)} Page ${i}`;
}

export function fakeListingTitle(i: number) {
  const items = [
    'Laptop',
    'Phone',
    'Camera',
    'Headphones',
    'Tablet',
    'Monitor',
    'Keyboard',
    'Mouse',
    'Speaker',
    'Watch',
  ];
  return `${pick(adjectives)} ${pick(items)} #${i}`;
}

export function fakeMessage(i: number) {
  const msgs = [
    'Hey there!',
    'How are you?',
    'Check this out!',
    'Sounds good!',
    'Let me know',
    'Thanks!',
    'Sure thing',
    'On my way',
    'See you later',
    'Great idea!',
  ];
  return `${pick(msgs)} [${i}]`;
}

export function fakeEmoji() {
  return pick(emojis);
}

export function fakeIP() {
  return `${rand(1, 255)}.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 254)}`;
}

export function futureDate(daysAhead = 30) {
  return new Date(Date.now() + rand(1, daysAhead) * 86400000);
}

export function pastDate(daysBack = 90) {
  return new Date(Date.now() - rand(1, daysBack) * 86400000);
}

// Batch insert helper - splits array into chunks to avoid query size limits
export async function batchInsert<T>(
  repo: any,
  items: Partial<T>[],
  chunkSize = 200,
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const saved = await repo.save(chunk);
    results.push(...saved);
  }
  return results;
}

export { adjectives, topics };
