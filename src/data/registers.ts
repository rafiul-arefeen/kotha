import type { Register, RegisterId } from '@/types';

/**
 * Who the message is for. The register decides the Bangla pronoun level
 * (তুমি / আপনি) and which phrasing is offered first.
 */
export const REGISTERS: Register[] = [
  {
    id: 'family',
    label: 'পরিবার / পরিচিত',
    en: 'Family',
    icon: '🏠',
    pronoun: 'tumi',
    pronounCertain: true,
    description: 'মা-বাবা, ভাই-বোন, কাছের মানুষ',
  },
  {
    id: 'friend',
    label: 'বন্ধু',
    en: 'Friend',
    icon: '🧑‍🤝‍🧑',
    pronoun: 'tumi',
    pronounCertain: true,
    description: 'বন্ধু, সহপাঠী',
  },
  {
    id: 'teacher',
    label: 'শিক্ষক',
    en: 'Teacher',
    icon: '🏫',
    pronoun: 'apni',
    pronounCertain: true,
    description: 'স্কুল বা থেরাপির শিক্ষক',
  },
  {
    id: 'doctor',
    label: 'ডাক্তার',
    en: 'Doctor',
    icon: '🩺',
    pronoun: 'apni',
    pronounCertain: true,
    description: 'ডাক্তার, নার্স, থেরাপিস্ট',
  },
  {
    id: 'stranger',
    label: 'অপরিচিত',
    en: 'Stranger',
    icon: '👤',
    pronoun: 'apni',
    pronounCertain: true,
    description: 'দোকানদার, রিকশাচালক, নতুন মানুষ',
  },
  {
    id: 'caregiver',
    label: 'সেবাকারী',
    en: 'Carer',
    icon: '🤲',
    pronoun: 'apni',
    // Many people address a long-term carer with তুমি, others with আপনি.
    pronounCertain: false,
    description: 'যিনি দেখাশোনা করেন',
  },
];

export const REGISTER_BY_ID = Object.fromEntries(REGISTERS.map((r) => [r.id, r])) as Record<
  RegisterId,
  Register
>;

export const PRONOUN_LABEL = {
  tumi: 'তুমি',
  apni: 'আপনি',
} as const;
