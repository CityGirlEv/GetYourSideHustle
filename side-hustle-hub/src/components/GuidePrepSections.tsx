import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import type { GuideKit } from "../lib/guide-tools";
import {
  GUIDE_PREP_ABOUT_TAB_LABEL,
  GUIDE_PREP_DEFAULT_TAB,
  guidePrepTabIsLocked,
  type GuidePrepSectionId,
} from "../lib/guide-prep-visibility";
import {
  YOUTH_SPORTS_HELPER_NOTES_WORKSHEET,
  YOUTH_SPORTS_HELPER_REALITY_CHECK,
} from "../lib/youth-sports-helper-guide";
import {
  JUNIOR_GIVE_BACK_TEACH_NOTES_WORKSHEET,
  JUNIOR_GIVE_BACK_TEACH_REALITY_CHECK,
} from "../lib/junior-give-back-teach-guide";
import {
  KIDS_KINDNESS_SHARE_NOTES_WORKSHEET,
  KIDS_KINDNESS_SHARE_REALITY_CHECK,
} from "../lib/kids-kindness-share-guide";
import {
  BEACH_SHELL_JEWELRY_NOTES_WORKSHEET,
  BEACH_SHELL_JEWELRY_REALITY_CHECK,
} from "../lib/beach-shell-jewelry-guide";
import {
  GIFT_WRAPPING_NOTES_WORKSHEET,
  GIFT_WRAPPING_REALITY_CHECK,
} from "../lib/gift-wrapping-guide";
import {
  AFFILIATE_NOTES_WORKSHEET,
  AFFILIATE_REALITY_CHECK,
} from "../lib/affiliate-guide";
import {
  DROPSHIPPING_NOTES_WORKSHEET,
  DROPSHIPPING_REALITY_CHECK,
} from "../lib/dropshipping-guide";
import {
  ETSY_STORE_NOTES_WORKSHEET,
  ETSY_STORE_REALITY_CHECK,
} from "../lib/etsy-store-guide";
import {
  FB_MARKETPLACE_HELPER_NOTES_WORKSHEET,
  FB_MARKETPLACE_HELPER_REALITY_CHECK,
} from "../lib/fb-marketplace-helper-guide";
import {
  PORCH_PACKAGE_NOTES_WORKSHEET,
  PORCH_PACKAGE_REALITY_CHECK,
} from "../lib/porch-package-helper-guide";
import {
  BOOK_PUBLISHING_KIDS_NOTES_WORKSHEET,
  BOOK_PUBLISHING_KIDS_REALITY_CHECK,
} from "../lib/book-publishing-kids-guide";
import {
  AI_PEERS_NOTES_WORKSHEET,
  AI_PEERS_REALITY_CHECK,
} from "../lib/ai-peers-guide";
import {
  TRAVEL_RESEARCH_NOTES_WORKSHEET,
  TRAVEL_RESEARCH_REALITY_CHECK,
} from "../lib/travel-research-assistant-guide";
import {
  TRANSCRIPTION_NOTES_NOTES_WORKSHEET,
  TRANSCRIPTION_NOTES_REALITY_CHECK,
} from "../lib/transcription-notes-helper-guide";
import {
  WEBSITE_TESTER_NOTES_WORKSHEET,
  WEBSITE_TESTER_REALITY_CHECK,
} from "../lib/website-tester-guide";
import {
  COMMUNITY_NEWSLETTER_NOTES_WORKSHEET,
  COMMUNITY_NEWSLETTER_REALITY_CHECK,
} from "../lib/community-newsletter-creator-guide";
import {
  COMMUNITY_TEACHING_NOTES_WORKSHEET,
  COMMUNITY_TEACHING_REALITY_CHECK,
} from "../lib/community-teaching-workshops-guide";
import {
  REVIEW_RESPONSE_NOTES_WORKSHEET,
  REVIEW_RESPONSE_REALITY_CHECK,
} from "../lib/review-response-assistant-guide";
import {
  CAREER_CONSULTING_NOTES_WORKSHEET,
  CAREER_CONSULTING_REALITY_CHECK,
} from "../lib/career-industry-consulting-guide";
import {
  PART_TIME_NOTARY_NOTES_WORKSHEET,
  PART_TIME_NOTARY_REALITY_CHECK,
} from "../lib/part-time-notary-guide";
import {
  RESUME_LINKEDIN_NOTES_WORKSHEET,
  RESUME_LINKEDIN_REALITY_CHECK,
} from "../lib/resume-linkedin-helper-guide";
import {
  SHORT_FORM_VIDEO_NOTES_WORKSHEET,
  SHORT_FORM_VIDEO_REALITY_CHECK,
} from "../lib/short-form-video-editor-guide";
import {
  GBP_HELPER_NOTES_WORKSHEET,
  GBP_HELPER_REALITY_CHECK,
} from "../lib/google-business-profile-helper-guide";
import {
  UGC_CREATOR_NOTES_WORKSHEET,
  UGC_CREATOR_REALITY_CHECK,
} from "../lib/ugc-creator-guide";
import {
  DIGITAL_PHOTO_ORGANIZER_NOTES_WORKSHEET,
  DIGITAL_PHOTO_ORGANIZER_REALITY_CHECK,
} from "../lib/digital-photo-organizer-guide";
import {
  DIGITAL_PRODUCT_FORMATTER_NOTES_WORKSHEET,
  DIGITAL_PRODUCT_FORMATTER_REALITY_CHECK,
} from "../lib/digital-product-formatter-guide";
import {
  FLIPPING_PROPERTIES_NOTES_WORKSHEET,
  FLIPPING_PROPERTIES_REALITY_CHECK,
} from "../lib/flipping-properties-guide";
import {
  GARAGE_SALE_HELPER_NOTES_WORKSHEET,
  GARAGE_SALE_HELPER_REALITY_CHECK,
} from "../lib/garage-sale-helper-guide";
import {
  LOCAL_BUSINESS_AI_SETUP_NOTES_WORKSHEET,
  LOCAL_BUSINESS_AI_SETUP_REALITY_CHECK,
} from "../lib/local-business-ai-setup-guide";
import {
  NEIGHBORHOOD_HELPER_NOTES_WORKSHEET,
  NEIGHBORHOOD_HELPER_REALITY_CHECK,
} from "../lib/neighborhood-helper-guide";
import {
  AI_ASSETS_NOTES_WORKSHEET,
  AI_ASSETS_REALITY_CHECK,
} from "../lib/ai-assets-guide";
import {
  AIRBNB_COHOST_NOTES_WORKSHEET,
  AIRBNB_COHOST_REALITY_CHECK,
} from "../lib/airbnb-cohost-guide";
import {
  AMAZON_FBA_SELLER_NOTES_WORKSHEET,
  AMAZON_FBA_SELLER_REALITY_CHECK,
} from "../lib/amazon-fba-seller-guide";
import {
  VIRTUAL_CALL_ASSISTANT_NOTES_WORKSHEET,
  VIRTUAL_CALL_ASSISTANT_REALITY_CHECK,
} from "../lib/virtual-call-assistant-guide";
import {
  AI_SOCIAL_HELPER_NOTES_WORKSHEET,
  AI_SOCIAL_HELPER_REALITY_CHECK,
} from "../lib/ai-social-helper-guide";
import {
  BIRTHDAY_PARTY_HELPER_NOTES_WORKSHEET,
  BIRTHDAY_PARTY_HELPER_REALITY_CHECK,
} from "../lib/birthday-party-helper-guide";
import {
  CLOSET_ORGANIZER_NOTES_WORKSHEET,
  CLOSET_ORGANIZER_REALITY_CHECK,
} from "../lib/closet-organizer-guide";
import {
  LIEN_TAX_SALES_NOTES_WORKSHEET,
  LIEN_TAX_SALES_REALITY_CHECK,
} from "../lib/lien-tax-sales-guide";
import {
  JUNIOR_CONTENT_CREATE_NOTES_WORKSHEET,
  JUNIOR_CONTENT_CREATE_REALITY_CHECK,
} from "../lib/junior-content-create-guide";
import {
  KIDS_CRAFT_HUSTLE_NOTES_WORKSHEET,
  KIDS_CRAFT_HUSTLE_REALITY_CHECK,
} from "../lib/kids-craft-hustle-guide";
import {
  CREATE_GAMES_KIDS_NOTES_WORKSHEET,
  CREATE_GAMES_KIDS_REALITY_CHECK,
} from "../lib/create-games-kids-guide";
import {
  CREATE_GAMES_JUNIOR_NOTES_WORKSHEET,
  CREATE_GAMES_JUNIOR_REALITY_CHECK,
} from "../lib/create-games-junior-guide";
import {
  CUSTOM_BOOKMARK_CREATOR_NOTES_WORKSHEET,
  CUSTOM_BOOKMARK_CREATOR_REALITY_CHECK,
} from "../lib/custom-bookmark-creator-guide";
import {
  WEB_LEADS_NOTES_WORKSHEET,
  WEB_LEADS_REALITY_CHECK,
} from "../lib/web-leads-guide";
import {
  MAILBOX_CLEANING_NOTES_WORKSHEET,
  MAILBOX_CLEANING_REALITY_CHECK,
} from "../lib/mailbox-cleaning-guide";
import {
  VIRTUAL_ASSISTANT_NOTES_WORKSHEET,
  VIRTUAL_ASSISTANT_REALITY_CHECK,
} from "../lib/virtual-assistant-guide";
import {
  VIRTUAL_RECEPTIONIST_NOTES_WORKSHEET,
  VIRTUAL_RECEPTIONIST_REALITY_CHECK,
} from "../lib/virtual-receptionist-guide";
import {
  SOCIAL_INFLUENCER_NOTES_WORKSHEET,
  SOCIAL_INFLUENCER_REALITY_CHECK,
} from "../lib/social-influencer-guide";
import {
  JUNIOR_SAVINGS_CEO_NOTES_WORKSHEET,
  JUNIOR_SAVINGS_CEO_REALITY_CHECK,
} from "../lib/junior-savings-ceo-guide";
import {
  COMMUNITY_MODERATOR_NOTES_WORKSHEET,
  COMMUNITY_MODERATOR_REALITY_CHECK,
} from "../lib/online-community-moderator-guide";
import {
  BASIC_INVITATION_NOTES_WORKSHEET,
  BASIC_INVITATION_REALITY_CHECK,
} from "../lib/basic-invitation-creator-guide";
import {
  POD_NOTES_WORKSHEET,
  POD_REALITY_CHECK,
} from "../lib/pod-guide";
import {
  PET_SITTING_NOTES_WORKSHEET,
  PET_SITTING_REALITY_CHECK,
} from "../lib/pet-sitting-guide";
import {
  FRIENDSHIP_BRACELET_NOTES_WORKSHEET,
  FRIENDSHIP_BRACELET_REALITY_CHECK,
} from "../lib/friendship-bracelet-maker-guide";
import {
  LEAF_RAKING_NOTES_WORKSHEET,
  LEAF_RAKING_REALITY_CHECK,
} from "../lib/leaf-raking-guide";
import {
  LEMONADE_STAND_NOTES_WORKSHEET,
  LEMONADE_STAND_REALITY_CHECK,
} from "../lib/lemonade-stand-guide";
import {
  AIRBNB_HOSTING_NOTES_WORKSHEET,
  AIRBNB_HOSTING_REALITY_CHECK,
} from "../lib/airbnb-hosting-guide";
import {
  DIGITAL_COOKBOOK_NOTES_WORKSHEET,
  DIGITAL_COOKBOOK_REALITY_CHECK,
} from "../lib/digital-cookbook-creator-guide";
import {
  FAMILY_PHOTO_SLIDESHOW_NOTES_WORKSHEET,
  FAMILY_PHOTO_SLIDESHOW_REALITY_CHECK,
} from "../lib/family-photo-slideshow-guide";
import {
  LOCAL_RESOURCE_LIST_NOTES_WORKSHEET,
  LOCAL_RESOURCE_LIST_REALITY_CHECK,
} from "../lib/local-resource-list-creator-guide";
import {
  RECYCLING_HELPER_NOTES_WORKSHEET,
  RECYCLING_HELPER_REALITY_CHECK,
} from "../lib/recycling-helper-guide";
import {
  PROOFREADER_NOTES_WORKSHEET,
  PROOFREADER_REALITY_CHECK,
} from "../lib/proofreader-guide";
import {
  TOY_ORGANIZER_NOTES_WORKSHEET,
  TOY_ORGANIZER_REALITY_CHECK,
} from "../lib/toy-organizer-guide";
import {
  TRASH_CAN_SERVICE_NOTES_WORKSHEET,
  TRASH_CAN_SERVICE_REALITY_CHECK,
} from "../lib/trash-can-service-guide";
import {
  HOMEWORK_HELPER_NOTES_WORKSHEET,
  HOMEWORK_HELPER_REALITY_CHECK,
} from "../lib/homework-helper-guide";
import {
  CANVA_FLYER_NOTES_WORKSHEET,
  CANVA_FLYER_REALITY_CHECK,
} from "../lib/canva-flyer-creator-guide";
import {
  CAR_INTERIOR_NOTES_WORKSHEET,
  CAR_INTERIOR_REALITY_CHECK,
} from "../lib/car-interior-cleanup-guide";
import {
  NEIGHBORHOOD_DOG_WALKER_NOTES_WORKSHEET,
  NEIGHBORHOOD_DOG_WALKER_REALITY_CHECK,
} from "../lib/neighborhood-dog-walker-guide";
import {
  GREETING_CARD_NOTES_WORKSHEET,
  GREETING_CARD_REALITY_CHECK,
} from "../lib/greeting-card-creator-guide";
import {
  HOLIDAY_DECORATING_NOTES_WORKSHEET,
  HOLIDAY_DECORATING_REALITY_CHECK,
} from "../lib/holiday-decorating-helper-guide";
import {
  LIGHT_HANDYMAN_NOTES_WORKSHEET,
  LIGHT_HANDYMAN_REALITY_CHECK,
} from "../lib/light-handyman-home-help-guide";
import {
  TUTORING_SKILLS_NOTES_WORKSHEET,
  TUTORING_SKILLS_REALITY_CHECK,
} from "../lib/tutoring-skills-coaching-guide";
import {
  VACATION_PLANT_NOTES_WORKSHEET,
  VACATION_PLANT_REALITY_CHECK,
} from "../lib/vacation-plant-helper-guide";
import {
  PLANT_WATERING_NOTES_WORKSHEET,
  PLANT_WATERING_REALITY_CHECK,
} from "../lib/plant-watering-guide";
import {
  CRAFTS_NOTES_WORKSHEET,
  CRAFTS_REALITY_CHECK,
} from "../lib/crafts-guide";
import {
  KIDS_PIGGY_FIRST_GOAL_NOTES_WORKSHEET,
  KIDS_PIGGY_FIRST_GOAL_REALITY_CHECK,
} from "../lib/kids-piggy-first-goal-guide";
import {
  displayPrerequisiteLabel,
  expandStandaloneHustleCopy,
} from "../lib/side-hustle-copy";
import {
  formatGuideToolLine,
  organizeSuggestedPricingCopy,
  pricingItemLabel,
  deliveryDriverToolsDisclaimer,
  estateSaleToolsDisclaimer,
  genealogyToolsDisclaimer,
  kidsPartyGameHostToolsDisclaimer,
  leadFollowupToolsDisclaimer,
  localContentPhotoToolsDisclaimer,
  personalShopperToolsDisclaimer,
  youthSportsHelperToolsDisclaimer,
  juniorGiveBackTeachToolsDisclaimer,
  kidsKindnessShareToolsDisclaimer,
  kidsPiggyFirstGoalToolsDisclaimer,
  beachShellJewelryToolsDisclaimer,
  giftWrappingToolsDisclaimer,
  affiliateToolsDisclaimer,
  dropshippingToolsDisclaimer,
  etsyStoreToolsDisclaimer,
  fbMarketplaceHelperToolsDisclaimer,
  porchPackageHelperToolsDisclaimer,
  bookPublishingKidsToolsDisclaimer,
  aiPeersToolsDisclaimer,
  travelResearchAssistantToolsDisclaimer,
  transcriptionNotesHelperToolsDisclaimer,
  websiteTesterToolsDisclaimer,
  communityNewsletterCreatorToolsDisclaimer,
  communityTeachingWorkshopsToolsDisclaimer,
  reviewResponseAssistantToolsDisclaimer,
  careerIndustryConsultingToolsDisclaimer,
  partTimeNotaryToolsDisclaimer,
  resumeLinkedInHelperToolsDisclaimer,
  shortFormVideoEditorToolsDisclaimer,
  googleBusinessProfileHelperToolsDisclaimer,
  ugcCreatorToolsDisclaimer,
  digitalPhotoOrganizerToolsDisclaimer,
  digitalProductFormatterToolsDisclaimer,
  flippingPropertiesToolsDisclaimer,
  garageSaleHelperToolsDisclaimer,
  localBusinessAiSetupToolsDisclaimer,
  neighborhoodHelperToolsDisclaimer,
  aiAssetsToolsDisclaimer,
  airbnbCohostToolsDisclaimer,
  amazonFbaSellerToolsDisclaimer,
  virtualCallAssistantToolsDisclaimer,
  aiSocialHelperToolsDisclaimer,
  birthdayPartyHelperToolsDisclaimer,
  closetOrganizerToolsDisclaimer,
  lienTaxSalesToolsDisclaimer,
  juniorContentCreateToolsDisclaimer,
  kidsCraftHustleToolsDisclaimer,
  createGamesKidsToolsDisclaimer,
  createGamesJuniorToolsDisclaimer,
  customBookmarkCreatorToolsDisclaimer,
  webLeadsToolsDisclaimer,
  mailboxCleaningToolsDisclaimer,
  virtualAssistantToolsDisclaimer,
  virtualReceptionistToolsDisclaimer,
  socialInfluencerToolsDisclaimer,
  juniorSavingsCeoToolsDisclaimer,
  onlineCommunityModeratorToolsDisclaimer,
  basicInvitationToolsDisclaimer,
  podToolsDisclaimer,
  petSittingToolsDisclaimer,
  appointmentSetterToolsDisclaimer,
  mothersHelperToolsDisclaimer,
  babysittingToolsDisclaimer,
  errandRunnerToolsDisclaimer,
  aiAgentsToolsDisclaimer,
  aiPromoVideoToolsDisclaimer,
  aiTimingToolsDisclaimer,
  techHelperToolsDisclaimer,
  plantWateringToolsDisclaimer,
  craftsToolsDisclaimer,
  yardHelpToolsDisclaimer,
  homeworkOrganizerToolsDisclaimer,
  groupSetupHelperToolsDisclaimer,
  houseSitterToolsDisclaimer,
  bookkeepingToolsDisclaimer,
  closetCleanoutListingToolsDisclaimer,
  nonprofitSocialHelperToolsDisclaimer,
  digitalProductsToolsDisclaimer,
  bookPublishingToolsDisclaimer,
  startGardeningClubToolsDisclaimer,
  startBookClubToolsDisclaimer,
  foreclosurePropertiesToolsDisclaimer,
  cleaningServiceToolsDisclaimer,
  kidsGamesAiToolsDisclaimer,
  aiPromptHelperToolsDisclaimer,
  juniorGamesAiToolsDisclaimer,
  rideshareToolsDisclaimer,
  localEventContentToolsDisclaimer,
  propertyMgmtToolsDisclaimer,
  juniorReinvestCeoToolsDisclaimer,
  kidsReinvestJarToolsDisclaimer,
  airbnbTurnoverCheckerToolsDisclaimer,
  strCohostToolsDisclaimer,
  friendshipBraceletToolsDisclaimer,
  leafRakingToolsDisclaimer,
  lemonadeStandToolsDisclaimer,
  airbnbHostingToolsDisclaimer,
  digitalCookbookToolsDisclaimer,
  familyPhotoSlideshowToolsDisclaimer,
  localResourceListToolsDisclaimer,
  recyclingHelperToolsDisclaimer,
  proofreaderToolsDisclaimer,
  toyOrganizerToolsDisclaimer,
  trashCanServiceToolsDisclaimer,
  homeworkHelperToolsDisclaimer,
  canvaFlyerToolsDisclaimer,
  carInteriorToolsDisclaimer,
  neighborhoodDogWalkerToolsDisclaimer,
  greetingCardToolsDisclaimer,
  holidayDecoratingToolsDisclaimer,
  lightHandymanToolsDisclaimer,
  tutoringSkillsToolsDisclaimer,
  vacationPlantToolsDisclaimer,
  guideToolsDisclaimer,
  prerequisitesDisclaimer,
  pricingDisclaimer,
  suppliesDisclaimer,
} from "../lib/guide-tools";
import {
  MOTHERS_HELPER_NOTES_WORKSHEET,
  MOTHERS_HELPER_REALITY_CHECK,
} from "../lib/mothers-helper-guide";
import {
  FOOD_DELIVERY_NOTES_WORKSHEET,
  FOOD_DELIVERY_REALITY_CHECK,
} from "../lib/food-delivery-guide";
import {
  ESTATE_SALE_NOTES_WORKSHEET,
  ESTATE_SALE_REALITY_CHECK,
} from "../lib/estate-sale-antique-resales-guide";
import {
  GENEALOGY_NOTES_WORKSHEET,
  GENEALOGY_REALITY_CHECK,
} from "../lib/genealogy-family-history-guide";
import {
  KIDS_PARTY_GAME_HOST_NOTES_WORKSHEET,
  KIDS_PARTY_GAME_HOST_REALITY_CHECK,
} from "../lib/kids-party-game-host-guide";
import {
  LEAD_FOLLOWUP_NOTES_WORKSHEET,
  LEAD_FOLLOWUP_REALITY_CHECK,
} from "../lib/lead-followup-assistant-guide";
import {
  APPOINTMENT_SETTER_NOTES_WORKSHEET,
  APPOINTMENT_SETTER_REALITY_CHECK,
} from "../lib/appointment-setter-guide";
import {
  ONLINE_RESEARCH_ASSISTANT_NOTES_WORKSHEET,
  ONLINE_RESEARCH_ASSISTANT_REALITY_CHECK,
  onlineResearchAssistantToolsDisclaimer,
} from "../lib/online-research-assistant-guide";
import {
  LOCAL_CONTENT_PHOTO_NOTES_WORKSHEET,
  LOCAL_CONTENT_PHOTO_REALITY_CHECK,
} from "../lib/local-content-photographer-guide";
import {
  PERSONAL_SHOPPER_NOTES_WORKSHEET,
  PERSONAL_SHOPPER_REALITY_CHECK,
} from "../lib/personal-shopper-guide";
import {
  BABYSITTING_NOTES_WORKSHEET,
  BABYSITTING_REALITY_CHECK,
} from "../lib/babysitting-guide";
import {
  ERRAND_RUNNER_NOTES_WORKSHEET,
  ERRAND_RUNNER_REALITY_CHECK,
} from "../lib/errand-runner-guide";
import {
  AI_AGENTS_NOTES_WORKSHEET,
  AI_AGENTS_REALITY_CHECK,
} from "../lib/ai-agents-guide";
import {
  AI_PROMO_VIDEO_NOTES_WORKSHEET,
  AI_PROMO_VIDEO_REALITY_CHECK,
} from "../lib/ai-promo-video-guide";
import {
  AI_TIMING_NOTES_WORKSHEET,
  AI_TIMING_REALITY_CHECK,
} from "../lib/ai-timing-guide";
import {
  TECH_HELPER_NOTES_WORKSHEET,
  TECH_HELPER_REALITY_CHECK,
} from "../lib/tech-helper-guide";
import {
  YARD_HELP_NOTES_WORKSHEET,
  YARD_HELP_REALITY_CHECK,
} from "../lib/yard-help-guide";
import {
  HOMEWORK_ORGANIZER_NOTES_WORKSHEET,
  HOMEWORK_ORGANIZER_REALITY_CHECK,
} from "../lib/homework-organizer-guide";
import {
  GROUP_SETUP_HELPER_NOTES_WORKSHEET,
  GROUP_SETUP_HELPER_REALITY_CHECK,
} from "../lib/group-setup-helper-guide";
import {
  HOUSE_SITTER_NOTES_WORKSHEET,
  HOUSE_SITTER_REALITY_CHECK,
} from "../lib/house-sitter-guide";
import {
  BOOKKEEPING_NOTES_WORKSHEET,
  BOOKKEEPING_REALITY_CHECK,
} from "../lib/bookkeeping-guide";
import {
  CLOSET_CLEANOUT_LISTING_NOTES_WORKSHEET,
  CLOSET_CLEANOUT_LISTING_REALITY_CHECK,
} from "../lib/closet-cleanout-listing-guide";
import {
  NONPROFIT_SOCIAL_HELPER_NOTES_WORKSHEET,
  NONPROFIT_SOCIAL_HELPER_REALITY_CHECK,
} from "../lib/nonprofit-social-helper-guide";
import {
  DIGITAL_PRODUCTS_NOTES_WORKSHEET,
  DIGITAL_PRODUCTS_REALITY_CHECK,
} from "../lib/digital-products-guide";
import {
  BOOK_PUBLISHING_NOTES_WORKSHEET,
  BOOK_PUBLISHING_REALITY_CHECK,
} from "../lib/book-publishing-guide";
import {
  START_GARDENING_CLUB_NOTES_WORKSHEET,
  START_GARDENING_CLUB_REALITY_CHECK,
} from "../lib/start-gardening-club-guide";
import {
  START_BOOK_CLUB_NOTES_WORKSHEET,
  START_BOOK_CLUB_REALITY_CHECK,
} from "../lib/start-book-club-guide";
import {
  FORECLOSURE_PROPERTIES_NOTES_WORKSHEET,
  FORECLOSURE_PROPERTIES_REALITY_CHECK,
} from "../lib/foreclosure-properties-guide";
import {
  CLEANING_SERVICE_NOTES_WORKSHEET,
  CLEANING_SERVICE_REALITY_CHECK,
} from "../lib/cleaning-service-guide";
import {
  KIDS_GAMES_AI_NOTES_WORKSHEET,
  KIDS_GAMES_AI_REALITY_CHECK,
} from "../lib/kids-games-ai-guide";
import {
  AI_PROMPT_HELPER_NOTES_WORKSHEET,
  AI_PROMPT_HELPER_REALITY_CHECK,
} from "../lib/ai-prompt-helper-guide";
import {
  JUNIOR_GAMES_AI_NOTES_WORKSHEET,
  JUNIOR_GAMES_AI_REALITY_CHECK,
} from "../lib/junior-games-ai-guide";
import {
  RIDESHARE_NOTES_WORKSHEET,
  RIDESHARE_REALITY_CHECK,
} from "../lib/rideshare-guide";
import {
  LOCAL_EVENT_CONTENT_NOTES_WORKSHEET,
  LOCAL_EVENT_CONTENT_REALITY_CHECK,
} from "../lib/local-event-content-creator-guide";
import {
  PROPERTY_MGMT_NOTES_WORKSHEET,
  PROPERTY_MGMT_REALITY_CHECK,
} from "../lib/property-mgmt-guide";
import {
  AIRBNB_TURNOVER_CHECKER_NOTES_WORKSHEET,
  AIRBNB_TURNOVER_CHECKER_REALITY_CHECK,
} from "../lib/airbnb-turnover-checker-guide";
import {
  STR_COHOST_NOTES_WORKSHEET,
  STR_COHOST_REALITY_CHECK,
} from "../lib/str-cohost-guide";
import {
  JUNIOR_REINVEST_CEO_NOTES_WORKSHEET,
  JUNIOR_REINVEST_CEO_REALITY_CHECK,
} from "../lib/junior-reinvest-ceo-guide";
import {
  KIDS_REINVEST_JAR_NOTES_WORKSHEET,
  KIDS_REINVEST_JAR_REALITY_CHECK,
} from "../lib/kids-reinvest-jar-guide";

