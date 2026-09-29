export type HomePillarDisplay = {
  kicker: string;
  script: string;
};

const HOME_PILLAR_DISPLAY: HomePillarDisplay[] = [
  { kicker: 'Wear the', script: 'Mindset' },
  { kicker: 'Practical', script: 'Tools' },
  { kicker: 'Real Life', script: 'Resources' },
  { kicker: 'Daily', script: 'Encourage' },
  { kicker: 'A Stronger', script: 'You' },
];

export function homePillarDisplay(index: number, fallbackTitle = ''): HomePillarDisplay {
  const known = HOME_PILLAR_DISPLAY[index];
  if (known) return known;

  const words = fallbackTitle.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { kicker: '', script: '' };
  if (words.length === 1) return { kicker: '', script: titleCaseWord(words[0]) };

  return {
    kicker: words.slice(0, -1).map(titleCaseWord).join(' '),
    script: titleCaseWord(words[words.length - 1]),
  };
}

export function homeMoodLabelDisplay(label: string): string {
  return label
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(titleCaseWord)
    .join(' ');
}

export function homeMoodTitleDisplay(title = ''): HomePillarDisplay {
  const cleaned = stripClosingPunctuation(title);
  if (!cleaned || /how are you feeling today/i.test(cleaned)) {
    return { kicker: 'How Are You', script: 'Feeling Today?' };
  }
  return splitHeading(cleaned, 2);
}

export const HOME_WHO_WON_TODAY_LABEL = 'Who Won Today?';
export const HOME_WHO_WON_TODAY_TARGET = 'receipts';
export const HOME_WHO_WON_TODAY_POP_CLASS = 'home-who-won-today-pop';
export const HOME_RECEIPTS_HEADING = 'WHAT WON TODAY? (PLAN RECEIPTS)';

export function homeReceiptsTitleDisplay(title = ''): HomePillarDisplay {
  const cleaned = stripClosingPunctuation(title.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim());
  if (!cleaned || /what won today/i.test(cleaned)) {
    return { kicker: 'Plan Receipts', script: 'What Won Today?' };
  }
  return splitHeading(cleaned, 2);
}

export function homeMovementTitleDisplay(title = ''): HomePillarDisplay {
  const cleaned = stripClosingPunctuation(title);
  if (!cleaned || /a movement for real life/i.test(cleaned)) {
    return { kicker: 'A Movement for', script: 'Real Life' };
  }
  return splitHeading(cleaned, 2);
}

function splitHeading(cleaned: string, scriptWords: number): HomePillarDisplay {
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length <= scriptWords) {
    return { kicker: '', script: words.map(titleCaseWord).join(' ') };
  }
  return {
    kicker: words.slice(0, -scriptWords).map(titleCaseWord).join(' '),
    script: words.slice(-scriptWords).map(titleCaseWord).join(' '),
  };
}

function stripClosingPunctuation(title: string): string {
  return title.replace(/[?!.]+$/g, '').trim();
}

function titleCaseWord(word: string): string {
  const lower = word.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
