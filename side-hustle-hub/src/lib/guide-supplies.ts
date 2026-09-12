/**
 * Physical / consumable supply lists with rough USD estimates for Launch guides.
 * Prices vary by store — treat as planning ranges, not quotes.
 * Apps, phones, and durable tools belong in Tools — not here.
 */

export type GuideSupplyItem = {
  id: string;
  name: string;
  /** Quantity to buy/bring, e.g. "1", "1 pack (50)", "4–6". */
  qty: string;
  /** Rough store range, e.g. "$6–10". */
  estCost: string;
  notes?: string;
  optional?: boolean;
};

export type GuideSupplyList = {
  items: GuideSupplyItem[];
  /** Ballpark to assemble a first-job kit (new buys only). */
  starterKitTotal: string;
};

function s(
  id: string,
  name: string,
  qty: string,
  estCost: string,
  notes?: string,
  optional?: boolean,
): GuideSupplyItem {
  return { id, name, qty, estCost, notes, optional };
}

/** Free / local hustles that need a real supply list. */
export const GUIDE_SUPPLIES: Record<string, GuideSupplyList> = {
  "car-interior-cleanup": {
    starterKitTotal:
      "About $25–55 if you buy everything new (less if you borrow a vacuum)",
    items: [
      s("microfiber", "Microfiber cloths", "1 pack (6)", "$6–12"),
      s("apc", "Mild all-purpose cleaner (dilute)", "1 bottle", "$3–8", "Avoid bleach on fabric seats"),
      s("glass", "Interior glass cleaner", "1 bottle", "$3–7"),
      s("trash", "Trash bags (kitchen size)", "1 box", "$4–8"),
      s("lint", "Lint roller (pet hair)", "1", "$3–6", undefined, true),
      s("crate", "Milk crate or tote for supplies", "1", "$5–10", undefined, true),
      s("freshener", "Air freshener", "1–2", "$2–5", "Only if client asks", true),
    ],
  },

  "dog-walk": {
    starterKitTotal: "About $5–20 if you buy bags (and a backup leash)",
    items: [
      s("bags", "Dog waste bags", "1 roll", "$4–8"),
      s("leash", "Backup leash", "1", "$8–15", "Most owners provide their own", true),
      s("water", "Collapsible water bowl", "1", "$5–12", undefined, true),
      s("treats", "Dog treats", "1 small bag", "$4–8", "Only if owner OK", true),
    ],
  },

  "pet-sitting": {
    starterKitTotal: "About $0–15 for extras (food and keys from owner)",
    items: [
      s("keys", "House key / lockbox code", "1", "$0", "from owner"),
      s("bags", "Waste bags", "1 roll", "$4–8", undefined, true),
      s("notebook", "Small care-log notebook", "1", "$2–4", undefined, true),
      s("flashlight", "Small flashlight for evening visits", "1", "$5–10", undefined, true),
    ],
  },

  "yard-help": {
    starterKitTotal:
      "About $10–40 if you buy gloves and bags (less if you borrow tools)",
    items: [
      s("gloves", "Work gloves", "1 pair", "$5–12"),
      s("bags", "Lawn / leaf bags", "1 pack", "$5–12"),
      s("sunscreen", "Sunscreen", "1 bottle", "$5–10", undefined, true),
      s("water", "Reusable water bottle", "1", "$5–12", undefined, true),
    ],
  },

  "leaf-raking": {
    starterKitTotal:
      "About $15–35 for bags and gloves (less if you borrow a rake); optional Mini Hand Held Blower purchase ~$40–80",
    items: [
      s("bags", "Paper or plastic yard bags", "1 pack", "$8–15"),
      s("gloves", "Work gloves", "1 pair", "$5–12"),
      s("tarp", "Tarp for dragging piles", "1", "$8–18", undefined, true),
      s("rake", "Leaf rake", "1", "$12–22", "Borrow first when possible", true),
      s(
        "mini-blower",
        "Mini Hand Held Blower",
        "1",
        "$40–80",
        "Optional purchase — Side-Hustlers who pick this Side-Hustle are eligible for a Free Mini Hand-Held Blower drawing (conditions apply; inquire via Contact Form)",
        true,
      ),
    ],
  },

  "plant-watering": {
    starterKitTotal: "About $0–12 (keys from owner; can optional)",
    items: [
      s("keys", "Key / lockbox", "1", "$0", "from owner"),
      s("watercan", "Watering can or pitcher", "1", "$5–12", "Use owner’s first", true),
      s("plantfood", "Liquid plant food (mild)", "1 small bottle", "$4–8", undefined, true),
    ],
  },

  "trash-can-service": {
    starterKitTotal: "About $5–20 for gloves (headlamp optional)",
    items: [
      s("gloves", "Work gloves", "1 pair", "$5–12"),
      s("light", "Headlamp for early curb days", "1", "$8–15", undefined, true),
      s("sanitizer", "Hand sanitizer or wipes", "1", "$3–6", undefined, true),
    ],
  },

  "neighborhood-helper": {
    starterKitTotal: "About $8–20 for gloves, sanitizer, and flyers",
    items: [
      s("gloves", "Disposable or work gloves", "1 pack / pair", "$4–8"),
      s("sanitizer", "Hand sanitizer", "1 bottle", "$2–5"),
      s("flyer", "Printed rate flyers (paper)", "20–50 sheets", "$3–8"),
      s("bags", "Reusable shopping bags for grocery carry-in", "2–4", "$5–12", undefined, true),
    ],
  },

  "errand-runner": {
    starterKitTotal: "About $5–25 for tote (cooler optional)",
    items: [
      s("tote", "Sturdy tote / backpack", "1", "$8–15"),
      s("envelope", "Envelope or zip pouch for receipts", "1", "$1–3"),
      s("cooler", "Small cooler for groceries", "1", "$10–25", undefined, true),
    ],
  },

  "vacation-mail-plant-helper": {
    starterKitTotal: "About $0–8 (keys from owner)",
    items: [
      s("keys", "Key / lockbox", "1", "$0", "from owner"),
      s("checklist", "Printed plant watering checklist (paper)", "1 pad", "$2–4", undefined, true),
      s("cloth", "Small towel for spills", "1", "$2–5", undefined, true),
    ],
  },

  "recycling-helper": {
    starterKitTotal: "About $5–20 for gloves and bags",
    items: [
      s("gloves", "Work gloves", "1 pair", "$5–12"),
      s("bags", "Clear recycle bags (if required locally)", "1 pack", "$5–10", undefined, true),
      s("sanitizer", "Hand wipes or sanitizer", "1", "$3–6", undefined, true),
    ],
  },

  "garage-sale-helper": {
    starterKitTotal: "About $10–25 for tags, bags, and signs",
    items: [
      s("tags", "Price stickers / masking tape + marker", "1 set", "$4–8"),
      s("bags", "Paper bags for buyers", "1 pack", "$4–8", undefined, true),
      s("signs", "Garage sale signs + balloons", "1 set", "$5–12", undefined, true),
      s("cashbox", "Cash box", "1", "$8–15", "Float/change from owner", true),
    ],
  },

  "holiday-decorating-helper": {
    starterKitTotal: "About $5–20 (décor is owner’s)",
    items: [
      s("hooks", "Command hooks or clips", "1 pack", "$6–12", "Only with owner OK"),
      s("gloves", "Work gloves", "1 pair", "$5–12"),
      s("ties", "Twist ties / zip ties for lights", "1 pack", "$3–6", undefined, true),
      s("bulbs", "Spare bulbs", "1 pack", "$4–8", "Often from owner", true),
    ],
  },

  "gift-wrapping": {
    starterKitTotal: "About $15–35 if you buy a starter wrap kit new",
    items: [
      s("paper", "Kraft or patterned wrapping paper", "2–3 rolls", "$8–18"),
      s("tissue", "Tissue paper", "1 pack", "$4–8"),
      s("ribbon", "Ribbon / twine", "1–2 rolls", "$4–10"),
      s("tape", "Clear tape + double-sided tape", "1–2 rolls", "$4–8"),
      s("scissors", "Scissors", "1", "$5–12"),
      s("tags", "Gift tags", "1 pack", "$3–6", undefined, true),
    ],
  },

  "lemonade-stand": {
    starterKitTotal: "About $15–30 for first weekend (ingredients + cups)",
    items: [
      s("lemons", "Lemons (or bottled lemon juice)", "8–12 / 1 bottle", "$6–12"),
      s("sugar", "Sugar", "1 bag", "$3–5"),
      s("cups", "Paper cups", "1 pack (50–100)", "$5–10"),
      s("ice", "Bag of ice", "1–2", "$2–5"),
      s("pitcher", "Pitcher", "1", "$5–12"),
      s("sign", "Poster board + markers", "1 set", "$3–8"),
    ],
  },

  "friendship-bracelet-maker": {
    starterKitTotal: "About $12–30 for cords, beads, and bags",
    items: [
      s("cord", "Embroidery floss / bracelet cord assortment", "1 pack", "$6–12"),
      s("beads", "Bead mix", "1 pack", "$5–12"),
      s("scissors", "Scissors", "1", "$3–8"),
      s("bags", "Small zip bags for finished pieces", "1 pack", "$3–6"),
      s("tape", "Masking tape or clipboard clip", "1", "$2–5", undefined, true),
      s("board", "Bracelet board", "1", "$8–15", undefined, true),
    ],
  },

  "beach-shell-jewelry": {
    starterKitTotal: "About $20–45 if you buy everything new (less if shells are free)",
    items: [
      s("bags", "Mesh or zip bags for collecting shells", "2–4", "$4–8"),
      s("shells", "Cleaned shells (or bleach soak for found shells)", "1 small batch", "$0–10", "Beach finds are free; craft-store shells cost more"),
      s("cord", "Jewelry cord / beading wire", "1–2 spools", "$5–12"),
      s("jumps", "Jump rings", "1 pack (50+)", "$3–6"),
      s("hooks", "Earring hooks", "1 pack", "$4–8"),
      s("clasps", "Clasps (lobster / spring)", "1 pack", "$4–8"),
      s("cards", "Jewelry display cards / small gift bags", "1 pack", "$5–10"),
      s("pliers", "Needle-nose or jewelry pliers", "1 pair", "$8–15", undefined, true),
    ],
  },

  crafts: {
    starterKitTotal: "About $15–40 depending on craft lane",
    items: [
      s("materials", "Primary craft materials for ~10 units", "1 kit / batch", "$10–30", "Clay, beads, stickers, or yarn — pick one lane"),
      s("packaging", "Bags / cards / stickers for packaging", "1 pack", "$5–12"),
      s("glue", "Craft glue or hot-glue sticks", "1", "$3–8", undefined, true),
    ],
  },

  "toy-organizer": {
    starterKitTotal: "About $8–25 for labels and bags (bins if needed)",
    items: [
      s("labels", "Masking tape + marker (or label pack)", "1 set", "$4–10"),
      s("bags", "Donate / trash bags", "1 box", "$4–8"),
      s("bins", "Clear bins or baskets", "2–4", "$8–20", "Prefer using what the client already owns", true),
    ],
  },

  handyman: {
    starterKitTotal: "About $15–40 for consumables and PPE (tools separate)",
    items: [
      s("ppe", "Safety glasses + work gloves", "1 set", "$8–15"),
      s("zip", "Zip ties", "1 pack", "$3–6"),
      s("tape", "Painter’s tape", "1 roll", "$4–7"),
      s("pencil", "Carpenter pencils", "2–4", "$2–5"),
      s("screws", "Assorted screws / wall anchors", "1 assortment pack", "$6–12", undefined, true),
    ],
  },

  "cleaning-service": {
    starterKitTotal: "About $35–90 for a starter residential kit (vacuum/mop separate if needed)",
    items: [
      s("gloves", "Disposable or reusable cleaning gloves", "1 box / pair", "$4–10"),
      s("microfiber", "Microfiber cloths", "6–12", "$8–16"),
      s("spray", "All-purpose + bathroom cleaner", "2 bottles", "$8–14"),
      s("glass", "Glass cleaner", "1 bottle", "$3–6"),
      s("scrub", "Scrub brush / sponge pack", "1 set", "$4–8"),
      s("bags", "Trash bags", "1 box", "$4–8"),
      s("vacuum", "Portable vacuum (if client doesn’t provide)", "1", "$40–120", "Borrow first when possible", true),
      s("mop", "Mop + bucket or spray mop (if client doesn’t provide)", "1", "$15–40", "Borrow first when possible", true),
    ],
  },

  "handyman-light": {
    starterKitTotal: "About $15–35 for hanging kit and gloves",
    items: [
      s("anchors", "Picture hanging kit / wall anchors", "1 kit", "$6–12"),
      s("ppe", "Work gloves", "1 pair", "$5–10"),
      s("caulk", "Caulk tube (touch-ups)", "1", "$4–8", "Caulk gun is a tool", true),
      s("wipes", "Cleaning wipes for touch-up mess", "1 pack", "$3–6", undefined, true),
    ],
  },

  "tech-helper": {
    starterKitTotal: "About $5–15 for wipes and a notebook",
    items: [
      s("wipes", "Screen-safe wipes", "1 pack", "$4–8"),
      s("notebook", "Small notebook (client writes Wi‑Fi notes)", "1", "$2–4"),
      s("cableties", "Cable ties / Velcro straps", "1 pack", "$4–8", undefined, true),
    ],
  },

  homework: {
    starterKitTotal: "About $5–12 for pencils and paper",
    items: [
      s("pencils", "Pencils + eraser", "1 pack", "$3–6"),
      s("paper", "Scrap / notebook paper", "1 pad", "$2–5"),
      s("flash", "Index cards (flashcards)", "1 pack", "$2–5", undefined, true),
    ],
  },

  tutoring: {
    starterKitTotal: "About $8–20 for notebook and markers",
    items: [
      s("notebook", "Session notebook", "1", "$3–6"),
      s("pens", "Pens / pencils", "1 pack", "$3–6"),
      s("whiteboard", "Small whiteboard + markers", "1 set", "$8–15", undefined, true),
      s("flash", "Index cards", "1 pack", "$2–5", undefined, true),
    ],
  },

  proofreader: {
    starterKitTotal: "About $5–15 for print markup supplies",
    items: [
      s("highlighters", "Highlighters", "1 pack (3–4)", "$4–8"),
      s("sticky", "Sticky tabs / flags", "1 pack", "$3–6"),
      s("paper", "Printer paper for marked drafts", "1 ream", "$5–10", undefined, true),
    ],
  },

  "canva-flyer-creator": {
    starterKitTotal: "About $5–15 for proof-print paper (ink optional)",
    items: [
      s("paper", "Letter paper for proof prints", "1 ream", "$4–8"),
      s("ink", "Printer ink (if you print at home)", "1 cartridge set", "$15–35", "Library or print shop avoids ink cost", true),
    ],
  },

  "basic-invitation-creator": {
    starterKitTotal: "About $10–25 if you print on cardstock",
    items: [
      s("cardstock", "Cardstock for printed invites", "1 pack", "$6–12"),
      s("envelopes", "Envelopes", "1 pack", "$4–8", undefined, true),
      s("paper", "Plain letter paper for drafts", "1 ream", "$4–8", undefined, true),
    ],
  },

  "greeting-card-creator": {
    starterKitTotal: "About $8–25 for handmade card supplies",
    items: [
      s("cardstock", "Cardstock / blank cards", "1 pack", "$6–12"),
      s("pens", "Markers / colored pencils", "1 set", "$5–12"),
      s("stickers", "Stickers / washi tape", "1 pack", "$3–8", undefined, true),
      s("glue", "Glue stick", "1", "$1–3", undefined, true),
    ],
  },

  "digital-cookbook-creator": {
    starterKitTotal: "About $5–15 if you print samples",
    items: [
      s("paper", "Photo or letter paper for sample pages", "1 pack", "$5–10"),
      s("binder", "Binder + sheet protectors", "1 set", "$6–12", undefined, true),
    ],
  },

  "family-photo-slideshow": {
    starterKitTotal: "About $5–20 for a delivery USB (prints optional)",
    items: [
      s("usb", "USB flash drive for delivering the slideshow", "1", "$6–12"),
      s("paper", "Photo paper for optional still prints", "1 pack", "$8–15", undefined, true),
    ],
  },
};

export function suppliesForGuide(guideId: string): GuideSupplyList | undefined {
  return GUIDE_SUPPLIES[guideId];
}

export function formatSupplyLine(item: GuideSupplyItem, index?: number): string {
  const num = typeof index === "number" ? `${index + 1}. ` : "";
  const opt = item.optional ? " (optional)" : "";
  const notes = item.notes ? ` — ${item.notes}` : "";
  return `${num}${item.name}${opt} — Qty: ${item.qty} — Est. ${item.estCost}${notes}`;
}

export function suppliesDisclaimer(): string {
  return "Vendor prices are estimates — check the store for current pricing. Supplies listed here are physical items to buy or borrow for the job, not apps or software.";
}
