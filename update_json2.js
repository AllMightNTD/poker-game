const fs = require('fs');
const files = {
  vi: '/home/dev_ntd/Know_Block/Know_Ledge_Block/FE/messages/vi.json',
  en: '/home/dev_ntd/Know_Block/Know_Ledge_Block/FE/messages/en.json',
  ja: '/home/dev_ntd/Know_Block/Know_Ledge_Block/FE/messages/ja.json',
};
const keys = {
  vi: { "yourStory": "Tin của bạn" },
  en: { "yourStory": "Your Story" },
  ja: { "yourStory": "あなたのストーリー" }
};
for (const lang of Object.keys(files)) {
  const file = files[lang];
  let data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data.story = { ...data.story, ...keys[lang] };
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}