export type PrepTabId =
  | "all"
  | "prereqs"
  | "pricing"
  | "supplies"
  | "tools"
  | "steps"
  | "calculator"
  | "notes";

/**
 * Tabs whose dedicated-tab body is rendered only by staff afterTabs editors.
 * Show All still lists every section (including these) so staff can preview the
 * full guide layout; the Notes tab alone stays editor-owned to avoid a blank panel.
 *
 * Prerequisites, Tools, Steps, Suggested Pricing, and Supply List always use the
 * normal member-facing panels; staff still get inline editors via afterTabs.
 */
const COMPLETED_GUIDE_NOTES: Record<
  string,
  {
    reality: { title: string; body: string };
    worksheet: string;
    summary: string;
    testId: string;
    toolsDisclaimer: () => string;
  }
> = {
  "friendship-bracelet-maker": {
    reality: FRIENDSHIP_BRACELET_REALITY_CHECK,
    worksheet: FRIENDSHIP_BRACELET_NOTES_WORKSHEET,
    summary: "My Friendship Bracelet Plan",
    testId: "friendship-bracelet-worksheet",
    toolsDisclaimer: friendshipBraceletToolsDisclaimer,
  },
  "leaf-raking": {
    reality: LEAF_RAKING_REALITY_CHECK,
    worksheet: LEAF_RAKING_NOTES_WORKSHEET,
    summary: "My Leaf Blowing Plan",
    testId: "leaf-raking-worksheet",
    toolsDisclaimer: leafRakingToolsDisclaimer,
  },
  "lemonade-stand": {
    reality: LEMONADE_STAND_REALITY_CHECK,
    worksheet: LEMONADE_STAND_NOTES_WORKSHEET,
    summary: "My Lemonade / Drink Stand Plan",
    testId: "lemonade-stand-worksheet",
    toolsDisclaimer: lemonadeStandToolsDisclaimer,
  },
  airbnb: {
    reality: AIRBNB_HOSTING_REALITY_CHECK,
    worksheet: AIRBNB_HOSTING_NOTES_WORKSHEET,
    summary: "My Airbnb Hosting Plan",
    testId: "airbnb-worksheet",
    toolsDisclaimer: airbnbHostingToolsDisclaimer,
  },
  "digital-cookbook-creator": {
    reality: DIGITAL_COOKBOOK_REALITY_CHECK,
    worksheet: DIGITAL_COOKBOOK_NOTES_WORKSHEET,
    summary: "My Digital Cookbook Plan",
    testId: "digital-cookbook-worksheet",
    toolsDisclaimer: digitalCookbookToolsDisclaimer,
  },
  "family-photo-slideshow": {
    reality: FAMILY_PHOTO_SLIDESHOW_REALITY_CHECK,
    worksheet: FAMILY_PHOTO_SLIDESHOW_NOTES_WORKSHEET,
    summary: "My Family Photo Slideshow Plan",
    testId: "family-photo-slideshow-worksheet",
    toolsDisclaimer: familyPhotoSlideshowToolsDisclaimer,
  },
  "local-resource-list-creator": {
    reality: LOCAL_RESOURCE_LIST_REALITY_CHECK,
    worksheet: LOCAL_RESOURCE_LIST_NOTES_WORKSHEET,
    summary: "My Local Resource List Plan",
    testId: "local-resource-list-worksheet",
    toolsDisclaimer: localResourceListToolsDisclaimer,
  },
  "recycling-helper": {
    reality: RECYCLING_HELPER_REALITY_CHECK,
    worksheet: RECYCLING_HELPER_NOTES_WORKSHEET,
    summary: "My Recycling Helper Plan",
    testId: "recycling-helper-worksheet",
    toolsDisclaimer: recyclingHelperToolsDisclaimer,
  },
  proofreader: {
    reality: PROOFREADER_REALITY_CHECK,
    worksheet: PROOFREADER_NOTES_WORKSHEET,
    summary: "My Proofreader Plan",
    testId: "proofreader-worksheet",
    toolsDisclaimer: proofreaderToolsDisclaimer,
  },
  "toy-organizer": {
    reality: TOY_ORGANIZER_REALITY_CHECK,
    worksheet: TOY_ORGANIZER_NOTES_WORKSHEET,
    summary: "My Toy Organizer Plan",
    testId: "toy-organizer-worksheet",
    toolsDisclaimer: toyOrganizerToolsDisclaimer,
  },
  "trash-can-service": {
    reality: TRASH_CAN_SERVICE_REALITY_CHECK,
    worksheet: TRASH_CAN_SERVICE_NOTES_WORKSHEET,
    summary: "My Trash Can Service Plan",
    testId: "trash-can-service-worksheet",
    toolsDisclaimer: trashCanServiceToolsDisclaimer,
  },
  homework: {
    reality: HOMEWORK_HELPER_REALITY_CHECK,
    worksheet: HOMEWORK_HELPER_NOTES_WORKSHEET,
    summary: "My Tutor / Homework Helper Plan",
    testId: "homework-helper-worksheet",
    toolsDisclaimer: homeworkHelperToolsDisclaimer,
  },
  "canva-flyer-creator": {
    reality: CANVA_FLYER_REALITY_CHECK,
    worksheet: CANVA_FLYER_NOTES_WORKSHEET,
    summary: "My Canva Flyer Creator Plan",
    testId: "canva-flyer-worksheet",
    toolsDisclaimer: canvaFlyerToolsDisclaimer,
  },
  "car-interior-cleanup": {
    reality: CAR_INTERIOR_REALITY_CHECK,
    worksheet: CAR_INTERIOR_NOTES_WORKSHEET,
    summary: "My Car Interior Cleanup Plan",
    testId: "car-interior-worksheet",
    toolsDisclaimer: carInteriorToolsDisclaimer,
  },
  "dog-walk": {
    reality: NEIGHBORHOOD_DOG_WALKER_REALITY_CHECK,
    worksheet: NEIGHBORHOOD_DOG_WALKER_NOTES_WORKSHEET,
    summary: "My Neighborhood Dog Walker Plan",
    testId: "dog-walk-worksheet",
    toolsDisclaimer: neighborhoodDogWalkerToolsDisclaimer,
  },
  "greeting-card-creator": {
    reality: GREETING_CARD_REALITY_CHECK,
    worksheet: GREETING_CARD_NOTES_WORKSHEET,
    summary: "My Greeting Card Creator Plan",
    testId: "greeting-card-worksheet",
    toolsDisclaimer: greetingCardToolsDisclaimer,
  },
  "holiday-decorating-helper": {
    reality: HOLIDAY_DECORATING_REALITY_CHECK,
    worksheet: HOLIDAY_DECORATING_NOTES_WORKSHEET,
    summary: "My Holiday Decorating Plan",
    testId: "holiday-decorating-worksheet",
    toolsDisclaimer: holidayDecoratingToolsDisclaimer,
  },
  "handyman-light": {
    reality: LIGHT_HANDYMAN_REALITY_CHECK,
    worksheet: LIGHT_HANDYMAN_NOTES_WORKSHEET,
    summary: "My Light Handyman & Home Help Plan",
    testId: "handyman-light-worksheet",
    toolsDisclaimer: lightHandymanToolsDisclaimer,
  },
  tutoring: {
    reality: TUTORING_SKILLS_REALITY_CHECK,
    worksheet: TUTORING_SKILLS_NOTES_WORKSHEET,
    summary: "My Tutoring & Skills Coaching Plan",
    testId: "tutoring-worksheet",
    toolsDisclaimer: tutoringSkillsToolsDisclaimer,
  },
  "vacation-mail-plant-helper": {
    reality: VACATION_PLANT_REALITY_CHECK,
    worksheet: VACATION_PLANT_NOTES_WORKSHEET,
    summary: "My Vacation Plant Helper Plan",
    testId: "vacation-plant-worksheet",
    toolsDisclaimer: vacationPlantToolsDisclaimer,
  },
  "plant-watering": {
    reality: PLANT_WATERING_REALITY_CHECK,
    worksheet: PLANT_WATERING_NOTES_WORKSHEET,
    summary: "My Plant Watering Service Plan",
    testId: "plant-watering-worksheet",
    toolsDisclaimer: plantWateringToolsDisclaimer,
  },
  "porch-package-helper": {
    reality: PORCH_PACKAGE_REALITY_CHECK,
    worksheet: PORCH_PACKAGE_NOTES_WORKSHEET,
    summary: "My Porch Package Helper Plan",
    testId: "porch-package-worksheet",
    toolsDisclaimer: porchPackageHelperToolsDisclaimer,
  },
  "book-publishing-kids": {
    reality: BOOK_PUBLISHING_KIDS_REALITY_CHECK,
    worksheet: BOOK_PUBLISHING_KIDS_NOTES_WORKSHEET,
    summary: "Book Plan",
    testId: "book-publishing-kids-worksheet",
    toolsDisclaimer: bookPublishingKidsToolsDisclaimer,
  },
  "ai-peers": {
    reality: AI_PEERS_REALITY_CHECK,
    worksheet: AI_PEERS_NOTES_WORKSHEET,
    summary: "AI-for-Peers Coffee Chat Notes",
    testId: "ai-peers-worksheet",
    toolsDisclaimer: aiPeersToolsDisclaimer,
  },
  "travel-research-assistant": {
    reality: TRAVEL_RESEARCH_REALITY_CHECK,
    worksheet: TRAVEL_RESEARCH_NOTES_WORKSHEET,
    summary: "My Travel Research Assistant Plan",
    testId: "travel-research-worksheet",
    toolsDisclaimer: travelResearchAssistantToolsDisclaimer,
  },
  "transcription-notes-helper": {
    reality: TRANSCRIPTION_NOTES_REALITY_CHECK,
    worksheet: TRANSCRIPTION_NOTES_NOTES_WORKSHEET,
    summary: "My Transcription & Notes Helper Plan",
    testId: "transcription-notes-worksheet",
    toolsDisclaimer: transcriptionNotesHelperToolsDisclaimer,
  },
  "website-tester": {
    reality: WEBSITE_TESTER_REALITY_CHECK,
    worksheet: WEBSITE_TESTER_NOTES_WORKSHEET,
    summary: "My Website Tester Plan",
    testId: "website-tester-worksheet",
    toolsDisclaimer: websiteTesterToolsDisclaimer,
  },
  "community-newsletter-creator": {
    reality: COMMUNITY_NEWSLETTER_REALITY_CHECK,
    worksheet: COMMUNITY_NEWSLETTER_NOTES_WORKSHEET,
    summary: "My Community Newsletter Plan",
    testId: "community-newsletter-worksheet",
    toolsDisclaimer: communityNewsletterCreatorToolsDisclaimer,
  },
  teaching: {
    reality: COMMUNITY_TEACHING_REALITY_CHECK,
    worksheet: COMMUNITY_TEACHING_NOTES_WORKSHEET,
    summary: "My Community Teaching Plan",
    testId: "community-teaching-worksheet",
    toolsDisclaimer: communityTeachingWorkshopsToolsDisclaimer,
  },
  "review-response-assistant": {
    reality: REVIEW_RESPONSE_REALITY_CHECK,
    worksheet: REVIEW_RESPONSE_NOTES_WORKSHEET,
    summary: "My Customer Review Response Plan",
    testId: "review-response-worksheet",
    toolsDisclaimer: reviewResponseAssistantToolsDisclaimer,
  },
  consulting: {
    reality: CAREER_CONSULTING_REALITY_CHECK,
    worksheet: CAREER_CONSULTING_NOTES_WORKSHEET,
    summary: "My Career & Industry Consulting Plan",
    testId: "career-consulting-worksheet",
    toolsDisclaimer: careerIndustryConsultingToolsDisclaimer,
  },
  notary: {
    reality: PART_TIME_NOTARY_REALITY_CHECK,
    worksheet: PART_TIME_NOTARY_NOTES_WORKSHEET,
    summary: "My Part-Time Notary Plan",
    testId: "part-time-notary-worksheet",
    toolsDisclaimer: partTimeNotaryToolsDisclaimer,
  },
  "resume-linkedin-helper": {
    reality: RESUME_LINKEDIN_REALITY_CHECK,
    worksheet: RESUME_LINKEDIN_NOTES_WORKSHEET,
    summary: "My Resume & LinkedIn Helper Plan",
    testId: "resume-linkedin-worksheet",
    toolsDisclaimer: resumeLinkedInHelperToolsDisclaimer,
  },
  "short-form-video-editor": {
    reality: SHORT_FORM_VIDEO_REALITY_CHECK,
    worksheet: SHORT_FORM_VIDEO_NOTES_WORKSHEET,
    summary: "My Short-Form Video Editor Plan",
    testId: "short-form-video-worksheet",
    toolsDisclaimer: shortFormVideoEditorToolsDisclaimer,
  },
  "google-business-helper": {
    reality: GBP_HELPER_REALITY_CHECK,
    worksheet: GBP_HELPER_NOTES_WORKSHEET,
    summary: "My Google Business Profile Helper Plan",
    testId: "google-business-worksheet",
    toolsDisclaimer: googleBusinessProfileHelperToolsDisclaimer,
  },
  "ugc-creator": {
    reality: UGC_CREATOR_REALITY_CHECK,
    worksheet: UGC_CREATOR_NOTES_WORKSHEET,
    summary: "My UGC Creator Plan",
    testId: "ugc-creator-worksheet",
    toolsDisclaimer: ugcCreatorToolsDisclaimer,
  },
  "digital-photo-organizer": {
    reality: DIGITAL_PHOTO_ORGANIZER_REALITY_CHECK,
    worksheet: DIGITAL_PHOTO_ORGANIZER_NOTES_WORKSHEET,
    summary: "My Digital Photo Organizer Plan",
    testId: "digital-photo-organizer-worksheet",
    toolsDisclaimer: digitalPhotoOrganizerToolsDisclaimer,
  },
  "digital-product-formatter": {
    reality: DIGITAL_PRODUCT_FORMATTER_REALITY_CHECK,
    worksheet: DIGITAL_PRODUCT_FORMATTER_NOTES_WORKSHEET,
    summary: "My Digital Product Formatter Plan",
    testId: "digital-product-formatter-worksheet",
    toolsDisclaimer: digitalProductFormatterToolsDisclaimer,
  },
  "flipping-properties": {
    reality: FLIPPING_PROPERTIES_REALITY_CHECK,
    worksheet: FLIPPING_PROPERTIES_NOTES_WORKSHEET,
    summary: "My Flipping Properties Plan",
    testId: "flipping-properties-worksheet",
    toolsDisclaimer: flippingPropertiesToolsDisclaimer,
  },
  "garage-sale-helper": {
    reality: GARAGE_SALE_HELPER_REALITY_CHECK,
    worksheet: GARAGE_SALE_HELPER_NOTES_WORKSHEET,
    summary: "My Garage Sale Helper Plan",
    testId: "garage-sale-helper-worksheet",
    toolsDisclaimer: garageSaleHelperToolsDisclaimer,
  },
  "local-business-ai-setup": {
    reality: LOCAL_BUSINESS_AI_SETUP_REALITY_CHECK,
    worksheet: LOCAL_BUSINESS_AI_SETUP_NOTES_WORKSHEET,
    summary: "My Local Business AI Setup Plan",
    testId: "local-business-ai-setup-worksheet",
    toolsDisclaimer: localBusinessAiSetupToolsDisclaimer,
  },
  "neighborhood-helper": {
    reality: NEIGHBORHOOD_HELPER_REALITY_CHECK,
    worksheet: NEIGHBORHOOD_HELPER_NOTES_WORKSHEET,
    summary: "My Neighborhood Helper Plan",
    testId: "neighborhood-helper-worksheet",
    toolsDisclaimer: neighborhoodHelperToolsDisclaimer,
  },
  "ai-assets": {
    reality: AI_ASSETS_REALITY_CHECK,
    worksheet: AI_ASSETS_NOTES_WORKSHEET,
    summary: "My AI Asset Studio Plan",
    testId: "ai-assets-worksheet",
    toolsDisclaimer: aiAssetsToolsDisclaimer,
  },
  "airbnb-cohost": {
    reality: AIRBNB_COHOST_REALITY_CHECK,
    worksheet: AIRBNB_COHOST_NOTES_WORKSHEET,
    summary: "My Airbnb Co-Host Plan",
    testId: "airbnb-cohost-worksheet",
    toolsDisclaimer: airbnbCohostToolsDisclaimer,
  },
  amazon: {
    reality: AMAZON_FBA_SELLER_REALITY_CHECK,
    worksheet: AMAZON_FBA_SELLER_NOTES_WORKSHEET,
    summary: "My Amazon FBA Seller Plan",
    testId: "amazon-worksheet",
    toolsDisclaimer: amazonFbaSellerToolsDisclaimer,
  },
  "virtual-call-assistant": {
    reality: VIRTUAL_CALL_ASSISTANT_REALITY_CHECK,
    worksheet: VIRTUAL_CALL_ASSISTANT_NOTES_WORKSHEET,
    summary: "My Virtual Call Assistant Plan",
    testId: "virtual-call-assistant-worksheet",
    toolsDisclaimer: virtualCallAssistantToolsDisclaimer,
  },
  "ai-social-helper": {
    reality: AI_SOCIAL_HELPER_REALITY_CHECK,
    worksheet: AI_SOCIAL_HELPER_NOTES_WORKSHEET,
    summary: "My AI Social Media Helper Plan",
    testId: "ai-social-helper-worksheet",
    toolsDisclaimer: aiSocialHelperToolsDisclaimer,
  },
  "birthday-party-helper": {
    reality: BIRTHDAY_PARTY_HELPER_REALITY_CHECK,
    worksheet: BIRTHDAY_PARTY_HELPER_NOTES_WORKSHEET,
    summary: "My Birthday Party Helper Plan",
    testId: "birthday-party-helper-worksheet",
    toolsDisclaimer: birthdayPartyHelperToolsDisclaimer,
  },
  "closet-organizer": {
    reality: CLOSET_ORGANIZER_REALITY_CHECK,
    worksheet: CLOSET_ORGANIZER_NOTES_WORKSHEET,
    summary: "My Closet Organizer Plan",
    testId: "closet-organizer-worksheet",
    toolsDisclaimer: closetOrganizerToolsDisclaimer,
  },
  "lien-tax-sales": {
    reality: LIEN_TAX_SALES_REALITY_CHECK,
    worksheet: LIEN_TAX_SALES_NOTES_WORKSHEET,
    summary: "My Court Lien & Tax Sale Plan",
    testId: "lien-tax-sales-worksheet",
    toolsDisclaimer: lienTaxSalesToolsDisclaimer,
  },
  "junior-content-create": {
    reality: JUNIOR_CONTENT_CREATE_REALITY_CHECK,
    worksheet: JUNIOR_CONTENT_CREATE_NOTES_WORKSHEET,
    summary: "My Content Creation Plan",
    testId: "junior-content-create-worksheet",
    toolsDisclaimer: juniorContentCreateToolsDisclaimer,
  },
  "kids-craft-hustle": {
    reality: KIDS_CRAFT_HUSTLE_REALITY_CHECK,
    worksheet: KIDS_CRAFT_HUSTLE_NOTES_WORKSHEET,
    summary: "My Craft Hustle Plan",
    testId: "kids-craft-hustle-worksheet",
    toolsDisclaimer: kidsCraftHustleToolsDisclaimer,
  },
  crafts: {
    reality: CRAFTS_REALITY_CHECK,
    worksheet: CRAFTS_NOTES_WORKSHEET,
    summary: "My Handmade Craft Plan",
    testId: "crafts-worksheet",
    toolsDisclaimer: craftsToolsDisclaimer,
  },
  "create-games-kids": {
    reality: CREATE_GAMES_KIDS_REALITY_CHECK,
    worksheet: CREATE_GAMES_KIDS_NOTES_WORKSHEET,
    summary: "My Kids Game Plan",
    testId: "create-games-kids-worksheet",
    toolsDisclaimer: createGamesKidsToolsDisclaimer,
  },
  "create-games-junior": {
    reality: CREATE_GAMES_JUNIOR_REALITY_CHECK,
    worksheet: CREATE_GAMES_JUNIOR_NOTES_WORKSHEET,
    summary: "My Teen Game Plan",
    testId: "create-games-junior-worksheet",
    toolsDisclaimer: createGamesJuniorToolsDisclaimer,
  },
  "custom-bookmark-creator": {
    reality: CUSTOM_BOOKMARK_CREATOR_REALITY_CHECK,
    worksheet: CUSTOM_BOOKMARK_CREATOR_NOTES_WORKSHEET,
    summary: "My Custom Bookmark Plan",
    testId: "custom-bookmark-creator-worksheet",
    toolsDisclaimer: customBookmarkCreatorToolsDisclaimer,
  },
  "web-leads": {
    reality: WEB_LEADS_REALITY_CHECK,
    worksheet: WEB_LEADS_NOTES_WORKSHEET,
    summary: "My Local Website Lead Finder Plan",
    testId: "web-leads-worksheet",
    toolsDisclaimer: webLeadsToolsDisclaimer,
  },
  "mailbox-cleaning": {
    reality: MAILBOX_CLEANING_REALITY_CHECK,
    worksheet: MAILBOX_CLEANING_NOTES_WORKSHEET,
    summary: "My Mailbox Cleaning Plan",
    testId: "mailbox-cleaning-worksheet",
    toolsDisclaimer: mailboxCleaningToolsDisclaimer,
  },
  "virtual-assistant": {
    reality: VIRTUAL_ASSISTANT_REALITY_CHECK,
    worksheet: VIRTUAL_ASSISTANT_NOTES_WORKSHEET,
    summary: "My Virtual Assistant Plan",
    testId: "virtual-assistant-worksheet",
    toolsDisclaimer: virtualAssistantToolsDisclaimer,
  },
  "virtual-receptionist": {
    reality: VIRTUAL_RECEPTIONIST_REALITY_CHECK,
    worksheet: VIRTUAL_RECEPTIONIST_NOTES_WORKSHEET,
    summary: "My Virtual Receptionist Plan",
    testId: "virtual-receptionist-worksheet",
    toolsDisclaimer: virtualReceptionistToolsDisclaimer,
  },
  social: {
    reality: SOCIAL_INFLUENCER_REALITY_CHECK,
    worksheet: SOCIAL_INFLUENCER_NOTES_WORKSHEET,
    summary: "My Social Influencer Plan",
    testId: "social-influencer-worksheet",
    toolsDisclaimer: socialInfluencerToolsDisclaimer,
  },
  "junior-savings-ceo": {
    reality: JUNIOR_SAVINGS_CEO_REALITY_CHECK,
    worksheet: JUNIOR_SAVINGS_CEO_NOTES_WORKSHEET,
    summary: "My Savings Goal Plan",
    testId: "junior-savings-ceo-worksheet",
    toolsDisclaimer: juniorSavingsCeoToolsDisclaimer,
  },
  "online-community-moderator": {
    reality: COMMUNITY_MODERATOR_REALITY_CHECK,
    worksheet: COMMUNITY_MODERATOR_NOTES_WORKSHEET,
    summary: "My Online Community Moderator Plan",
    testId: "online-community-moderator-worksheet",
    toolsDisclaimer: onlineCommunityModeratorToolsDisclaimer,
  },
  "etsy-store": {
    reality: ETSY_STORE_REALITY_CHECK,
    worksheet: ETSY_STORE_NOTES_WORKSHEET,
    summary: "My Etsy Shop Plan",
    testId: "etsy-store-worksheet",
    toolsDisclaimer: etsyStoreToolsDisclaimer,
  },
};

