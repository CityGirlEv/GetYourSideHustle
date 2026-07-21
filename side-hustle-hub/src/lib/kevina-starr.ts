/** Kevina Starr Stories — Kids Side Hustle Corner */

/** Primary public handle for About / follow CTAs */
export const KEVINA_CHANNEL_HANDLE = "@KevinaStarrStories";
export const KEVINA_CHANNEL_URL = "https://www.youtube.com/@KevinaStarrStories";
export const KEVINA_CHANNEL_NAME = "Kevina Starr Stories";
export const KEVINA_CHANNEL_ID = "UC1vmj6h-voNOymbsApdBvpw";
/** Uploads playlist = UU + channelId without UC */
export const KEVINA_UPLOADS_PLAYLIST = "UU1vmj6h-voNOymbsApdBvpw";

/** Glow Getter TikTok */
export const KEVINA_TIKTOK_HANDLE = "@KevinaGlowGetter";
export const KEVINA_TIKTOK_URL = "https://www.tiktok.com/@KevinaGlowGetter";

/** Official channel bio from YouTube About */
export const KEVINA_BIO = `🌟 Welcome to the world of Kevina Starr —
A magical place where stories sparkle, kindness glows, and every child learns how to shine.

Here, Kevina reads bedtime adventures from her enchanted Library of Light, helping new friends discover the power of being themselves. Kevina Starr is a Glow Getter.

A Glow Getter is someone who:
💖 Believes in kindness
✨ Celebrates what makes them different
🌈 Shines their light to help others glow too

What you can expect:
✨ New stories weekly
💖 Diversity, inclusion, and gentle life lessons
🌈 Perfect for bedtime or anytime your little star needs to glow
📚 Stay tuned for the following: Storybooks, coloring books & glow-worthy merch!`;

export type KevinaEpisode = {
  videoId: string;
  title: string;
  theme: string;
  hustleLesson: string;
  activity: string;
};

export const KEVINA_FEATURED_EPISODES: KevinaEpisode[] = [
  {
    videoId: "d97e8cPOTH8",
    title: "Be Yourself ✨ | A Kevina Glow Getter™ Bedtime Story for Kids",
    theme: "Confidence & Being You",
    hustleLesson: "Glow Getters shine by being themselves — the first step to any dream hustle.",
    activity: "Draw a picture of what makes YOU special, then share it with a grown-up.",
  },
  {
    videoId: "z5QnFyQ41KY",
    title: "Ember's First Magical Flight Adventure",
    theme: "Courage & Trying New Things",
    hustleLesson: "Big adventures start with one brave try — just like starting a first junior job.",
    activity: "After watching, name one new thing you want to try this week.",
  },
  {
    videoId: "q70tGavSm9E",
    title: "How Can I Be More Confident Every Day?",
    theme: "Daily Confidence",
    hustleLesson: "Confidence grows with practice — same way money skills grow with small jobs.",
    activity: "Write three kind things about yourself on sticky notes and put them on your mirror.",
  },
  {
    videoId: "gacSdfqtJDM",
    title: "MOST MAGICAL Fantasy ASMR — Cosmic Cookies!",
    theme: "Creativity & Calm",
    hustleLesson: "Creative calm helps kids focus — great for crafts, stickers, and story projects.",
    activity: "Invent your own “cosmic cookie” recipe (pretend ingredients welcome!).",
  },
];
