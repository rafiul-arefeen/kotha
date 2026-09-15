import type { CategoryId, SymbolItem } from '@/types';

/**
 * Built-in symbol vocabulary.
 *
 * Icons are Unicode emoji used as placeholders. They are not an AAC symbol
 * set; replace `icon` with licensed artwork (e.g. ARASAAC, CC BY-NC-SA, or
 * Mulberry Symbols, CC BY-SA) before any deployment.
 *
 * `id` doubles as the key into the mock generator's lexicon
 * (services/llm/mock/lexicon.ts), so keep them in sync.
 */
function s(
  id: string,
  label: string,
  en: string,
  category: CategoryId,
  icon: string,
  keywords?: string[],
): SymbolItem {
  return { id, label, en, category, icon, keywords, enabled: true };
}

export const DEFAULT_SYMBOLS: SymbolItem[] = [
  // Needs
  s('water', 'পানি', 'Water', 'needs', '💧', ['জল']),
  s('toilet', 'টয়লেট', 'Toilet', 'needs', '🚽', ['বাথরুম']),
  s('help', 'সাহায্য', 'Help', 'needs', '🤲'),
  s('want', 'চাই', 'I want', 'needs', '👉'),
  s('need', 'দরকার', 'I need', 'needs', '☝️', ['লাগবে']),
  s('more', 'আরো', 'More', 'needs', '➕', ['আরও']),
  s('finished', 'শেষ', 'Finished', 'needs', '✅'),
  s('wait', 'অপেক্ষা', 'Wait', 'needs', '⏳'),
  s('stop', 'থামো', 'Stop', 'needs', '✋'),
  s('turn_over', 'পাশ ফেরা', 'Turn over', 'needs', '🔄'),
  s('blanket', 'কম্বল', 'Blanket', 'needs', '🛌'),
  s('phone', 'ফোন', 'Phone', 'needs', '📱', ['মোবাইল']),
  s('glasses', 'চশমা', 'Glasses', 'needs', '👓'),
  s('wheelchair', 'হুইলচেয়ার', 'Wheelchair', 'needs', '🦽'),

  // People
  s('mother', 'মা', 'Mother', 'people', '👩', ['আম্মু', 'আম্মা']),
  s('father', 'বাবা', 'Father', 'people', '👨', ['আব্বু', 'আব্বা']),
  s('brother', 'ভাই', 'Brother', 'people', '👦', ['ভাইয়া']),
  s('sister', 'বোন', 'Sister', 'people', '👧', ['আপু']),
  s('friend', 'বন্ধু', 'Friend', 'people', '🧑‍🤝‍🧑'),
  s('teacher', 'শিক্ষক', 'Teacher', 'people', '🧑‍🏫', ['স্যার', 'ম্যাডাম']),
  s('doctor', 'ডাক্তার', 'Doctor', 'people', '🧑‍⚕️'),
  s('nurse', 'নার্স', 'Nurse', 'people', '👩‍⚕️'),

  // Actions
  s('eat', 'খাওয়া', 'Eat / drink', 'actions', '🍴', ['খাব', 'খেতে চাই']),
  s('go', 'যাওয়া', 'Go', 'actions', '🚶', ['যাব', 'যেতে চাই']),
  s('sleep', 'ঘুমানো', 'Sleep', 'actions', '😴', ['ঘুম']),
  s('rest', 'বিশ্রাম', 'Rest', 'actions', '🛋️'),
  s('play', 'খেলা', 'Play', 'actions', '⚽'),
  s('watch', 'দেখা', 'Watch', 'actions', '👀'),
  s('listen', 'শোনা', 'Listen', 'actions', '🎧', ['গান']),
  s('read', 'পড়া', 'Read', 'actions', '📖'),
  s('talk', 'কথা বলা', 'Talk', 'actions', '🗣️'),
  s('sit', 'বসা', 'Sit', 'actions', '🪑'),
  s('bathe', 'গোসল', 'Bath', 'actions', '🚿'),
  s('come', 'আসা', 'Come', 'actions', '🫴'),
  s('give', 'দেওয়া', 'Give', 'actions', '🎁'),
  s('call', 'ডাকা', 'Call', 'actions', '📣'),
  s('repeat', 'আবার বলো', 'Say again', 'actions', '🔁'),

  // Feelings
  s('happy', 'খুশি', 'Happy', 'feelings', '🙂'),
  s('sad', 'মন খারাপ', 'Sad', 'feelings', '🙁', ['দুঃখ']),
  s('angry', 'রাগ', 'Angry', 'feelings', '😠'),
  s('scared', 'ভয়', 'Scared', 'feelings', '😨'),
  s('tired', 'ক্লান্ত', 'Tired', 'feelings', '😪'),
  s('bored', 'বিরক্ত', 'Annoyed', 'feelings', '😒'),
  s('hungry', 'খিদে', 'Hungry', 'feelings', '😋', ['ক্ষুধা']),
  s('thirsty', 'পিপাসা', 'Thirsty', 'feelings', '🥤', ['তেষ্টা']),
  s('hot', 'গরম', 'Hot', 'feelings', '🥵'),
  s('cold', 'ঠান্ডা', 'Cold', 'feelings', '🥶'),
  s('lonely', 'একা', 'Lonely', 'feelings', '😶'),
  s('good', 'ভালো', 'Good', 'feelings', '😊'),
  s('love', 'ভালোবাসা', 'Love', 'feelings', '❤️'),

  // Places
  s('home', 'বাড়ি', 'Home', 'places', '🏠', ['বাসা']),
  s('outside', 'বাইরে', 'Outside', 'places', '🌳'),
  s('school', 'স্কুল', 'School', 'places', '🏫'),
  s('hospital', 'হাসপাতাল', 'Hospital', 'places', '🏥'),
  s('park', 'পার্ক', 'Park', 'places', '🛝'),
  s('shop', 'দোকান', 'Shop', 'places', '🏪'),
  s('bed', 'বিছানা', 'Bed', 'places', '🛏️'),
  s('mosque', 'মসজিদ', 'Mosque', 'places', '🕌'),
  s('temple', 'মন্দির', 'Temple', 'places', '🛕'),
  s('rickshaw', 'রিকশা', 'Rickshaw', 'places', '🛺'),

  // Food & drink
  s('food', 'খাবার', 'Food', 'food', '🍽️'),
  s('rice', 'ভাত', 'Rice', 'food', '🍚'),
  s('dal', 'ডাল', 'Dal', 'food', '🍲'),
  s('fish', 'মাছ', 'Fish', 'food', '🐟'),
  s('egg', 'ডিম', 'Egg', 'food', '🥚'),
  s('roti', 'রুটি', 'Roti', 'food', '🫓'),
  s('milk', 'দুধ', 'Milk', 'food', '🥛'),
  s('tea', 'চা', 'Tea', 'food', '☕'),
  s('fruit', 'ফল', 'Fruit', 'food', '🍎'),
  s('banana', 'কলা', 'Banana', 'food', '🍌'),
  s('biscuit', 'বিস্কুট', 'Biscuit', 'food', '🍪'),
  s('juice', 'জুস', 'Juice', 'food', '🧃'),

  // Health
  s('pain', 'ব্যথা', 'Pain', 'health', '🤕'),
  s('headache', 'মাথা ব্যথা', 'Headache', 'health', '🤒'),
  s('stomachache', 'পেট ব্যথা', 'Stomach ache', 'health', '🤢'),
  s('toothache', 'দাঁত ব্যথা', 'Toothache', 'health', '🦷'),
  s('fever', 'জ্বর', 'Feverish', 'health', '🌡️'),
  s('cough', 'কাশি', 'Cough', 'health', '😷'),
  s('dizzy', 'মাথা ঘোরা', 'Dizzy', 'health', '😵‍💫'),
  s('nausea', 'বমি ভাব', 'Nausea', 'health', '🤮'),
  s('breath', 'শ্বাসকষ্ট', 'Hard to breathe', 'health', '🫁'),
  s('unwell', 'শরীর খারাপ', 'Unwell', 'health', '🤧'),
  s('itch', 'চুলকানি', 'Itchy', 'health', '🩹'),
  s('medicine', 'ওষুধ', 'Medicine', 'health', '💊'),
  s('hand', 'হাত', 'Hand', 'health', '🖐️'),
  s('leg', 'পা', 'Leg', 'health', '🦵'),
  s('back', 'পিঠ', 'Back', 'health', '🧍'),
  s('ear', 'কান', 'Ear', 'health', '👂'),
  s('eye', 'চোখ', 'Eye', 'health', '👁️'),
  s('throat', 'গলা', 'Throat', 'health', '🧣'),
  s('chest', 'বুক', 'Chest', 'health', '🫀'),

  // Common phrases
  s('yes', 'হ্যাঁ', 'Yes', 'phrases', '👍', ['জি']),
  s('no', 'না', 'No', 'phrases', '👎'),
  s('thanks', 'ধন্যবাদ', 'Thank you', 'phrases', '🙏'),
  s('sorry', 'দুঃখিত', 'Sorry', 'phrases', '😔'),
  s('please', 'দয়া করে', 'Please', 'phrases', '🥺', ['প্লিজ']),
  s('hello', 'হ্যালো', 'Hello', 'phrases', '🙋'),
  s('how_are_you', 'কেমন আছেন', 'How are you?', 'phrases', '🤗', ['কেমন আছ']),
  s('i_am_fine', 'ভালো আছি', "I'm fine", 'phrases', '👌'),
  s('okay', 'ঠিক আছে', 'Okay', 'phrases', '🆗'),
  s('dont_know', 'জানি না', "I don't know", 'phrases', '🤷'),
  s('not_understand', 'বুঝিনি', "I didn't understand", 'phrases', '🤔'),
  s('bye', 'বিদায়', 'Goodbye', 'phrases', '👋'),

  // Emergency
  s('urgent_help', 'জরুরি সাহায্য', 'Urgent help', 'emergency', '🚨'),
  s('danger', 'বিপদ', 'Danger', 'emergency', '⚠️'),
  s('fell', 'পড়ে গেছি', 'I fell', 'emergency', '🆘'),
];