export function guidePrepAfterTabsOwnsPanel(canEditGuideContent: boolean): PrepTabId[] | undefined {
  return canEditGuideContent ? ["notes"] : undefined;
}

type PrepTab = {
  id: PrepTabId;
  label: string;
  panelClass: string;
  testId: string;
  content: ReactNode;
};

export type GuidePrepFocusSignal = {
  tab: PrepTabId;
  nonce: number;
};

/** About, pricing, supplies, tools — and optional Steps / Calculator / Notes — as tabs. */
export function GuidePrepSections({
  kit,
  testIdPrefix = "guide",
  stepsTab,
  calculatorTab,
  notesTab,
  focusSignal,
  afterTabs,
  expandAllSections = false,
  afterTabsOwnsPanel,
  guideId,
  guideUnlocked = true,
  lockCta = null,
}: {
  kit: GuideKit;
  testIdPrefix?: string;
  /** When set, adds a final tab for the launch checklist steps. */
  stepsTab?: {
    count: number;
    content: ReactNode;
  };
  /** Per-guide revenue / profit estimator. */
  calculatorTab?: {
    content: ReactNode;
  };
  /** Per-guide member notes + attachments. */
  notesTab?: {
    content: ReactNode;
  };
  /** Parent can jump to a tab (e.g. Launch Revenue Calculator). */
  focusSignal?: GuidePrepFocusSignal | null;
  /** Rendered between the tab menu and the panels (e.g. admin editor keyed to the active tab). */
  afterTabs?: ReactNode | ((activeTab: PrepTabId) => ReactNode);
  /** Keep Show All sections expanded (still collapsible). */
  expandAllSections?: boolean;
  /** Tabs whose body is already rendered in afterTabs (avoid duplicate panel content). */
  afterTabsOwnsPanel?: PrepTabId[];
  /** Stable id — resets expansion when the open guide changes (not on every kit object recreate). */
  guideId?: string;
  /** False = About stays readable; other tabs show the membership lock. */
  guideUnlocked?: boolean;
  /** Join / Upgrade CTA shown on locked tabs. */
  lockCta?: ReactNode;
}) {
  const supplies = kit.supplies;
  const pricing = kit.suggestedPricing;
  const pricingDisplay = organizeSuggestedPricingCopy(pricing);
  const [checkedSupplies, setCheckedSupplies] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<PrepTabId>(GUIDE_PREP_DEFAULT_TAB);
  /** Show All: missing key = expanded. Explicit `false` collapses a section. */
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const ownedByAfterTabs = new Set(afterTabsOwnsPanel ?? []);

  useEffect(() => {
    if (!focusSignal?.tab) return;
    setActiveTab(focusSignal.tab);
  }, [focusSignal?.nonce, focusSignal?.tab]);

  useEffect(() => {
    // Reset only when switching guides — not when parent recreates the kit object each render.
    setOpenSections({});
    setActiveTab(GUIDE_PREP_DEFAULT_TAB);
  }, [guideId]);

  const tabs = useMemo((): PrepTab[] => {
    const completedNotes = guideId ? COMPLETED_GUIDE_NOTES[guideId] : undefined;
    const realityCheck =
      guideId === "food-delivery" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {FOOD_DELIVERY_REALITY_CHECK.title}
          </strong>
          <p>{FOOD_DELIVERY_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "estate-sale-listing-helper" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {ESTATE_SALE_REALITY_CHECK.title}
          </strong>
          <p>{ESTATE_SALE_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "family-history-organizer" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {GENEALOGY_REALITY_CHECK.title}
          </strong>
          <p>{GENEALOGY_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "kids-party-game-host" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {KIDS_PARTY_GAME_HOST_REALITY_CHECK.title}
          </strong>
          <p>{KIDS_PARTY_GAME_HOST_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "lead-followup-assistant" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {LEAD_FOLLOWUP_REALITY_CHECK.title}
          </strong>
          <p>{LEAD_FOLLOWUP_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "appointment-setter" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {APPOINTMENT_SETTER_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{APPOINTMENT_SETTER_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "online-research-assistant" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {ONLINE_RESEARCH_ASSISTANT_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{ONLINE_RESEARCH_ASSISTANT_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "mothers-helper" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {MOTHERS_HELPER_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{MOTHERS_HELPER_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "babysitting" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {BABYSITTING_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{BABYSITTING_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "errand-runner" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {ERRAND_RUNNER_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{ERRAND_RUNNER_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "ai-agents" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {AI_AGENTS_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{AI_AGENTS_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "ai-promo-video" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {AI_PROMO_VIDEO_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{AI_PROMO_VIDEO_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "ai-timing" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {AI_TIMING_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{AI_TIMING_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "tech-helper" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {TECH_HELPER_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{TECH_HELPER_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "yard-help" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {YARD_HELP_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{YARD_HELP_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "homework-organizer" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {HOMEWORK_ORGANIZER_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{HOMEWORK_ORGANIZER_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "group-setup-helper" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {GROUP_SETUP_HELPER_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{GROUP_SETUP_HELPER_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "house-sitter" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {HOUSE_SITTER_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{HOUSE_SITTER_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "bookkeeping" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {BOOKKEEPING_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{BOOKKEEPING_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "closet-cleanout-listing" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {CLOSET_CLEANOUT_LISTING_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{CLOSET_CLEANOUT_LISTING_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "nonprofit-social-helper" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {NONPROFIT_SOCIAL_HELPER_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{NONPROFIT_SOCIAL_HELPER_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "digital-products" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {DIGITAL_PRODUCTS_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{DIGITAL_PRODUCTS_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "book-publishing" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {BOOK_PUBLISHING_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{BOOK_PUBLISHING_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "start-gardening-club" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {START_GARDENING_CLUB_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{START_GARDENING_CLUB_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "start-book-club" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {START_BOOK_CLUB_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{START_BOOK_CLUB_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "foreclosure-properties" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {FORECLOSURE_PROPERTIES_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{FORECLOSURE_PROPERTIES_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "cleaning-service" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {CLEANING_SERVICE_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{CLEANING_SERVICE_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "kids-games-ai" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {KIDS_GAMES_AI_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{KIDS_GAMES_AI_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "ai-prompt-helper" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {AI_PROMPT_HELPER_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{AI_PROMPT_HELPER_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "junior-games-ai" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {JUNIOR_GAMES_AI_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{JUNIOR_GAMES_AI_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "rideshare" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {RIDESHARE_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{RIDESHARE_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "local-event-content-creator" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {LOCAL_EVENT_CONTENT_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{LOCAL_EVENT_CONTENT_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "property-mgmt" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {PROPERTY_MGMT_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{PROPERTY_MGMT_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "airbnb-turnover-checker" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {AIRBNB_TURNOVER_CHECKER_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{AIRBNB_TURNOVER_CHECKER_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "str-cohost" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {STR_COHOST_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{STR_COHOST_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "junior-reinvest-ceo" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {JUNIOR_REINVEST_CEO_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{JUNIOR_REINVEST_CEO_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "kids-reinvest-jar" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {KIDS_REINVEST_JAR_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{KIDS_REINVEST_JAR_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "local-content-photographer" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {LOCAL_CONTENT_PHOTO_REALITY_CHECK.title}
          </strong>
          <p>{LOCAL_CONTENT_PHOTO_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "personal-shopper" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {PERSONAL_SHOPPER_REALITY_CHECK.title}
          </strong>
          <p>{PERSONAL_SHOPPER_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "youth-sports-helper" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {YOUTH_SPORTS_HELPER_REALITY_CHECK.title}
          </strong>
          <p>{YOUTH_SPORTS_HELPER_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "junior-give-back-teach" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {JUNIOR_GIVE_BACK_TEACH_REALITY_CHECK.title}
          </strong>
          <p>{JUNIOR_GIVE_BACK_TEACH_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "kids-kindness-share" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {KIDS_KINDNESS_SHARE_REALITY_CHECK.title}
          </strong>
          <p>{KIDS_KINDNESS_SHARE_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "beach-shell-jewelry" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {BEACH_SHELL_JEWELRY_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{BEACH_SHELL_JEWELRY_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "gift-wrapping" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {GIFT_WRAPPING_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{GIFT_WRAPPING_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "affiliate" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {AFFILIATE_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{AFFILIATE_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "dropshipping" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {DROPSHIPPING_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{DROPSHIPPING_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "fb-marketplace-helper" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {FB_MARKETPLACE_HELPER_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{FB_MARKETPLACE_HELPER_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "basic-invitation-creator" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {BASIC_INVITATION_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{BASIC_INVITATION_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "pod" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {POD_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{POD_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "pet-sitting" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {PET_SITTING_REALITY_CHECK.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{PET_SITTING_REALITY_CHECK.body}</p>
        </aside>
      ) : guideId === "etsy-store" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {ETSY_STORE_REALITY_CHECK.title}
          </strong>
          <p>
            <strong>{ETSY_STORE_REALITY_CHECK.lead}</strong>
          </p>
          <p>{ETSY_STORE_REALITY_CHECK.intro}</p>
          <p className="gysh-section-panel__reality-check-subhead">{ETSY_STORE_REALITY_CHECK.sellHeading}</p>
          {ETSY_STORE_REALITY_CHECK.categories.map((category) => (
            <p key={category.heading}>
              <strong>{category.heading}</strong>
              <br />
              {category.body}
            </p>
          ))}
          <p>{ETSY_STORE_REALITY_CHECK.closing}</p>
          <p>
            {ETSY_STORE_REALITY_CHECK.creativityLabel}{" "}
            <a
              href={ETSY_STORE_REALITY_CHECK.creativityUrl}
              target="_blank"
              rel="noreferrer"
            >
              {ETSY_STORE_REALITY_CHECK.creativityUrl}
            </a>
          </p>
          <p className="gysh-section-panel__reality-check-subhead">{ETSY_STORE_REALITY_CHECK.minorsHeading}</p>
          <p>{ETSY_STORE_REALITY_CHECK.minorsBody}</p>
          <p>
            {ETSY_STORE_REALITY_CHECK.minorsLabel}{" "}
            <a href={ETSY_STORE_REALITY_CHECK.minorsUrl} target="_blank" rel="noreferrer">
              {ETSY_STORE_REALITY_CHECK.minorsUrl}
            </a>
          </p>
        </aside>
      ) : completedNotes ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {completedNotes.reality.title}
          </strong>
          <p style={{ whiteSpace: "pre-line" }}>{completedNotes.reality.body}</p>
        </aside>
      ) : guideId === "kids-piggy-first-goal" ? (
        <aside
          className="gysh-section-panel__reality-check"
          data-testid={`${testIdPrefix}-reality-check`}
        >
          <strong className="gysh-section-panel__reality-check-title">
            {KIDS_PIGGY_FIRST_GOAL_REALITY_CHECK.title}
          </strong>
          <p>{KIDS_PIGGY_FIRST_GOAL_REALITY_CHECK.body}</p>
        </aside>
      ) : null;

    const list: PrepTab[] = [
      {
        id: "prereqs",
        label: GUIDE_PREP_ABOUT_TAB_LABEL,
        panelClass: "gysh-section-panel--prereqs",
        testId: `${testIdPrefix}-prerequisites`,
        content: (
          <>
            <p className="gysh-section-panel__lede">{prerequisitesDisclaimer()}</p>
            <ul className="gysh-section-panel__list">
              {kit.prerequisites.map((p) => (
                <li key={p.id}>
                  <strong>{displayPrerequisiteLabel(p.label)}:</strong>{" "}
                  {expandStandaloneHustleCopy(p.detail)}
                </li>
              ))}
            </ul>
            {realityCheck}
          </>
        ),
      },
    ];

    list.push({
      id: "pricing",
      label: pricing?.tabLabel?.trim() || "Suggested Pricing",
      panelClass: "gysh-section-panel--pricing",
      testId: `${testIdPrefix}-pricing`,
      content: (
        <>
          <p className="gysh-section-panel__lede">{pricingDisclaimer()}</p>
          {pricingDisplay.introBlocks.length ? (
            <div
              className="gysh-section-panel__intro"
              data-testid={`${testIdPrefix}-pricing-intro`}
            >
              {pricingDisplay.introBlocks.map((block, i) =>
                block.kind === "heading" ? (
                  <p key={`heading-${i}`} className="gysh-section-panel__subhead">
                    {block.text}
                  </p>
                ) : (
                  <ul key={`intro-${i}`} className="gysh-section-panel__list">
                    {block.lines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ),
              )}
            </div>
          ) : null}
          {pricingDisplay.items.length ? (
            <>
              {pricingDisplay.introBlocks.length ? (
                <p className="gysh-section-panel__subhead">Price examples</p>
              ) : null}
              <ul className="gysh-section-panel__list gysh-pricing-list">
                {pricingDisplay.items.map((item) => {
                  const label = pricingItemLabel(item);
                  const notes = item.notes?.trim();
                  return (
                    <li key={item.id} className="gysh-pricing-line">
                      <span className="gysh-pricing-line__main">
                        <strong>{label}</strong>
                        <span className="gysh-pricing-line__price">{item.price}</span>
                      </span>
                      {notes ? (
                        <span className="gysh-pricing-line__notes">{notes}</span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : pricingDisplay.introBlocks.length ? null : (
            <p className="gysh-section-panel__empty">No suggested prices listed yet.</p>
          )}
          {pricing?.raiseTip ? (
            <p className="gysh-section-panel__foot">
              <strong>Raise tip:</strong> {pricing.raiseTip}
            </p>
          ) : null}
        </>
      ),
    });

    list.push({
      id: "supplies",
      label: "Supply List",
      panelClass: "gysh-section-panel--supplies",
      testId: `${testIdPrefix}-supplies`,
      content: (
        <>
          <p className="gysh-section-panel__lede">{suppliesDisclaimer()}</p>
          <p className="gysh-section-panel__highlight">
            <strong>Estimated cost to gather supplies before your first paid job:</strong>{" "}
            {supplies?.starterKitTotal?.trim() || "Not listed yet."}
          </p>
          {supplies?.items?.length ? (
            <ol className="gysh-supply-checklist" data-testid={`${testIdPrefix}-supply-checklist`}>
              {supplies.items.map((item, index) => {
                const checked = !!checkedSupplies[item.id];
                return (
                  <li key={item.id} className={checked ? "is-checked" : undefined}>
                    <label className="gysh-supply-checklist__row">
                      <span className="gysh-supply-checklist__num" aria-hidden>
                        {index + 1}.
                      </span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setCheckedSupplies((prev) => ({
                            ...prev,
                            [item.id]: !prev[item.id],
                          }))
                        }
                        aria-label={`Got ${item.name}`}
                      />
                      <span className="gysh-supply-checklist__body">
                        <strong>{item.name}</strong>
                        <span className="gysh-supply-checklist__meta">
                          Qty: {item.qty} · Est. {item.estCost}
                          {item.optional ? " · optional" : ""}
                          {item.notes ? ` — ${item.notes}` : ""}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="gysh-section-panel__empty">No supply list items yet.</p>
          )}
          <p className="gysh-section-panel__foot gysh-supply-checklist__print-hint">
            Tip: use Download PDF for a printable numbered checklist with empty checkboxes.
          </p>
        </>
      ),
    });

    list.push({
      id: "tools",
      label: "Tools",
      panelClass: "gysh-section-panel--tools",
      testId: `${testIdPrefix}-tools`,
      content: (
        <>
          {guideId === "estate-sale-listing-helper" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {estateSaleToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "family-history-organizer" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {genealogyToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "kids-party-game-host" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {kidsPartyGameHostToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "lead-followup-assistant" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {leadFollowupToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "appointment-setter" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {appointmentSetterToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "online-research-assistant" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {onlineResearchAssistantToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "mothers-helper" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {mothersHelperToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "babysitting" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {babysittingToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "errand-runner" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {errandRunnerToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "ai-agents" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {aiAgentsToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "ai-promo-video" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {aiPromoVideoToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "ai-timing" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {aiTimingToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "tech-helper" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {techHelperToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "yard-help" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {yardHelpToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "homework-organizer" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {homeworkOrganizerToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "group-setup-helper" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {groupSetupHelperToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "house-sitter" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {houseSitterToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "bookkeeping" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {bookkeepingToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "closet-cleanout-listing" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {closetCleanoutListingToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "nonprofit-social-helper" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {nonprofitSocialHelperToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "digital-products" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {digitalProductsToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "book-publishing" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {bookPublishingToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "start-gardening-club" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {startGardeningClubToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "start-book-club" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {startBookClubToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "foreclosure-properties" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {foreclosurePropertiesToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "cleaning-service" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {cleaningServiceToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "kids-games-ai" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {kidsGamesAiToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "ai-prompt-helper" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {aiPromptHelperToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "junior-games-ai" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {juniorGamesAiToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "rideshare" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {rideshareToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "local-event-content-creator" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {localEventContentToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "property-mgmt" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {propertyMgmtToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "airbnb-turnover-checker" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {airbnbTurnoverCheckerToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "str-cohost" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {strCohostToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "junior-reinvest-ceo" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {juniorReinvestCeoToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "kids-reinvest-jar" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {kidsReinvestJarToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "local-content-photographer" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {localContentPhotoToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "personal-shopper" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {personalShopperToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "youth-sports-helper" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {youthSportsHelperToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "junior-give-back-teach" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {juniorGiveBackTeachToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "kids-kindness-share" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {kidsKindnessShareToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "beach-shell-jewelry" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {beachShellJewelryToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "gift-wrapping" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {giftWrappingToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "affiliate" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {affiliateToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "dropshipping" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {dropshippingToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "fb-marketplace-helper" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {fbMarketplaceHelperToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "basic-invitation-creator" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {basicInvitationToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "pod" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {podToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "pet-sitting" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {petSittingToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : completedNotes ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {completedNotes
                .toolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : guideId === "kids-piggy-first-goal" ? (
            <div className="gysh-section-panel__intro" data-testid={`${testIdPrefix}-tools-intro`}>
              {kidsPiggyFirstGoalToolsDisclaimer()
                .split(/\n\n+/)
                .map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {para}
                  </p>
                ))}
            </div>
          ) : (
            <p className="gysh-section-panel__lede">
              {guideId === "food-delivery"
                ? deliveryDriverToolsDisclaimer()
                : guideToolsDisclaimer()}
            </p>
          )}
          <ul className="gysh-section-panel__list">
            {kit.tools.map((tool) => (
              <li key={tool.id}>
                {formatGuideToolLine(tool)}
                {tool.url ? (
                  <>
                    {" "}
                    <a href={tool.url} target="_blank" rel="noopener noreferrer">
                      Open {tool.name}
                    </a>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
          {kit.externalLinks && kit.externalLinks.length > 0 ? (
            <div className="gysh-section-panel__links">
              <strong>Exact outside links</strong>
              <ul className="gysh-section-panel__list">
                {kit.externalLinks.map((link) => (
                  <li key={link.url}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                    {link.note ? ` — ${link.note}` : ""} ({link.url})
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ),
    });

    if (stepsTab && stepsTab.count > 0) {
      list.push({
        id: "steps",
        label: `Show ${stepsTab.count} step${stepsTab.count === 1 ? "" : "s"}`,
        panelClass: "gysh-section-panel--steps",
        testId: `${testIdPrefix}-steps`,
        content: stepsTab.content,
      });
    }

    if (calculatorTab) {
      list.push({
        id: "calculator",
        label: "Revenue Calculator",
        panelClass: "gysh-section-panel--calculator",
        testId: `${testIdPrefix}-calculator`,
        content: calculatorTab.content,
      });
    }

    if (notesTab) {
      list.push({
        id: "notes",
        label: "Notes",
        panelClass: "gysh-section-panel--notes",
        testId: `${testIdPrefix}-notes`,
        content: (
          <>
            {guideId === "food-delivery" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-delivery-worksheet`}
              >
                <summary>My Delivery Strategy worksheet</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {FOOD_DELIVERY_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you log weekly
                  results.
                </p>
              </details>
            ) : guideId === "estate-sale-listing-helper" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-estate-sale-worksheet`}
              >
                <summary>Reseller Field Notebook</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {ESTATE_SALE_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you log finds and
                  lessons.
                </p>
              </details>
            ) : guideId === "family-history-organizer" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-genealogy-worksheet`}
              >
                <summary>Family History Research Notebook</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {GENEALOGY_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you log research.
                </p>
              </details>
            ) : guideId === "kids-party-game-host" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-party-host-worksheet`}
              >
                <summary>My Party Host Planner</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {KIDS_PARTY_GAME_HOST_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan parties.
                </p>
              </details>
            ) : guideId === "lead-followup-assistant" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-lead-followup-worksheet`}
              >
                <summary>Lead Follow-Up Client Planner</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {LEAD_FOLLOWUP_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you manage clients.
                </p>
              </details>
            ) : guideId === "appointment-setter" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-appointment-setter-worksheet`}
              >
                <summary>My Appointment Setting Business</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {APPOINTMENT_SETTER_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you manage bookings.
                </p>
              </details>
            ) : guideId === "online-research-assistant" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-online-research-worksheet`}
              >
                <summary>My Online Research Business</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {ONLINE_RESEARCH_ASSISTANT_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you run projects.
                </p>
              </details>
            ) : guideId === "mothers-helper" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-mothers-helper-worksheet`}
              >
                <summary>My Mother's Helper Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {MOTHERS_HELPER_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan jobs.
                </p>
              </details>
            ) : guideId === "babysitting" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-babysitting-worksheet`}
              >
                <summary>My Babysitting Planner</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {BABYSITTING_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan sits.
                </p>
              </details>
            ) : guideId === "errand-runner" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-errand-runner-worksheet`}
              >
                <summary>My Errand Runner Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {ERRAND_RUNNER_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan runs.
                </p>
              </details>
            ) : guideId === "ai-agents" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-ai-agents-worksheet`}
              >
                <summary>My AI Agent Offer</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {AI_AGENTS_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you scope the workflow.
                </p>
              </details>
            ) : guideId === "ai-promo-video" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-ai-promo-video-worksheet`}
              >
                <summary>My AI Promo Video Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {AI_PROMO_VIDEO_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan the promo.
                </p>
              </details>
            ) : guideId === "ai-timing" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-ai-timing-worksheet`}
              >
                <summary>My AI Rideshare Timing Scout Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {AI_TIMING_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you research windows.
                </p>
              </details>
            ) : guideId === "tech-helper" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-tech-helper-worksheet`}
              >
                <summary>My Tech-Help Service</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {TECH_HELPER_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you teach.
                </p>
              </details>
            ) : guideId === "yard-help" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-yard-help-worksheet`}
              >
                <summary>My Yard & Garden Helper Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {YARD_HELP_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan jobs.
                </p>
              </details>
            ) : guideId === "homework-organizer" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-homework-organizer-worksheet`}
              >
                <summary>My Homework Organizer Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {HOMEWORK_ORGANIZER_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan sessions.
                </p>
              </details>
            ) : guideId === "group-setup-helper" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-group-setup-helper-worksheet`}
              >
                <summary>My TikTok/Facebook Setup Service</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {GROUP_SETUP_HELPER_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan projects.
                </p>
              </details>
            ) : guideId === "house-sitter" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-house-sitter-worksheet`}
              >
                <summary>My House-Sitting Service</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {HOUSE_SITTER_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan check-ins.
                </p>
              </details>
            ) : guideId === "bookkeeping" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-bookkeeping-worksheet`}
              >
                <summary>My Bookkeeping & Admin Service</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {BOOKKEEPING_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan the month.
                </p>
              </details>
            ) : guideId === "closet-cleanout-listing" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-closet-cleanout-listing-worksheet`}
              >
                <summary>My Closet Listing Service</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {CLOSET_CLEANOUT_LISTING_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan the batch.
                </p>
              </details>
            ) : guideId === "nonprofit-social-helper" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-nonprofit-social-helper-worksheet`}
              >
                <summary>My Church/Nonprofit Social Media Service</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {NONPROFIT_SOCIAL_HELPER_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan the month.
                </p>
              </details>
            ) : guideId === "digital-products" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-digital-products-worksheet`}
              >
                <summary>My Digital Product Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {DIGITAL_PRODUCTS_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you launch.
                </p>
              </details>
            ) : guideId === "book-publishing" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-book-publishing-worksheet`}
              >
                <summary>My Book Publishing Dashboard</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {BOOK_PUBLISHING_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you publish.
                </p>
              </details>
            ) : guideId === "start-gardening-club" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-start-gardening-club-worksheet`}
              >
                <summary>My Gardening Club Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {START_GARDENING_CLUB_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan the club.
                </p>
              </details>
            ) : guideId === "start-book-club" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-start-book-club-worksheet`}
              >
                <summary>My Book Club Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {START_BOOK_CLUB_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan the club.
                </p>
              </details>
            ) : guideId === "foreclosure-properties" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-foreclosure-properties-worksheet`}
              >
                <summary>Buy Box & Deal Notes</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {FORECLOSURE_PROPERTIES_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you underwrite.
                </p>
              </details>
            ) : guideId === "cleaning-service" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-cleaning-service-worksheet`}
              >
                <summary>Cleaning Service Notes</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {CLEANING_SERVICE_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan jobs.
                </p>
              </details>
            ) : guideId === "kids-games-ai" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-kids-games-ai-worksheet`}
              >
                <summary>My Tiny Game</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {KIDS_GAMES_AI_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you build.
                </p>
              </details>
            ) : guideId === "ai-prompt-helper" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-ai-prompt-helper-worksheet`}
              >
                <summary>My AI Learning Goal</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {AI_PROMPT_HELPER_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you practice.
                </p>
              </details>
            ) : guideId === "junior-games-ai" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-junior-games-ai-worksheet`}
              >
                <summary>My Game</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {JUNIOR_GAMES_AI_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you build.
                </p>
              </details>
            ) : guideId === "rideshare" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-rideshare-worksheet`}
              >
                <summary>My Rideshare Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {RIDESHARE_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you log shifts.
                </p>
              </details>
            ) : guideId === "local-event-content-creator" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-local-event-worksheet`}
              >
                <summary>My Local Event Content Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {LOCAL_EVENT_CONTENT_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan events.
                </p>
              </details>
            ) : guideId === "property-mgmt" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-property-mgmt-worksheet`}
              >
                <summary>My Property Management Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {PROPERTY_MGMT_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you manage properties.
                </p>
              </details>
            ) : guideId === "airbnb-turnover-checker" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-turnover-checker-worksheet`}
              >
                <summary>My Airbnb Turnover Checker Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {AIRBNB_TURNOVER_CHECKER_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below. Never store access codes in public notes.
                </p>
              </details>
            ) : guideId === "str-cohost" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-str-cohost-worksheet`}
              >
                <summary>My Airbnb Arbitrage Hosting Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {STR_COHOST_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below. Do not sign a lease until written permission and the numbers work.
                </p>
              </details>
            ) : guideId === "junior-reinvest-ceo" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-junior-reinvest-worksheet`}
              >
                <summary>My CEO Money Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {JUNIOR_REINVEST_CEO_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you split earnings.
                </p>
              </details>
            ) : guideId === "kids-reinvest-jar" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-kids-reinvest-worksheet`}
              >
                <summary>My Grow-Your-Hustle Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {KIDS_REINVEST_JAR_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you split coins.
                </p>
              </details>
            ) : guideId === "local-content-photographer" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-content-photo-worksheet`}
              >
                <summary>Content Shoot Planner</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {LOCAL_CONTENT_PHOTO_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan shoots.
                </p>
              </details>
            ) : guideId === "personal-shopper" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-personal-shopper-worksheet`}
              >
                <summary>Personal Shopper Client Planner</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {PERSONAL_SHOPPER_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you shop.
                </p>
              </details>
            ) : guideId === "youth-sports-helper" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-youth-sports-helper-worksheet`}
              >
                <summary>Practice Helper Planner</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {YOUTH_SPORTS_HELPER_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you help at practice.
                </p>
              </details>
            ) : guideId === "junior-give-back-teach" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-junior-give-back-worksheet`}
              >
                <summary>My Give-Back Teaching Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {JUNIOR_GIVE_BACK_TEACH_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you plan your session.
                </p>
              </details>
            ) : guideId === "kids-kindness-share" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-kids-kindness-worksheet`}
              >
                <summary>My Give-Back Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {KIDS_KINDNESS_SHARE_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you help.
                </p>
              </details>
            ) : guideId === "beach-shell-jewelry" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-beach-shell-jewelry-worksheet`}
              >
                <summary>My Beach Shell Jewelry Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {BEACH_SHELL_JEWELRY_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you make and sell.
                </p>
              </details>
            ) : guideId === "gift-wrapping" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-gift-wrapping-worksheet`}
              >
                <summary>My Gift Wrapping Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {GIFT_WRAPPING_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you wrap and hand off gifts.
                </p>
              </details>
            ) : guideId === "affiliate" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-affiliate-worksheet`}
              >
                <summary>My Affiliate Marketing Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {AFFILIATE_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you publish and track.
                </p>
              </details>
            ) : guideId === "dropshipping" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-dropshipping-worksheet`}
              >
                <summary>My Dropshipping Business Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {DROPSHIPPING_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you test products.
                </p>
              </details>
            ) : guideId === "fb-marketplace-helper" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-fb-marketplace-helper-worksheet`}
              >
                <summary>My Facebook Marketplace Listing Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {FB_MARKETPLACE_HELPER_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you list items.
                </p>
              </details>
            ) : guideId === "basic-invitation-creator" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-basic-invitation-creator-worksheet`}
              >
                <summary>My Basic Invitation Creator Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {BASIC_INVITATION_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you design and proof.
                </p>
              </details>
            ) : guideId === "pod" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-pod-worksheet`}
              >
                <summary>My Print-on-Demand Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">{POD_NOTES_WORKSHEET}</pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you test products.
                </p>
              </details>
            ) : guideId === "pet-sitting" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-pet-sitting-worksheet`}
              >
                <summary>My Pet Sitting & Dog Walking Plan</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {PET_SITTING_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you care for pets.
                </p>
              </details>
            ) : completedNotes ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-${completedNotes.testId}`}
              >
                <summary>{completedNotes.summary}</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {completedNotes.worksheet}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you work the plan.
                </p>
              </details>
            ) : guideId === "kids-piggy-first-goal" ? (
              <details
                className="gysh-section-panel__worksheet"
                data-testid={`${testIdPrefix}-kids-piggy-worksheet`}
              >
                <summary>My First Savings Goal</summary>
                <pre className="gysh-section-panel__worksheet-body">
                  {KIDS_PIGGY_FIRST_GOAL_NOTES_WORKSHEET}
                </pre>
                <p className="gysh-section-panel__foot">
                  Copy what you need into your notes below, or keep this open while you save.
                </p>
              </details>
            ) : null}
            {notesTab.content}
          </>
        ),
      });
    }

    return [
      {
        id: "all" as const,
        label: "Show All",
        panelClass: "gysh-section-panel--all",
        testId: `${testIdPrefix}-show-all`,
        content: null,
      },
      ...list,
    ];
  }, [kit, pricing, supplies, checkedSupplies, testIdPrefix, stepsTab, calculatorTab, notesTab, guideId]);

  const sectionTabs = tabs.filter((t) => t.id !== "all");
  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];
  const showAll = activeTab === "all";
  const afterTabsNode =
    typeof afterTabs === "function" ? afterTabs(activeTab) : afterTabs;
  const activeLocked = guidePrepTabIsLocked(activeTab as GuidePrepSectionId, guideUnlocked);

  const selectTab = (id: PrepTabId) => {
    setActiveTab(id);
    // When jumping to a section from Show All, keep that section expanded if we return later.
    if (id !== "all") {
      setOpenSections((prev) => ({ ...prev, [id]: true }));
    }
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      // Default is open; first click collapses.
      ...prev,
      [id]: prev[id] === false,
    }));
  };

  const lockedPanel = (
    <div className="guide-prep-tab-locked" data-testid={`${testIdPrefix}-tab-locked`}>
      {lockCta}
    </div>
  );

  return (
    <div className="guide-prep-sections guide-prep-sections--tabs" data-testid={`${testIdPrefix}-prep-tabs`}>
      <div
        className="guide-prep-tabs"
        role="tablist"
        aria-label="Guide sections"
        data-testid={`${testIdPrefix}-prep-tablist`}
      >
        {tabs.map((tab) => {
          const locked = guidePrepTabIsLocked(tab.id as GuidePrepSectionId, guideUnlocked);
          return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${testIdPrefix}-tab-${tab.id}`}
            aria-selected={active.id === tab.id}
            aria-controls={
              tab.id === "all" ? `${testIdPrefix}-panel-all` : `${testIdPrefix}-panel-${tab.id}`
            }
            data-testid={
              tab.id === "all"
                ? `${testIdPrefix}-tab-all`
                : tab.id === "steps"
                  ? `${testIdPrefix}-steps-toggle`
                  : `${testIdPrefix}-tab-${tab.id}`
            }
            data-locked={locked ? "true" : "false"}
            className={`guide-prep-tab${active.id === tab.id ? " is-active" : ""}${locked ? " is-locked" : ""}`}
            onClick={() => selectTab(tab.id)}
          >
            {tab.label}
            {locked ? <Lock size={12} aria-hidden /> : null}
          </button>
          );
        })}
      </div>

      {showAll ? (
        activeLocked ? (
          lockedPanel
        ) : (
        <div
          className="guide-prep-show-all"
          id={`${testIdPrefix}-panel-all`}
          role="tabpanel"
          aria-labelledby={`${testIdPrefix}-tab-all`}
          data-testid={`${testIdPrefix}-show-all`}
        >
          {sectionTabs.map((tab) => {
            const sectionLocked = guidePrepTabIsLocked(tab.id as GuidePrepSectionId, guideUnlocked);
            const open = expandAllSections ? openSections[tab.id] !== false : openSections[tab.id] !== false;
            const panelId = `${testIdPrefix}-collapse-${tab.id}`;
            return (
              <section
                key={tab.id}
                className={`gysh-section-panel gysh-section-panel--collapsible ${tab.panelClass} guide-prep-${tab.id === "prereqs" ? "prereqs" : tab.id}${open ? " is-open" : ""}`}
                aria-label={tab.label}
                data-testid={tab.testId}
              >
                <button
                  type="button"
                  className="gysh-section-heading gysh-section-heading--toggle"
                  aria-expanded={open}
                  aria-controls={panelId}
                  data-testid={`${testIdPrefix}-collapse-toggle-${tab.id}`}
                  onClick={() => toggleSection(tab.id)}
                >
                  <span className="gysh-section-heading__chevron" aria-hidden>
                    {open ? "▾" : "▸"}
                  </span>
                  <span>{tab.label.replace(/^Show /, "")}</span>
                  {sectionLocked ? <Lock size={14} aria-hidden /> : null}
                </button>
                {open ? (
                  <div className="gysh-section-panel__body" id={panelId}>
                    {sectionLocked ? lockedPanel : tab.content}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
        )
      ) : ownedByAfterTabs.has(active.id) ? null : (
        <section
          className={`gysh-section-panel ${active.panelClass} guide-prep-${active.id === "prereqs" ? "prereqs" : active.id}`}
          role="tabpanel"
          id={`${testIdPrefix}-panel-${active.id}`}
          aria-labelledby={`${testIdPrefix}-tab-${active.id}`}
          data-testid={active.testId}
          aria-label={active.label}
        >
          <h3 className="gysh-section-heading">{active.label.replace(/^Show /, "")}</h3>
          <div className="gysh-section-panel__body">{activeLocked ? lockedPanel : active.content}</div>
        </section>
      )}

      {afterTabsNode}
    </div>
  );
}
