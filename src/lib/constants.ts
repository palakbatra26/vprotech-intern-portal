export const DOMAINS = [
  'Networking Security / Cybersecurity',
  'Full Stack Developer',
  'Graphic Design',
  'AI / ML Developer',
] as const;

export type Domain = (typeof DOMAINS)[number];

export const EXAM_DURATION_MINUTES = 30;
export const TOTAL_QUESTIONS = 30;
export const MAX_VIOLATIONS = 3;

export const DOMAIN_ICONS: Record<Domain, string> = {
  'Networking Security / Cybersecurity': '🛡️',
  'Full Stack Developer': '💻',
  'Graphic Design': '🎨',
  'AI / ML Developer': '🤖',
};

export const DOMAIN_COLORS: Record<Domain, string> = {
  'Networking Security / Cybersecurity': 'from-blue-600 to-cyan-500',
  'Full Stack Developer': 'from-violet-600 to-blue-500',
  'Graphic Design': 'from-pink-500 to-orange-400',
  'AI / ML Developer': 'from-emerald-500 to-teal-400',
};
