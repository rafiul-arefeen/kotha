import type { RegisterId } from '@/types';

export interface StarterPhrase {
  text: string;
  en: string;
}

/**
 * Shown before the user has chosen who they are talking to. These avoid
 * তুমি/আপনি forms so no register is assumed.
 */
export const NEUTRAL_STARTER_PHRASES: StarterPhrase[] = [
  { text: 'আমি টয়লেটে যেতে চাই।', en: 'I need the toilet' },
  { text: 'আমার খিদে পেয়েছে।', en: "I'm hungry" },
  { text: 'আমার ব্যথা করছে।', en: 'I am in pain' },
  { text: 'আমি একটু বিশ্রাম নিতে চাই।', en: 'I want to rest' },
];

/**
 * Suggestions shown in the "এখন হয়তো লাগবে" row before the user has any
 * history. Once history exists, the user's own frequent phrases replace them.
 */
export const STARTER_PHRASES: Record<RegisterId, StarterPhrase[]> = {
  family: [
    { text: 'আমি একটু পানি চাই।', en: 'I want some water' },
    { text: 'আমার খিদে পেয়েছে।', en: "I'm hungry" },
    { text: 'আমি টয়লেটে যেতে চাই।', en: 'I need the toilet' },
    { text: 'আমি একটু বিশ্রাম নিতে চাই।', en: 'I want to rest' },
    { text: 'আম্মুকে একটু ডেকে দাও।', en: 'Please call mum' },
  ],
  friend: [
    { text: 'তুমি কেমন আছ?', en: 'How are you?' },
    { text: 'চলো একসাথে খেলি।', en: "Let's play together" },
    { text: 'একটু অপেক্ষা করো।', en: 'Wait a moment' },
    { text: 'আমার ভালো লাগছে।', en: 'I feel good' },
  ],
  teacher: [
    { text: 'আমি বুঝতে পারিনি, আরেকবার বলবেন?', en: "I didn't understand, could you repeat?" },
    { text: 'আমি কি একটু টয়লেটে যেতে পারি?', en: 'May I go to the toilet?' },
    { text: 'আমি উত্তর দিতে চাই।', en: 'I want to answer' },
    { text: 'আমার একটু সাহায্য লাগবে।', en: 'I need some help' },
  ],
  doctor: [
    { text: 'আমার মাথা ব্যথা করছে।', en: 'I have a headache' },
    { text: 'আমার পেটে ব্যথা করছে।', en: 'My stomach hurts' },
    { text: 'আমার শ্বাস নিতে কষ্ট হচ্ছে।', en: "It's hard to breathe" },
    { text: 'ওষুধ কখন খেতে হবে, একটু বলবেন?', en: 'When should I take the medicine?' },
  ],
  stranger: [
    { text: 'আমি এই অ্যাপ দিয়ে কথা বলি, একটু সময় দিন।', en: 'I talk using this app, please give me time' },
    { text: 'আপনি কি আমাকে একটু সাহায্য করতে পারবেন?', en: 'Could you help me?' },
    { text: 'আপনাকে ধন্যবাদ।', en: 'Thank you' },
    { text: 'একটা রিকশা কি ডেকে দিতে পারবেন?', en: 'Could you call a rickshaw?' },
  ],
  caregiver: [
    { text: 'আমি টয়লেটে যেতে চাই।', en: 'I need the toilet' },
    { text: 'আমাকে কি একটু পানি দিতে পারবেন?', en: 'Could you give me some water?' },
    { text: 'আমি একটু পাশ ফিরতে চাই।', en: 'I want to turn over' },
    { text: 'আমার ওষুধের সময় হয়েছে।', en: "It's time for my medicine" },
  ],
};
