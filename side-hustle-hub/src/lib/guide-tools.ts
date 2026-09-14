/**
 * Prerequisites + tools (with costs & exact URLs) for every Launch / Kids / workshop guide.
 * Outside sources always include a full https link. Prices change — verify on the vendor site.
 */

import { detailedStepsForGuide, isGenericGuideSteps, finalizeGuidePlaybookSteps } from "./guide-detailed-steps";
import { ensureMarketingPlanSteps } from "./guide-marketing-plan";
import {
  FOOD_DELIVERY_EXTERNAL_LINKS,
  FOOD_DELIVERY_PREREQUISITE_EXTRAS,
  FOOD_DELIVERY_PRICING,
  FOOD_DELIVERY_SUPPLIES,
  FOOD_DELIVERY_SURVIVAL_TOOLS,
} from "./food-delivery-guide";
import {
  KIDS_PARTY_GAME_HOST_EXTERNAL_LINKS,
  KIDS_PARTY_GAME_HOST_PREREQUISITE_EXTRAS,
  KIDS_PARTY_GAME_HOST_PRICING,
  KIDS_PARTY_GAME_HOST_SUPPLIES,
  KIDS_PARTY_GAME_HOST_TOOLS,
  kidsPartyGameHostToolsDisclaimer,
} from "./kids-party-game-host-guide";
import {
  LEAD_FOLLOWUP_EXTERNAL_LINKS,
  LEAD_FOLLOWUP_PREREQUISITE_EXTRAS,
  LEAD_FOLLOWUP_PRICING,
  LEAD_FOLLOWUP_SUPPLIES,
  LEAD_FOLLOWUP_TOOLS,
  leadFollowupToolsDisclaimer,
} from "./lead-followup-assistant-guide";
import {
  APPOINTMENT_SETTER_EXTERNAL_LINKS,
  APPOINTMENT_SETTER_PREREQUISITE_EXTRAS,
  APPOINTMENT_SETTER_PRICING,
  APPOINTMENT_SETTER_SUPPLIES,
  APPOINTMENT_SETTER_TOOLS,
  appointmentSetterToolsDisclaimer,
} from "./appointment-setter-guide";
import {
  ONLINE_RESEARCH_ASSISTANT_EXTERNAL_LINKS,
  ONLINE_RESEARCH_ASSISTANT_PREREQUISITE_EXTRAS,
  ONLINE_RESEARCH_ASSISTANT_PRICING,
  ONLINE_RESEARCH_ASSISTANT_SUPPLIES,
  ONLINE_RESEARCH_ASSISTANT_TOOLS,
  onlineResearchAssistantToolsDisclaimer,
} from "./online-research-assistant-guide";
import {
  MOTHERS_HELPER_EXTERNAL_LINKS,
  MOTHERS_HELPER_PREREQUISITE_EXTRAS,
  MOTHERS_HELPER_PRICING,
  MOTHERS_HELPER_SUPPLIES,
  MOTHERS_HELPER_TOOLS,
  mothersHelperToolsDisclaimer,
} from "./mothers-helper-guide";
import {
  CRAFTS_EXTERNAL_LINKS,
  CRAFTS_PREREQUISITE_EXTRAS,
  CRAFTS_PRICING,
  CRAFTS_SUPPLIES,
  CRAFTS_TOOLS,
  craftsToolsDisclaimer,
} from "./crafts-guide";
import {
  BEACH_SHELL_JEWELRY_EXTERNAL_LINKS,
  BEACH_SHELL_JEWELRY_PREREQUISITE_EXTRAS,
  BEACH_SHELL_JEWELRY_PRICING,
  BEACH_SHELL_JEWELRY_SUPPLIES,
  BEACH_SHELL_JEWELRY_TOOLS,
  beachShellJewelryToolsDisclaimer,
} from "./beach-shell-jewelry-guide";
import {
  GIFT_WRAPPING_EXTERNAL_LINKS,
  GIFT_WRAPPING_PREREQUISITE_EXTRAS,
  GIFT_WRAPPING_PRICING,
  GIFT_WRAPPING_SUPPLIES,
  GIFT_WRAPPING_TOOLS,
  giftWrappingToolsDisclaimer,
} from "./gift-wrapping-guide";
import {
  AFFILIATE_EXTERNAL_LINKS,
  AFFILIATE_PREREQUISITE_EXTRAS,
  AFFILIATE_PRICING,
  AFFILIATE_SUPPLIES,
  AFFILIATE_TOOLS,
  affiliateToolsDisclaimer,
} from "./affiliate-guide";
import {
  DROPSHIPPING_EXTERNAL_LINKS,
  DROPSHIPPING_PREREQUISITE_EXTRAS,
  DROPSHIPPING_PRICING,
  DROPSHIPPING_SUPPLIES,
  DROPSHIPPING_TOOLS,
  dropshippingToolsDisclaimer,
} from "./dropshipping-guide";
import {
  FB_MARKETPLACE_HELPER_EXTERNAL_LINKS,
  FB_MARKETPLACE_HELPER_PREREQUISITE_EXTRAS,
  FB_MARKETPLACE_HELPER_PRICING,
  FB_MARKETPLACE_HELPER_SUPPLIES,
  FB_MARKETPLACE_HELPER_TOOLS,
  fbMarketplaceHelperToolsDisclaimer,
} from "./fb-marketplace-helper-guide";
import {
  PORCH_PACKAGE_EXTERNAL_LINKS,
  PORCH_PACKAGE_PREREQUISITE_EXTRAS,
  PORCH_PACKAGE_PRICING,
  PORCH_PACKAGE_SUPPLIES,
  PORCH_PACKAGE_TOOLS,
  porchPackageHelperToolsDisclaimer,
} from "./porch-package-helper-guide";
import {
  BOOK_PUBLISHING_KIDS_EXTERNAL_LINKS,
  BOOK_PUBLISHING_KIDS_PREREQUISITE_EXTRAS,
  BOOK_PUBLISHING_KIDS_PRICING,
  BOOK_PUBLISHING_KIDS_SUPPLIES,
  BOOK_PUBLISHING_KIDS_TOOLS,
  bookPublishingKidsToolsDisclaimer,
} from "./book-publishing-kids-guide";
import {
  TRAVEL_RESEARCH_EXTERNAL_LINKS,
  TRAVEL_RESEARCH_PREREQUISITE_EXTRAS,
  TRAVEL_RESEARCH_PRICING,
  TRAVEL_RESEARCH_SUPPLIES,
  TRAVEL_RESEARCH_TOOLS,
  travelResearchAssistantToolsDisclaimer,
} from "./travel-research-assistant-guide";
import {
  TRANSCRIPTION_NOTES_EXTERNAL_LINKS,
  TRANSCRIPTION_NOTES_PREREQUISITE_EXTRAS,
  TRANSCRIPTION_NOTES_PRICING,
  TRANSCRIPTION_NOTES_SUPPLIES,
  TRANSCRIPTION_NOTES_TOOLS,
  transcriptionNotesHelperToolsDisclaimer,
} from "./transcription-notes-helper-guide";
import {
  WEBSITE_TESTER_EXTERNAL_LINKS,
  WEBSITE_TESTER_PREREQUISITE_EXTRAS,
  WEBSITE_TESTER_PRICING,
  WEBSITE_TESTER_SUPPLIES,
  WEBSITE_TESTER_TOOLS,
  websiteTesterToolsDisclaimer,
} from "./website-tester-guide";
import {
  COMMUNITY_NEWSLETTER_EXTERNAL_LINKS,
  COMMUNITY_NEWSLETTER_PREREQUISITE_EXTRAS,
  COMMUNITY_NEWSLETTER_PRICING,
  COMMUNITY_NEWSLETTER_SUPPLIES,
  COMMUNITY_NEWSLETTER_TOOLS,
  communityNewsletterCreatorToolsDisclaimer,
} from "./community-newsletter-creator-guide";
import {
  COMMUNITY_TEACHING_EXTERNAL_LINKS,
  COMMUNITY_TEACHING_PREREQUISITE_EXTRAS,
  COMMUNITY_TEACHING_PRICING,
  COMMUNITY_TEACHING_SUPPLIES,
  COMMUNITY_TEACHING_TOOLS,
  communityTeachingWorkshopsToolsDisclaimer,
} from "./community-teaching-workshops-guide";
import {
  REVIEW_RESPONSE_EXTERNAL_LINKS,
  REVIEW_RESPONSE_PREREQUISITE_EXTRAS,
  REVIEW_RESPONSE_PRICING,
  REVIEW_RESPONSE_SUPPLIES,
  REVIEW_RESPONSE_TOOLS,
  reviewResponseAssistantToolsDisclaimer,
} from "./review-response-assistant-guide";
import {
  CAREER_CONSULTING_EXTERNAL_LINKS,
  CAREER_CONSULTING_PREREQUISITE_EXTRAS,
  CAREER_CONSULTING_PRICING,
  CAREER_CONSULTING_SUPPLIES,
  CAREER_CONSULTING_TOOLS,
  careerIndustryConsultingToolsDisclaimer,
} from "./career-industry-consulting-guide";
import {
  PART_TIME_NOTARY_EXTERNAL_LINKS,
  PART_TIME_NOTARY_PREREQUISITE_EXTRAS,
  PART_TIME_NOTARY_PRICING,
  PART_TIME_NOTARY_SUPPLIES,
  PART_TIME_NOTARY_TOOLS,
  partTimeNotaryToolsDisclaimer,
} from "./part-time-notary-guide";
import {
  RESUME_LINKEDIN_EXTERNAL_LINKS,
  RESUME_LINKEDIN_PREREQUISITE_EXTRAS,
  RESUME_LINKEDIN_PRICING,
  RESUME_LINKEDIN_SUPPLIES,
  RESUME_LINKEDIN_TOOLS,
  resumeLinkedInHelperToolsDisclaimer,
} from "./resume-linkedin-helper-guide";
import {
  SHORT_FORM_VIDEO_EXTERNAL_LINKS,
  SHORT_FORM_VIDEO_PREREQUISITE_EXTRAS,
  SHORT_FORM_VIDEO_PRICING,
  SHORT_FORM_VIDEO_SUPPLIES,
  SHORT_FORM_VIDEO_TOOLS,
  shortFormVideoEditorToolsDisclaimer,
} from "./short-form-video-editor-guide";
import {
  GBP_HELPER_EXTERNAL_LINKS,
  GBP_HELPER_PREREQUISITE_EXTRAS,
  GBP_HELPER_PRICING,
  GBP_HELPER_SUPPLIES,
  GBP_HELPER_TOOLS,
  googleBusinessProfileHelperToolsDisclaimer,
} from "./google-business-profile-helper-guide";
import {
  UGC_CREATOR_EXTERNAL_LINKS,
  UGC_CREATOR_PREREQUISITE_EXTRAS,
  UGC_CREATOR_PRICING,
  UGC_CREATOR_SUPPLIES,
  UGC_CREATOR_TOOLS,
  ugcCreatorToolsDisclaimer,
} from "./ugc-creator-guide";
import {
  VIRTUAL_ASSISTANT_EXTERNAL_LINKS,
  VIRTUAL_ASSISTANT_PREREQUISITE_EXTRAS,
  VIRTUAL_ASSISTANT_PRICING,
  VIRTUAL_ASSISTANT_SUPPLIES,
  VIRTUAL_ASSISTANT_TOOLS,
  virtualAssistantToolsDisclaimer,
} from "./virtual-assistant-guide";
import {
  VIRTUAL_RECEPTIONIST_EXTERNAL_LINKS,
  VIRTUAL_RECEPTIONIST_PREREQUISITE_EXTRAS,
  VIRTUAL_RECEPTIONIST_PRICING,
  VIRTUAL_RECEPTIONIST_SUPPLIES,
  VIRTUAL_RECEPTIONIST_TOOLS,
  virtualReceptionistToolsDisclaimer,
} from "./virtual-receptionist-guide";
import {
  SOCIAL_INFLUENCER_EXTERNAL_LINKS,
  SOCIAL_INFLUENCER_PREREQUISITE_EXTRAS,
  SOCIAL_INFLUENCER_PRICING,
  SOCIAL_INFLUENCER_SUPPLIES,
  SOCIAL_INFLUENCER_TOOLS,
  socialInfluencerToolsDisclaimer,
} from "./social-influencer-guide";
import {
  COMMUNITY_MODERATOR_EXTERNAL_LINKS,
  COMMUNITY_MODERATOR_PREREQUISITE_EXTRAS,
  COMMUNITY_MODERATOR_PRICING,
  COMMUNITY_MODERATOR_SUPPLIES,
  COMMUNITY_MODERATOR_TOOLS,
  onlineCommunityModeratorToolsDisclaimer,
} from "./online-community-moderator-guide";
import {
  BASIC_INVITATION_EXTERNAL_LINKS,
  BASIC_INVITATION_PREREQUISITE_EXTRAS,
  BASIC_INVITATION_PRICING,
  BASIC_INVITATION_SUPPLIES,
  BASIC_INVITATION_TOOLS,
  basicInvitationToolsDisclaimer,
} from "./basic-invitation-creator-guide";
import {
  POD_EXTERNAL_LINKS,
  POD_PREREQUISITE_EXTRAS,
  POD_PRICING,
  POD_SUPPLIES,
  POD_TOOLS,
  podToolsDisclaimer,
} from "./pod-guide";
import {
  PET_SITTING_EXTERNAL_LINKS,
  PET_SITTING_PREREQUISITE_EXTRAS,
  PET_SITTING_PRICING,
  PET_SITTING_SUPPLIES,
  PET_SITTING_TOOLS,
  petSittingToolsDisclaimer,
} from "./pet-sitting-guide";
import {
  HANDYMAN_EXTERNAL_LINKS,
  HANDYMAN_PREREQUISITE_EXTRAS,
  HANDYMAN_PRICING,
  HANDYMAN_SUPPLIES,
  HANDYMAN_TOOLS,
  handymanToolsDisclaimer,
} from "./handyman-guide";
import {
  FRIENDSHIP_BRACELET_EXTERNAL_LINKS,
  FRIENDSHIP_BRACELET_PREREQUISITE_EXTRAS,
  FRIENDSHIP_BRACELET_PRICING,
  FRIENDSHIP_BRACELET_SUPPLIES,
  FRIENDSHIP_BRACELET_TOOLS,
  friendshipBraceletToolsDisclaimer,
} from "./friendship-bracelet-maker-guide";
import {
  LEAF_RAKING_EXTERNAL_LINKS,
  LEAF_RAKING_PREREQUISITE_EXTRAS,
  LEAF_RAKING_PRICING,
  LEAF_RAKING_SUPPLIES,
  LEAF_RAKING_TOOLS,
  leafRakingToolsDisclaimer,
} from "./leaf-raking-guide";
import {
  LEMONADE_STAND_EXTERNAL_LINKS,
  LEMONADE_STAND_PREREQUISITE_EXTRAS,
  LEMONADE_STAND_PRICING,
  LEMONADE_STAND_SUPPLIES,
  LEMONADE_STAND_TOOLS,
  lemonadeStandToolsDisclaimer,
} from "./lemonade-stand-guide";
import {
  AIRBNB_HOSTING_EXTERNAL_LINKS,
  AIRBNB_HOSTING_PREREQUISITE_EXTRAS,
  AIRBNB_HOSTING_PRICING,
  AIRBNB_HOSTING_SUPPLIES,
  AIRBNB_HOSTING_TOOLS,
  airbnbHostingToolsDisclaimer,
} from "./airbnb-hosting-guide";
import {
  DIGITAL_COOKBOOK_EXTERNAL_LINKS,
  DIGITAL_COOKBOOK_PREREQUISITE_EXTRAS,
  DIGITAL_COOKBOOK_PRICING,
  DIGITAL_COOKBOOK_SUPPLIES,
  DIGITAL_COOKBOOK_TOOLS,
  digitalCookbookToolsDisclaimer,
} from "./digital-cookbook-creator-guide";
import {
  FAMILY_PHOTO_SLIDESHOW_EXTERNAL_LINKS,
  FAMILY_PHOTO_SLIDESHOW_PREREQUISITE_EXTRAS,
  FAMILY_PHOTO_SLIDESHOW_PRICING,
  FAMILY_PHOTO_SLIDESHOW_SUPPLIES,
  FAMILY_PHOTO_SLIDESHOW_TOOLS,
  familyPhotoSlideshowToolsDisclaimer,
} from "./family-photo-slideshow-guide";
import {
  LOCAL_RESOURCE_LIST_EXTERNAL_LINKS,
  LOCAL_RESOURCE_LIST_PREREQUISITE_EXTRAS,
  LOCAL_RESOURCE_LIST_PRICING,
  LOCAL_RESOURCE_LIST_SUPPLIES,
  LOCAL_RESOURCE_LIST_TOOLS,
  localResourceListToolsDisclaimer,
} from "./local-resource-list-creator-guide";
import {
  RECYCLING_HELPER_EXTERNAL_LINKS,
  RECYCLING_HELPER_PREREQUISITE_EXTRAS,
  RECYCLING_HELPER_PRICING,
  RECYCLING_HELPER_SUPPLIES,
  RECYCLING_HELPER_TOOLS,
  recyclingHelperToolsDisclaimer,
} from "./recycling-helper-guide";
import {
  PROOFREADER_EXTERNAL_LINKS,
  PROOFREADER_PREREQUISITE_EXTRAS,
  PROOFREADER_PRICING,
  PROOFREADER_SUPPLIES,
  PROOFREADER_TOOLS,
  proofreaderToolsDisclaimer,
} from "./proofreader-guide";
import {
  TOY_ORGANIZER_EXTERNAL_LINKS,
  TOY_ORGANIZER_PREREQUISITE_EXTRAS,
  TOY_ORGANIZER_PRICING,
  TOY_ORGANIZER_SUPPLIES,
  TOY_ORGANIZER_TOOLS,
  toyOrganizerToolsDisclaimer,
} from "./toy-organizer-guide";
import {
  TRASH_CAN_SERVICE_EXTERNAL_LINKS,
  TRASH_CAN_SERVICE_PREREQUISITE_EXTRAS,
  TRASH_CAN_SERVICE_PRICING,
  TRASH_CAN_SERVICE_SUPPLIES,
  TRASH_CAN_SERVICE_TOOLS,
  trashCanServiceToolsDisclaimer,
} from "./trash-can-service-guide";
import {
  HOMEWORK_HELPER_EXTERNAL_LINKS,
  HOMEWORK_HELPER_PREREQUISITE_EXTRAS,
  HOMEWORK_HELPER_PRICING,
  HOMEWORK_HELPER_SUPPLIES,
  HOMEWORK_HELPER_TOOLS,
  homeworkHelperToolsDisclaimer,
} from "./homework-helper-guide";
import {
  CANVA_FLYER_EXTERNAL_LINKS,
  CANVA_FLYER_PREREQUISITE_EXTRAS,
  CANVA_FLYER_PRICING,
  CANVA_FLYER_SUPPLIES,
  CANVA_FLYER_TOOLS,
  canvaFlyerToolsDisclaimer,
} from "./canva-flyer-creator-guide";
import {
  CAR_INTERIOR_EXTERNAL_LINKS,
  CAR_INTERIOR_PREREQUISITE_EXTRAS,
  CAR_INTERIOR_PRICING,
  CAR_INTERIOR_SUPPLIES,
  CAR_INTERIOR_TOOLS,
  carInteriorToolsDisclaimer,
} from "./car-interior-cleanup-guide";
import {
  NEIGHBORHOOD_DOG_WALKER_EXTERNAL_LINKS,
  NEIGHBORHOOD_DOG_WALKER_PREREQUISITE_EXTRAS,
  NEIGHBORHOOD_DOG_WALKER_PRICING,
  NEIGHBORHOOD_DOG_WALKER_SUPPLIES,
  NEIGHBORHOOD_DOG_WALKER_TOOLS,
  neighborhoodDogWalkerToolsDisclaimer,
} from "./neighborhood-dog-walker-guide";
import {
  GREETING_CARD_EXTERNAL_LINKS,
  GREETING_CARD_PREREQUISITE_EXTRAS,
  GREETING_CARD_PRICING,
  GREETING_CARD_SUPPLIES,
  GREETING_CARD_TOOLS,
  greetingCardToolsDisclaimer,
} from "./greeting-card-creator-guide";
import {
  HOLIDAY_DECORATING_EXTERNAL_LINKS,
  HOLIDAY_DECORATING_PREREQUISITE_EXTRAS,
  HOLIDAY_DECORATING_PRICING,
  HOLIDAY_DECORATING_SUPPLIES,
  HOLIDAY_DECORATING_TOOLS,
  holidayDecoratingToolsDisclaimer,
} from "./holiday-decorating-helper-guide";
import {
  LIGHT_HANDYMAN_EXTERNAL_LINKS,
  LIGHT_HANDYMAN_PREREQUISITE_EXTRAS,
  LIGHT_HANDYMAN_PRICING,
  LIGHT_HANDYMAN_SUPPLIES,
  LIGHT_HANDYMAN_TOOLS,
  lightHandymanToolsDisclaimer,
} from "./light-handyman-home-help-guide";
import {
  TUTORING_SKILLS_EXTERNAL_LINKS,
  TUTORING_SKILLS_PREREQUISITE_EXTRAS,
  TUTORING_SKILLS_PRICING,
  TUTORING_SKILLS_SUPPLIES,
  TUTORING_SKILLS_TOOLS,
  tutoringSkillsToolsDisclaimer,
} from "./tutoring-skills-coaching-guide";
import {
  VACATION_PLANT_EXTERNAL_LINKS,
  VACATION_PLANT_PREREQUISITE_EXTRAS,
  VACATION_PLANT_PRICING,
  VACATION_PLANT_SUPPLIES,
  VACATION_PLANT_TOOLS,
  vacationPlantToolsDisclaimer,
} from "./vacation-plant-helper-guide";
import {
  LOCAL_CONTENT_PHOTO_EXTERNAL_LINKS,
  LOCAL_CONTENT_PHOTO_PREREQUISITE_EXTRAS,
  LOCAL_CONTENT_PHOTO_PRICING,
  LOCAL_CONTENT_PHOTO_SUPPLIES,
  LOCAL_CONTENT_PHOTO_TOOLS,
  localContentPhotoToolsDisclaimer,
} from "./local-content-photographer-guide";
import {
  PERSONAL_SHOPPER_EXTERNAL_LINKS,
  PERSONAL_SHOPPER_PREREQUISITE_EXTRAS,
  PERSONAL_SHOPPER_PRICING,
  PERSONAL_SHOPPER_SUPPLIES,
  PERSONAL_SHOPPER_TOOLS,
  personalShopperToolsDisclaimer,
} from "./personal-shopper-guide";
import {
  BABYSITTING_EXTERNAL_LINKS,
  BABYSITTING_PREREQUISITE_EXTRAS,
  BABYSITTING_PRICING,
  BABYSITTING_SUPPLIES,
  BABYSITTING_TOOLS,
  babysittingToolsDisclaimer,
} from "./babysitting-guide";
import {
  ERRAND_RUNNER_EXTERNAL_LINKS,
  ERRAND_RUNNER_PREREQUISITE_EXTRAS,
  ERRAND_RUNNER_PRICING,
  ERRAND_RUNNER_SUPPLIES,
  ERRAND_RUNNER_TOOLS,
  errandRunnerToolsDisclaimer,
} from "./errand-runner-guide";
import {
  AI_AGENTS_EXTERNAL_LINKS,
  AI_AGENTS_PREREQUISITE_EXTRAS,
  AI_AGENTS_PRICING,
  AI_AGENTS_SUPPLIES,
  AI_AGENTS_TOOLS,
  aiAgentsToolsDisclaimer,
} from "./ai-agents-guide";
import {
  AI_PROMO_VIDEO_EXTERNAL_LINKS,
  AI_PROMO_VIDEO_PREREQUISITE_EXTRAS,
  AI_PROMO_VIDEO_PRICING,
  AI_PROMO_VIDEO_SUPPLIES,
  AI_PROMO_VIDEO_TOOLS,
  aiPromoVideoToolsDisclaimer,
} from "./ai-promo-video-guide";
import {
  AI_TIMING_EXTERNAL_LINKS,
  AI_TIMING_PREREQUISITE_EXTRAS,
  AI_TIMING_PRICING,
  AI_TIMING_SUPPLIES,
  AI_TIMING_TOOLS,
  aiTimingToolsDisclaimer,
} from "./ai-timing-guide";
import {
  TECH_HELPER_EXTERNAL_LINKS,
  TECH_HELPER_PREREQUISITE_EXTRAS,
  TECH_HELPER_PRICING,
  TECH_HELPER_SUPPLIES,
  TECH_HELPER_TOOLS,
  techHelperToolsDisclaimer,
} from "./tech-helper-guide";
import {
  PLANT_WATERING_EXTERNAL_LINKS,
  PLANT_WATERING_PREREQUISITE_EXTRAS,
  PLANT_WATERING_PRICING,
  PLANT_WATERING_SUPPLIES,
  PLANT_WATERING_TOOLS,
  plantWateringToolsDisclaimer,
} from "./plant-watering-guide";
import {
  YARD_HELP_EXTERNAL_LINKS,
  YARD_HELP_PREREQUISITE_EXTRAS,
  YARD_HELP_PRICING,
  YARD_HELP_SUPPLIES,
  YARD_HELP_TOOLS,
  yardHelpToolsDisclaimer,
} from "./yard-help-guide";
import {
  CLEANING_SERVICE_EXTERNAL_LINKS,
  CLEANING_SERVICE_PREREQUISITE_EXTRAS,
  CLEANING_SERVICE_PRICING,
  CLEANING_SERVICE_SUPPLIES,
  CLEANING_SERVICE_TOOLS,
  cleaningServiceToolsDisclaimer,
} from "./cleaning-service-guide";
import {
  HOMEWORK_ORGANIZER_EXTERNAL_LINKS,
  HOMEWORK_ORGANIZER_PREREQUISITE_EXTRAS,
  HOMEWORK_ORGANIZER_PRICING,
  HOMEWORK_ORGANIZER_SUPPLIES,
  HOMEWORK_ORGANIZER_TOOLS,
  homeworkOrganizerToolsDisclaimer,
} from "./homework-organizer-guide";
import {
  GROUP_SETUP_HELPER_EXTERNAL_LINKS,
  GROUP_SETUP_HELPER_PREREQUISITE_EXTRAS,
  GROUP_SETUP_HELPER_PRICING,
  GROUP_SETUP_HELPER_SUPPLIES,
  GROUP_SETUP_HELPER_TOOLS,
  groupSetupHelperToolsDisclaimer,
} from "./group-setup-helper-guide";
import {
  HOUSE_SITTER_EXTERNAL_LINKS,
  HOUSE_SITTER_PREREQUISITE_EXTRAS,
  HOUSE_SITTER_PRICING,
  HOUSE_SITTER_SUPPLIES,
  HOUSE_SITTER_TOOLS,
  houseSitterToolsDisclaimer,
} from "./house-sitter-guide";
import {
  BOOKKEEPING_EXTERNAL_LINKS,
  BOOKKEEPING_PREREQUISITE_EXTRAS,
  BOOKKEEPING_PRICING,
  BOOKKEEPING_SUPPLIES,
  BOOKKEEPING_TOOLS,
  bookkeepingToolsDisclaimer,
} from "./bookkeeping-guide";
import {
  CLOSET_CLEANOUT_LISTING_EXTERNAL_LINKS,
  CLOSET_CLEANOUT_LISTING_PREREQUISITE_EXTRAS,
  CLOSET_CLEANOUT_LISTING_PRICING,
  CLOSET_CLEANOUT_LISTING_SUPPLIES,
  CLOSET_CLEANOUT_LISTING_TOOLS,
  closetCleanoutListingToolsDisclaimer,
} from "./closet-cleanout-listing-guide";
import {
  NONPROFIT_SOCIAL_HELPER_EXTERNAL_LINKS,
  NONPROFIT_SOCIAL_HELPER_PREREQUISITE_EXTRAS,
  NONPROFIT_SOCIAL_HELPER_PRICING,
  NONPROFIT_SOCIAL_HELPER_SUPPLIES,
  NONPROFIT_SOCIAL_HELPER_TOOLS,
  nonprofitSocialHelperToolsDisclaimer,
} from "./nonprofit-social-helper-guide";
import {
  DIGITAL_PRODUCTS_EXTERNAL_LINKS,
  DIGITAL_PRODUCTS_PREREQUISITE_EXTRAS,
  DIGITAL_PRODUCTS_PRICING,
  DIGITAL_PRODUCTS_SUPPLIES,
  DIGITAL_PRODUCTS_TOOLS,
  digitalProductsToolsDisclaimer,
} from "./digital-products-guide";
import {
  BOOK_PUBLISHING_EXTERNAL_LINKS,
  BOOK_PUBLISHING_PREREQUISITE_EXTRAS,
  BOOK_PUBLISHING_PRICING,
  BOOK_PUBLISHING_SUPPLIES,
  BOOK_PUBLISHING_TOOLS,
  bookPublishingToolsDisclaimer,
} from "./book-publishing-guide";
import {
  START_GARDENING_CLUB_EXTERNAL_LINKS,
  START_GARDENING_CLUB_PREREQUISITE_EXTRAS,
  START_GARDENING_CLUB_PRICING,
  START_GARDENING_CLUB_SUPPLIES,
  START_GARDENING_CLUB_TOOLS,
  startGardeningClubToolsDisclaimer,
} from "./start-gardening-club-guide";
import {
  START_BOOK_CLUB_EXTERNAL_LINKS,
  START_BOOK_CLUB_PREREQUISITE_EXTRAS,
  START_BOOK_CLUB_PRICING,
  START_BOOK_CLUB_SUPPLIES,
  START_BOOK_CLUB_TOOLS,
  startBookClubToolsDisclaimer,
} from "./start-book-club-guide";
import {
  FORECLOSURE_PROPERTIES_EXTERNAL_LINKS,
  FORECLOSURE_PROPERTIES_PREREQUISITE_EXTRAS,
  FORECLOSURE_PROPERTIES_PRICING,
  FORECLOSURE_PROPERTIES_SUPPLIES,
  FORECLOSURE_PROPERTIES_TOOLS,
  foreclosurePropertiesToolsDisclaimer,
} from "./foreclosure-properties-guide";
import {
  KIDS_GAMES_AI_EXTERNAL_LINKS,
  KIDS_GAMES_AI_PREREQUISITE_EXTRAS,
  KIDS_GAMES_AI_PRICING,
  KIDS_GAMES_AI_SUPPLIES,
  KIDS_GAMES_AI_TOOLS,
  kidsGamesAiToolsDisclaimer,
} from "./kids-games-ai-guide";
import {
  AI_PROMPT_HELPER_EXTERNAL_LINKS,
  AI_PROMPT_HELPER_PREREQUISITE_EXTRAS,
  AI_PROMPT_HELPER_PRICING,
  AI_PROMPT_HELPER_SUPPLIES,
  AI_PROMPT_HELPER_TOOLS,
  aiPromptHelperToolsDisclaimer,
} from "./ai-prompt-helper-guide";
import {
  AI_PEERS_EXTERNAL_LINKS,
  AI_PEERS_PREREQUISITE_EXTRAS,
  AI_PEERS_PRICING,
  AI_PEERS_SUPPLIES,
  AI_PEERS_TOOLS,
  aiPeersToolsDisclaimer,
} from "./ai-peers-guide";
import {
  JUNIOR_GAMES_AI_EXTERNAL_LINKS,
  JUNIOR_GAMES_AI_PREREQUISITE_EXTRAS,
  JUNIOR_GAMES_AI_PRICING,
  JUNIOR_GAMES_AI_SUPPLIES,
  JUNIOR_GAMES_AI_TOOLS,
  juniorGamesAiToolsDisclaimer,
} from "./junior-games-ai-guide";
import {
  ETSY_STORE_EXTERNAL_LINKS,
  ETSY_STORE_PREREQUISITE_EXTRAS,
  ETSY_STORE_PRICING,
  ETSY_STORE_SUPPLIES,
  ETSY_STORE_TOOLS,
  etsyStoreToolsDisclaimer,
} from "./etsy-store-guide";
import {
  YOUTH_SPORTS_HELPER_EXTERNAL_LINKS,
  YOUTH_SPORTS_HELPER_PREREQUISITE_EXTRAS,
  YOUTH_SPORTS_HELPER_PRICING,
  YOUTH_SPORTS_HELPER_SUPPLIES,
  YOUTH_SPORTS_HELPER_TOOLS,
  youthSportsHelperToolsDisclaimer,
} from "./youth-sports-helper-guide";
import {
  JUNIOR_GIVE_BACK_TEACH_EXTERNAL_LINKS,
  JUNIOR_GIVE_BACK_TEACH_PREREQUISITE_EXTRAS,
  JUNIOR_GIVE_BACK_TEACH_PRICING,
  JUNIOR_GIVE_BACK_TEACH_SUPPLIES,
  JUNIOR_GIVE_BACK_TEACH_TOOLS,
  juniorGiveBackTeachToolsDisclaimer,
} from "./junior-give-back-teach-guide";
import {
  JUNIOR_SAVINGS_CEO_EXTERNAL_LINKS,
  JUNIOR_SAVINGS_CEO_PREREQUISITE_EXTRAS,
  JUNIOR_SAVINGS_CEO_PRICING,
  JUNIOR_SAVINGS_CEO_SUPPLIES,
  JUNIOR_SAVINGS_CEO_TOOLS,
  juniorSavingsCeoToolsDisclaimer,
} from "./junior-savings-ceo-guide";
import {
  KIDS_KINDNESS_SHARE_EXTERNAL_LINKS,
  KIDS_KINDNESS_SHARE_PREREQUISITE_EXTRAS,
  KIDS_KINDNESS_SHARE_PRICING,
  KIDS_KINDNESS_SHARE_SUPPLIES,
  KIDS_KINDNESS_SHARE_TOOLS,
  kidsKindnessShareToolsDisclaimer,
} from "./kids-kindness-share-guide";
import {
  KIDS_PIGGY_FIRST_GOAL_EXTERNAL_LINKS,
  KIDS_PIGGY_FIRST_GOAL_PREREQUISITE_EXTRAS,
  KIDS_PIGGY_FIRST_GOAL_PRICING,
  KIDS_PIGGY_FIRST_GOAL_SUPPLIES,
  KIDS_PIGGY_FIRST_GOAL_TOOLS,
  kidsPiggyFirstGoalToolsDisclaimer,
} from "./kids-piggy-first-goal-guide";
import {
  ESTATE_SALE_EXTERNAL_LINKS,
  ESTATE_SALE_PREREQUISITE_EXTRAS,
  ESTATE_SALE_PRICING,
  ESTATE_SALE_SUPPLIES,
  ESTATE_SALE_TOOLS,
  estateSaleToolsDisclaimer,
} from "./estate-sale-antique-resales-guide";
import {
  GENEALOGY_EXTERNAL_LINKS,
  GENEALOGY_PREREQUISITE_EXTRAS,
  GENEALOGY_PRICING,
  GENEALOGY_SUPPLIES,
  GENEALOGY_TOOLS,
  genealogyToolsDisclaimer,
} from "./genealogy-family-history-guide";
import {
  RIDESHARE_EXTERNAL_LINKS,
  RIDESHARE_PREREQUISITE_EXTRAS,
  RIDESHARE_PRICING,
  RIDESHARE_SUPPLIES,
  RIDESHARE_TOOLS,
  rideshareToolsDisclaimer,
} from "./rideshare-guide";
import {
  LOCAL_EVENT_CONTENT_EXTERNAL_LINKS,
  LOCAL_EVENT_CONTENT_PREREQUISITE_EXTRAS,
  LOCAL_EVENT_CONTENT_PRICING,
  LOCAL_EVENT_CONTENT_SUPPLIES,
  LOCAL_EVENT_CONTENT_TOOLS,
  localEventContentToolsDisclaimer,
} from "./local-event-content-creator-guide";
import {
  PROPERTY_MGMT_EXTERNAL_LINKS,
  PROPERTY_MGMT_PREREQUISITE_EXTRAS,
  PROPERTY_MGMT_PRICING,
  PROPERTY_MGMT_SUPPLIES,
  PROPERTY_MGMT_TOOLS,
  propertyMgmtToolsDisclaimer,
} from "./property-mgmt-guide";
import {
  JUNIOR_REINVEST_CEO_EXTERNAL_LINKS,
  JUNIOR_REINVEST_CEO_PREREQUISITE_EXTRAS,
  JUNIOR_REINVEST_CEO_PRICING,
  JUNIOR_REINVEST_CEO_SUPPLIES,
  JUNIOR_REINVEST_CEO_TOOLS,
  juniorReinvestCeoToolsDisclaimer,
} from "./junior-reinvest-ceo-guide";
import {
  KIDS_REINVEST_JAR_EXTERNAL_LINKS,
  KIDS_REINVEST_JAR_PREREQUISITE_EXTRAS,
  KIDS_REINVEST_JAR_PRICING,
  KIDS_REINVEST_JAR_SUPPLIES,
  KIDS_REINVEST_JAR_TOOLS,
  kidsReinvestJarToolsDisclaimer,
} from "./kids-reinvest-jar-guide";
import {
  AIRBNB_TURNOVER_CHECKER_EXTERNAL_LINKS,
  AIRBNB_TURNOVER_CHECKER_PREREQUISITE_EXTRAS,
  AIRBNB_TURNOVER_CHECKER_PRICING,
  AIRBNB_TURNOVER_CHECKER_SUPPLIES,
  AIRBNB_TURNOVER_CHECKER_TOOLS,
  airbnbTurnoverCheckerToolsDisclaimer,
} from "./airbnb-turnover-checker-guide";
import {
  STR_COHOST_EXTERNAL_LINKS,
  STR_COHOST_PREREQUISITE_EXTRAS,
  STR_COHOST_PRICING,
  STR_COHOST_SUPPLIES,
  STR_COHOST_TOOLS,
  strCohostToolsDisclaimer,
} from "./str-cohost-guide";
import {
  type GuideSupplyList,
  suppliesForGuide,
} from "./guide-supplies";
import {
  type GuideSuggestedPricing,
  suggestedPricingForGuide,
} from "./guide-suggested-pricing";
import {
  defaultSuppliesForGuide,
  defaultSuggestedPricingForGuide,
} from "./guide-prep-defaults";
import { hustleById } from "./side-hustle-catalog";
import { kidsGuideById } from "./kids-guides";

export type { GuideSupplyItem, GuideSupplyList } from "./guide-supplies";
export {
  formatSupplyLine,
  suppliesDisclaimer,
  suppliesForGuide,
} from "./guide-supplies";
export type { GuidePricingItem, GuideSuggestedPricing } from "./guide-suggested-pricing";
export {
  formatPricingLine,
  pricingDisclaimer,
  suggestedPricingForGuide,
} from "./guide-suggested-pricing";

export type GuidePrerequisite = {
  id: string;
  label: string;
  detail: string;
};

function isGyshFreeAccountPrerequisite(row: GuidePrerequisite): boolean {
  const blob = `${row.id}\n${row.label}\n${row.detail}`;
  return (
    row.id === "free-member" ||
    /GYSH Free account \(or higher\)/i.test(blob) ||
    /Guides are not public — sign in with at least a Free membership/i.test(blob)
  );
}

/** Drop the generic “GYSH Free account (or higher)” row from every guide kit. */
export function stripGyshFreeAccountPrerequisite(
  prerequisites: GuidePrerequisite[],
): GuidePrerequisite[] {
  return prerequisites.filter((row) => !isGyshFreeAccountPrerequisite(row));
}

export type GuideToolCost = {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  costNote: string;
  /** Official product page when the guide names this tool. */
  url?: string;
  /** Other acceptable options (same job). */
  alternatives?: string;
  optional?: boolean;
  /**
   * When false, skip “Free plan available” / “Paid tool” (phone, vacuum, hand tools, etc.).
   * Default true for apps/SaaS like Canva and Hedra.
   */
  planLabelApplicable?: boolean;
};

export type GuideExternalLink = {
  label: string;
  url: string;
  note?: string;
};

export type GuideAuthoredStep = { title: string; desc: string };

export type GuideKit = {
  prerequisites: GuidePrerequisite[];
  tools: GuideToolCost[];
  /** Physical / consumable supplies with estimated costs. */
  supplies?: GuideSupplyList;
  /** Example prices to charge customers. */
  suggestedPricing?: GuideSuggestedPricing;
  /** When set, replaces generic catalog / authored steps for this guide. */
  steps?: GuideAuthoredStep[];
  externalLinks?: GuideExternalLink[];
};

const P = {
  parent: (extra = "Parent or guardian stays nearby for accounts and publishing."): GuidePrerequisite => ({
    id: "parent",
    label: "Parent / guardian nearby",
    detail: extra,
  }),
  account: (label: string, detail: string): GuidePrerequisite => ({
    id: "account",
    label,
    detail,
  }),
  computer: {
    id: "computer",
    label: "Computer or tablet with internet",
    detail: "Phone-only is possible for some steps; a laptop/desktop is easier for building.",
  } satisfies GuidePrerequisite,
  time: (hours: string): GuidePrerequisite => ({
    id: "time",
    label: "Focused time block",
    detail: hours,
  }),
};

/** Shared vendor catalog — prefer these IDs in GUIDE_TOOL_MAP. */
export const TOOL_CATALOG: Record<string, GuideToolCost> = {
  phone_computer: {
    id: "phone_computer",
    name: "Phone or computer",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Use what you already own · $0 extra to start",
  },
  basic_supplies: {
    id: "basic_supplies",
    name: "Basic job supplies",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Often $0–$25 from home · buy only what the first job needs",
  },
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT",
    freePlanAvailable: true,
    costNote: "Free plan available · Plus ~$20/mo (verify on OpenAI)",
    url: "https://chatgpt.com/",
    alternatives: "Google Gemini (https://gemini.google.com/) works the same for brainstorming and GAME.md drafts",
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    freePlanAvailable: true,
    costNote: "Free plan with a Google account · paid Gemini Advanced optional",
    url: "https://gemini.google.com/",
    alternatives: "ChatGPT (https://chatgpt.com/)",
    optional: true,
  },
  antigravity: {
    id: "antigravity",
    name: "Google Antigravity",
    freePlanAvailable: true,
    costNote: "Download from Google · available at no charge for individuals (verify on site)",
    url: "https://antigravity.google/",
    alternatives: "Cursor (https://cursor.com/) if you already use it; Scratch is easier for younger kids",
  },
  cloudflare_pages: {
    id: "cloudflare_pages",
    name: "Cloudflare Pages",
    freePlanAvailable: true,
    costNote: "Free tier for static sites · custom domains + Workers add-ons (verify on Cloudflare)",
    url: "https://pages.cloudflare.com/",
    alternatives: "Do not use WordPress — keep the stack on Cloudflare Pages",
  },
  supabase: {
    id: "supabase",
    name: "Supabase",
    freePlanAvailable: true,
    costNote: "Free tier for auth, DB, and storage · paid as you scale (verify on Supabase)",
    url: "https://supabase.com/",
    optional: true,
  },
  resend: {
    id: "resend",
    name: "Resend",
    freePlanAvailable: true,
    costNote: "Free tier for transactional email · paid as volume grows (verify on Resend)",
    url: "https://resend.com/",
    alternatives: "Use Resend for site/contact email — not a WordPress plugin mailer",
  },
  cursor: {
    id: "cursor",
    name: "Cursor",
    freePlanAvailable: true,
    costNote: "Free Hobby tier available · Pro paid (verify on Cursor)",
    url: "https://cursor.com/",
    alternatives: "Google Antigravity (https://antigravity.google/)",
    optional: true,
  },
  scratch: {
    id: "scratch",
    name: "Scratch (MIT)",
    freePlanAvailable: true,
    costNote: "100% free · parent creates the account",
    url: "https://scratch.mit.edu/",
    alternatives: "For teens ready to code: Antigravity or Cursor instead",
  },
  canva: {
    id: "canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote:
      "Free plan available — sign in at the link, or continue with an account you already have · Pro ~$15–18/mo or ~$120–144/yr (verify on Canva)",
    url: "https://www.canva.com/",
  },
  capcut: {
    id: "capcut",
    name: "CapCut",
    freePlanAvailable: true,
    costNote: "Free plan available · Pro roughly ~$8–10/mo (verify in CapCut / app store)",
    url: "https://www.capcut.com/",
  },
  hedra: {
    id: "hedra",
    name: "Hedra",
    freePlanAvailable: true,
    costNote: "Free credits / trial often available · paid plans roughly ~$15–75/mo (verify on Hedra)",
    url: "https://www.hedra.com/",
  },
  google_docs: {
    id: "google_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote:
      "Free with a Google account — sign in at the link, or continue with an account you already have, then open Docs",
    /** Sign-in first; Google continues into Docs (or Drive if already signed in). */
    url: "https://accounts.google.com/ServiceLogin?continue=https%3A%2F%2Fdocs.google.com%2F",
    alternatives: "Already signed in? Go straight to https://docs.google.com/",
  },
  airdna: {
    id: "airdna",
    name: "AirDNA",
    freePlanAvailable: true,
    costNote: "Free market explore tier · Research/Host plans are paid (verify pricing)",
    url: "https://www.airdna.co/",
  },
  airbnb_host: {
    id: "airbnb_host",
    name: "Airbnb Host",
    freePlanAvailable: true,
    costNote: "Free to list · host service fees on bookings",
    url: "https://www.airbnb.com/host/homes",
  },
  pricelabs: {
    id: "pricelabs",
    name: "PriceLabs",
    freePlanAvailable: false,
    costNote: "Paid dynamic pricing · optional until you have bookings",
    url: "https://hello.pricelabs.co/",
    optional: true,
  },
  wheelhouse: {
    id: "wheelhouse",
    name: "Wheelhouse",
    freePlanAvailable: false,
    costNote: "Paid dynamic pricing alternative to PriceLabs",
    url: "https://usewheelhouse.com/",
    optional: true,
  },
  turnoverbnb: {
    id: "turnoverbnb",
    name: "Turno (formerly TurnoverBnB)",
    freePlanAvailable: true,
    costNote: "Free to start coordinating cleaners · fees may apply for some features",
    url: "https://turno.com/",
    optional: true,
  },
  printify: {
    id: "printify",
    name: "Printify",
    freePlanAvailable: true,
    costNote: "Free to connect · you pay per order when customers buy",
    url: "https://printify.com/",
    alternatives: "Printful (https://www.printful.com/)",
  },
  etsy: {
    id: "etsy",
    name: "Etsy",
    freePlanAvailable: true,
    costNote: "Listing fees + transaction fees on sales (verify on Etsy)",
    url: "https://www.etsy.com/sell",
  },
  shopify: {
    id: "shopify",
    name: "Shopify",
    freePlanAvailable: true,
    costNote: "Trial then ~$29+/mo (verify on Shopify)",
    url: "https://www.shopify.com/",
    optional: true,
  },
  kdp: {
    id: "kdp",
    name: "Amazon KDP",
    freePlanAvailable: true,
    costNote: "Free to publish · print costs deducted from royalties",
    url: "https://kdp.amazon.com/",
  },
  uber_lyft: {
    id: "uber_lyft",
    name: "Uber / Lyft driver apps",
    freePlanAvailable: true,
    costNote: "Free apps · vehicle, insurance, and gas are your costs",
    url: "https://www.uber.com/us/en/drive/",
    alternatives: "Lyft (https://www.lyft.com/driver)",
  },
  doordash: {
    id: "doordash",
    name: "DoorDash Dasher App",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Driver app for offers, navigation, and earnings · vehicle/bike + bag and gas are your costs",
    url: "https://www.doordash.com/dasher/signup/",
    alternatives: "Receive offers, navigate pickups/deliveries, view earnings",
  },
  uber_eats: {
    id: "uber_eats",
    name: "Uber Driver / Uber Eats",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Driver app for offers and upfront trip info · vehicle/bike + bag and gas are your costs",
    url: "https://www.uber.com/us/en/deliver/",
    alternatives: "Upfront earnings, pickup/dropoff, time and distance estimates",
  },
  maps_nav: {
    id: "maps_nav",
    name: "Google Maps / Apple Maps / Waze",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Navigation for pickups and dropoffs",
    url: "https://maps.google.com/",
    alternatives: "Apple Maps, Waze",
  },
  mileage_tracker: {
    id: "mileage_tracker",
    name: "Mileage & expense tracker",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Log miles and expenses from Day 1 · Stride, Everlance, MileIQ, Gridwise, or a spreadsheet",
    url: "https://www.irs.gov/tax-professionals/standard-mileage-rates",
    alternatives: "Stride, Everlance, MileIQ, Gridwise, or Google Sheets",
  },
  handyman_kit: {
    id: "handyman_kit",
    name: "Basic hand tools",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Start with tools you own · starter kit often ~$25–100 if buying",
  },
  zoom: {
    id: "zoom",
    name: "Zoom or Google Meet",
    freePlanAvailable: true,
    costNote: "Google Meet free · Zoom Basic free (time limits on free meetings)",
    url: "https://meet.google.com/",
    alternatives: "Zoom (https://zoom.us/)",
  },
  meetup: {
    id: "meetup",
    name: "Meetup",
    freePlanAvailable: true,
    costNote:
      "Meetup Starter free for eligible first-time organizers (limits apply) · paid organizer plans available (verify on Meetup)",
    url: "https://www.meetup.com/",
    alternatives: "Nextdoor events, Facebook Groups, or a library bulletin board",
  },
  itch: {
    id: "itch",
    name: "itch.io",
    freePlanAvailable: true,
    costNote: "Free to publish demos · optional revenue share if you sell",
    url: "https://itch.io/",
    optional: true,
  },
  meta_business: {
    id: "meta_business",
    name: "Meta Business Suite",
    freePlanAvailable: true,
    costNote: "Free to post · ad spend optional",
    url: "https://business.facebook.com/",
  },
  midjourney: {
    id: "midjourney",
    name: "Midjourney",
    freePlanAvailable: false,
    costNote: "Paid · or use ChatGPT / Canva Magic images instead",
    url: "https://www.midjourney.com/",
    optional: true,
  },
  printer: {
    id: "printer",
    name: "Printer or print shop",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Library / print shop · home printer optional",
    optional: true,
  },
};

const t = (...ids: (keyof typeof TOOL_CATALOG)[]): GuideToolCost[] =>
  ids.map((id) => TOOL_CATALOG[id]);

const DEFAULT_PREREQS: GuidePrerequisite[] = [P.computer];

const DEFAULT_TOOLS = t("phone_computer", "basic_supplies");

/** Precise AI game steps — kids path prefers Scratch; Antigravity is optional. */
export const CREATE_GAMES_KIDS_STEPS: GuideAuthoredStep[] = [
  {
    title: "Sit with a parent and open a chat",
    desc: "Parent opens ChatGPT (https://chatgpt.com/) or Gemini (https://gemini.google.com/). Kid does not create the AI account. Tell the chat: “Help us design a tiny game for ages 6–12. Keep it to one screen and 3 levels.”",
  },
  {
    title: "Layout the idea in the chat (copy answers into Docs)",
    desc: "Ask for: (1) game title, (2) hero name (made-up, no real names), (3) one goal, (4) three levels Easy→Hard, (5) how you win or lose. Parent pastes the answers into Google Docs (Tools tab — sign in with Google, or use an account you already have) and saves as GAME-IDEA.",
  },
  {
    title: "Choose the build path (Scratch is easiest)",
    desc: "Recommended for Kids: Scratch (https://scratch.mit.edu/) — free, visual blocks, no install. Optional advanced path: Google Antigravity (https://antigravity.google/) if a parent is ready to run an agentic IDE. Do not skip Scratch unless the parent already knows Antigravity/Cursor.",
  },
  {
    title: "If using Scratch — create the project",
    desc: "Parent creates a Scratch account, starts a new project, and follows Scratch’s Getting Started tips (https://scratch.mit.edu/ideas). Build only: one backdrop, one sprite, and three “levels” as different costumes or messages. No personal info in the project title.",
  },
  {
    title: "If using Antigravity — ask ChatGPT for GAME.md first",
    desc: "In ChatGPT/Gemini paste: “Write a markdown file named GAME.md for Google Antigravity. Include: project goal, folder layout, v1 features only (one HTML canvas mini-game), acceptance tests, and ‘do not add multiplayer.’ Use our GAME-IDEA notes: [paste Docs].” Save the reply as GAME.md on the computer.",
  },
  {
    title: "Run Antigravity with GAME.md (parent only)",
    desc: "Download Antigravity from https://antigravity.google/download . Parent opens a new project folder, drops GAME.md in the root, and asks the agent: “Implement v1 exactly as GAME.md — stop when acceptance tests pass.” Kid playtests; parent reviews every file change.",
  },
  {
    title: "Playtest and share safely",
    desc: "Play at family game night or a school fair with a parent present. Optional: export Scratch or zip the Antigravity build — never publish with real names, school, address, or photos. Track any tips in the Piggy Bank.",
  },
];

export const CREATE_GAMES_JUNIOR_STEPS: GuideAuthoredStep[] = [
  {
    title: "Scope one tiny game in ChatGPT or Gemini",
    desc: "Open https://chatgpt.com/ or https://gemini.google.com/ (guardian-approved). Prompt: “Help me scope a one-level browser game. Ask me questions until we have title, win condition, art style, and a 60-minute build plan.” Save the Q&A in Google Docs (Tools tab — sign in with Google, or use an account you already have).",
  },
  {
    title: "Generate GAME.md for Antigravity (or Cursor)",
    desc: "Prompt: “Write GAME.md for Google Antigravity (https://antigravity.google/) — or Cursor (https://cursor.com/) if I say so. Include: tech = single HTML+JS file or Vite+React, folder layout, v1 features only, acceptance checklist, no accounts/payments.” Download/save GAME.md.",
  },
  {
    title: "Install the builder and drop in GAME.md",
    desc: "Preferred: Antigravity — https://antigravity.google/download . Alternative: Cursor — https://cursor.com/ . Create an empty project folder, add GAME.md, then instruct the agent: “Build v1 per GAME.md; do not expand scope.”",
  },
  {
    title: "Art & dialogue drafts (optional tools)",
    desc: "Concept art: Canva (https://www.canva.com/) or ChatGPT images. Keep assets original — no trademarked characters. Paste short dialogue from the chat, then rewrite in your voice.",
  },
  {
    title: "Playtest, fix one bug, ship a demo",
    desc: "Friends or classmates try it. Fix one crash and one fun upgrade. Optional publish: itch.io (https://itch.io/) only with guardian approval — free demo, no personal data in the page.",
  },
];

const GUIDE_KITS: Record<string, GuideKit> = {
  airbnb: {
    prerequisites: [...AIRBNB_HOSTING_PREREQUISITE_EXTRAS],
    tools: [...AIRBNB_HOSTING_TOOLS, ...t("phone_computer")],
    externalLinks: AIRBNB_HOSTING_EXTERNAL_LINKS,
    supplies: AIRBNB_HOSTING_SUPPLIES,
    suggestedPricing: AIRBNB_HOSTING_PRICING,
  },
  "create-games-kids": {
    prerequisites: [
      P.parent("Parent creates every AI / Scratch / Antigravity account. Kid never shares real name, school, or address in chats."),
      P.computer,
      P.time("About 60–90 minutes for v1 on Scratch; longer if using Antigravity."),
    ],
    tools: t("chatgpt", "gemini", "scratch", "antigravity", "google_docs", "canva"),
    steps: CREATE_GAMES_KIDS_STEPS,
    externalLinks: [
      { label: "ChatGPT", url: "https://chatgpt.com/" },
      { label: "Google Gemini", url: "https://gemini.google.com/" },
      { label: "Scratch", url: "https://scratch.mit.edu/", note: "Easiest kids path" },
      { label: "Google Antigravity", url: "https://antigravity.google/" },
      { label: "Antigravity download", url: "https://antigravity.google/download" },
    ],
  },
  "create-games-junior": {
    prerequisites: [
      P.parent("Guardian approves AI accounts and any itch.io publish."),
      P.computer,
      P.time("One focused afternoon for a one-level prototype."),
    ],
    tools: t("chatgpt", "gemini", "antigravity", "cursor", "canva", "google_docs", "itch"),
    steps: CREATE_GAMES_JUNIOR_STEPS,
    externalLinks: [
      { label: "ChatGPT", url: "https://chatgpt.com/" },
      { label: "Gemini", url: "https://gemini.google.com/" },
      { label: "Antigravity", url: "https://antigravity.google/" },
      { label: "Cursor", url: "https://cursor.com/" },
      { label: "itch.io", url: "https://itch.io/" },
    ],
  },
  "kids-games-ai": {
    prerequisites: [ P.parent(), ...KIDS_GAMES_AI_PREREQUISITE_EXTRAS],
    tools: [...KIDS_GAMES_AI_TOOLS, ...t("phone_computer")],
    externalLinks: KIDS_GAMES_AI_EXTERNAL_LINKS,
    supplies: KIDS_GAMES_AI_SUPPLIES,
    suggestedPricing: KIDS_GAMES_AI_PRICING,
  },
  "foreclosure-properties": {
    prerequisites: [ ...FORECLOSURE_PROPERTIES_PREREQUISITE_EXTRAS],
    tools: [...FORECLOSURE_PROPERTIES_TOOLS, ...t("phone_computer")],
    externalLinks: FORECLOSURE_PROPERTIES_EXTERNAL_LINKS,
    supplies: FORECLOSURE_PROPERTIES_SUPPLIES,
    suggestedPricing: FORECLOSURE_PROPERTIES_PRICING,
  },
  "junior-games-ai": {
    prerequisites: [
      P.parent("Guardian approves AI/build tools and any publishing."),
      ...JUNIOR_GAMES_AI_PREREQUISITE_EXTRAS,
    ],
    tools: [...JUNIOR_GAMES_AI_TOOLS, ...t("phone_computer")],
    externalLinks: JUNIOR_GAMES_AI_EXTERNAL_LINKS,
    supplies: JUNIOR_GAMES_AI_SUPPLIES,
    suggestedPricing: JUNIOR_GAMES_AI_PRICING,
  },
  pod: {
    prerequisites: [ ...POD_PREREQUISITE_EXTRAS],
    tools: [...POD_TOOLS, ...t("phone_computer")],
    externalLinks: POD_EXTERNAL_LINKS,
    supplies: POD_SUPPLIES,
    suggestedPricing: POD_PRICING,
  },
  dropshipping: {
    prerequisites: [ ...DROPSHIPPING_PREREQUISITE_EXTRAS],
    tools: [...DROPSHIPPING_TOOLS, ...t("phone_computer")],
    externalLinks: DROPSHIPPING_EXTERNAL_LINKS,
    supplies: DROPSHIPPING_SUPPLIES,
    suggestedPricing: DROPSHIPPING_PRICING,
  },
  "digital-products": {
    prerequisites: [ ...DIGITAL_PRODUCTS_PREREQUISITE_EXTRAS],
    tools: [...DIGITAL_PRODUCTS_TOOLS, ...t("phone_computer")],
    externalLinks: DIGITAL_PRODUCTS_EXTERNAL_LINKS,
    supplies: DIGITAL_PRODUCTS_SUPPLIES,
    suggestedPricing: DIGITAL_PRODUCTS_PRICING,
  },
  "etsy-store": {
    prerequisites: [ ...ETSY_STORE_PREREQUISITE_EXTRAS],
    tools: [...ETSY_STORE_TOOLS, ...t("phone_computer")],
    externalLinks: ETSY_STORE_EXTERNAL_LINKS,
    supplies: ETSY_STORE_SUPPLIES,
    suggestedPricing: ETSY_STORE_PRICING,
  },
  babysitting: {
    prerequisites: [ ...BABYSITTING_PREREQUISITE_EXTRAS],
    tools: [...BABYSITTING_TOOLS, ...t("phone_computer")],
    externalLinks: BABYSITTING_EXTERNAL_LINKS,
    supplies: BABYSITTING_SUPPLIES,
    suggestedPricing: BABYSITTING_PRICING,
  },
  "errand-runner": {
    prerequisites: [ ...ERRAND_RUNNER_PREREQUISITE_EXTRAS],
    tools: [...ERRAND_RUNNER_TOOLS, ...t("phone_computer")],
    externalLinks: ERRAND_RUNNER_EXTERNAL_LINKS,
    supplies: ERRAND_RUNNER_SUPPLIES,
    suggestedPricing: ERRAND_RUNNER_PRICING,
  },
  "tech-helper": {
    prerequisites: [
      P.parent("Guardian approves clients, meeting places, and any remote sessions."),
      ...TECH_HELPER_PREREQUISITE_EXTRAS,
    ],
    tools: [...TECH_HELPER_TOOLS, ...t("phone_computer")],
    externalLinks: TECH_HELPER_EXTERNAL_LINKS,
    supplies: TECH_HELPER_SUPPLIES,
    suggestedPricing: TECH_HELPER_PRICING,
  },
  "plant-watering": {
    prerequisites: [
      P.parent("Guardian approves jobs, transportation, communication, and safe-access arrangements."),
      ...PLANT_WATERING_PREREQUISITE_EXTRAS,
    ],
    tools: [...PLANT_WATERING_TOOLS, ...t("phone_computer")],
    externalLinks: PLANT_WATERING_EXTERNAL_LINKS,
    supplies: PLANT_WATERING_SUPPLIES,
    suggestedPricing: PLANT_WATERING_PRICING,
  },
  "yard-help": {
    prerequisites: [
      P.parent("Guardian approves jobs, customers, travel, tools, and work conditions."),
      ...YARD_HELP_PREREQUISITE_EXTRAS,
    ],
    tools: [...YARD_HELP_TOOLS, ...t("phone_computer")],
    externalLinks: YARD_HELP_EXTERNAL_LINKS,
    supplies: YARD_HELP_SUPPLIES,
    suggestedPricing: YARD_HELP_PRICING,
  },
  "homework-organizer": {
    prerequisites: [ ...HOMEWORK_ORGANIZER_PREREQUISITE_EXTRAS],
    tools: [...HOMEWORK_ORGANIZER_TOOLS, ...t("phone_computer")],
    externalLinks: HOMEWORK_ORGANIZER_EXTERNAL_LINKS,
    supplies: HOMEWORK_ORGANIZER_SUPPLIES,
    suggestedPricing: HOMEWORK_ORGANIZER_PRICING,
  },
  "group-setup-helper": {
    prerequisites: [ ...GROUP_SETUP_HELPER_PREREQUISITE_EXTRAS],
    tools: [...GROUP_SETUP_HELPER_TOOLS, ...t("phone_computer")],
    externalLinks: GROUP_SETUP_HELPER_EXTERNAL_LINKS,
    supplies: GROUP_SETUP_HELPER_SUPPLIES,
    suggestedPricing: GROUP_SETUP_HELPER_PRICING,
  },
  "house-sitter": {
    prerequisites: [ ...HOUSE_SITTER_PREREQUISITE_EXTRAS],
    tools: [...HOUSE_SITTER_TOOLS, ...t("phone_computer")],
    externalLinks: HOUSE_SITTER_EXTERNAL_LINKS,
    supplies: HOUSE_SITTER_SUPPLIES,
    suggestedPricing: HOUSE_SITTER_PRICING,
  },
  bookkeeping: {
    prerequisites: [ ...BOOKKEEPING_PREREQUISITE_EXTRAS],
    tools: [...BOOKKEEPING_TOOLS, ...t("phone_computer")],
    externalLinks: BOOKKEEPING_EXTERNAL_LINKS,
    supplies: BOOKKEEPING_SUPPLIES,
    suggestedPricing: BOOKKEEPING_PRICING,
  },
  "closet-cleanout-listing": {
    prerequisites: [ ...CLOSET_CLEANOUT_LISTING_PREREQUISITE_EXTRAS],
    tools: [...CLOSET_CLEANOUT_LISTING_TOOLS, ...t("phone_computer")],
    externalLinks: CLOSET_CLEANOUT_LISTING_EXTERNAL_LINKS,
    supplies: CLOSET_CLEANOUT_LISTING_SUPPLIES,
    suggestedPricing: CLOSET_CLEANOUT_LISTING_PRICING,
  },
  "nonprofit-social-helper": {
    prerequisites: [ ...NONPROFIT_SOCIAL_HELPER_PREREQUISITE_EXTRAS],
    tools: [...NONPROFIT_SOCIAL_HELPER_TOOLS, ...t("phone_computer")],
    externalLinks: NONPROFIT_SOCIAL_HELPER_EXTERNAL_LINKS,
    supplies: NONPROFIT_SOCIAL_HELPER_SUPPLIES,
    suggestedPricing: NONPROFIT_SOCIAL_HELPER_PRICING,
  },
  "start-gardening-club": {
    prerequisites: [ ...START_GARDENING_CLUB_PREREQUISITE_EXTRAS],
    tools: [...START_GARDENING_CLUB_TOOLS, ...t("phone_computer")],
    externalLinks: START_GARDENING_CLUB_EXTERNAL_LINKS,
    supplies: START_GARDENING_CLUB_SUPPLIES,
    suggestedPricing: START_GARDENING_CLUB_PRICING,
  },
  "start-book-club": {
    prerequisites: [ ...START_BOOK_CLUB_PREREQUISITE_EXTRAS],
    tools: [...START_BOOK_CLUB_TOOLS, ...t("phone_computer")],
    externalLinks: START_BOOK_CLUB_EXTERNAL_LINKS,
    supplies: START_BOOK_CLUB_SUPPLIES,
    suggestedPricing: START_BOOK_CLUB_PRICING,
  },
  affiliate: {
    prerequisites: [ ...AFFILIATE_PREREQUISITE_EXTRAS],
    tools: [...AFFILIATE_TOOLS, ...t("phone_computer")],
    externalLinks: AFFILIATE_EXTERNAL_LINKS,
    supplies: AFFILIATE_SUPPLIES,
    suggestedPricing: AFFILIATE_PRICING,
  },
  amazon: {
    prerequisites: [ P.account("Startup capital", "FBA needs inventory budget — not a $0 start.")],
    tools: t("google_docs", "canva"),
  },
  social: {
    prerequisites: [
      P.parent("Guardian approves every platform, brand deal, and posting. Age-appropriate content only; an adult controls contracts, payment, and account access."),
      ...SOCIAL_INFLUENCER_PREREQUISITE_EXTRAS,
    ],
    tools: [...SOCIAL_INFLUENCER_TOOLS, ...t("phone_computer")],
    externalLinks: SOCIAL_INFLUENCER_EXTERNAL_LINKS,
    supplies: SOCIAL_INFLUENCER_SUPPLIES,
    suggestedPricing: SOCIAL_INFLUENCER_PRICING,
  },
  "web-leads": {
    prerequisites: [ P.computer],
    tools: t("chatgpt", "antigravity", "cloudflare_pages", "supabase", "resend", "canva", "google_docs"),
  },
  "ai-assets": {
    prerequisites: [ P.computer, P.time("Pro membership required for this AI guide.")],
    tools: t("chatgpt", "gemini", "canva", "midjourney", "antigravity"),
  },
  "ai-agents": {
    prerequisites: [ ...AI_AGENTS_PREREQUISITE_EXTRAS],
    tools: [...AI_AGENTS_TOOLS, ...t("phone_computer")],
    externalLinks: AI_AGENTS_EXTERNAL_LINKS,
    supplies: AI_AGENTS_SUPPLIES,
    suggestedPricing: AI_AGENTS_PRICING,
  },
  "ai-timing": {
    prerequisites: [ ...AI_TIMING_PREREQUISITE_EXTRAS],
    tools: [...AI_TIMING_TOOLS, ...t("phone_computer")],
    externalLinks: AI_TIMING_EXTERNAL_LINKS,
    supplies: AI_TIMING_SUPPLIES,
    suggestedPricing: AI_TIMING_PRICING,
  },
  "ai-promo-video": {
    prerequisites: [ ...AI_PROMO_VIDEO_PREREQUISITE_EXTRAS],
    tools: [...AI_PROMO_VIDEO_TOOLS, ...t("phone_computer")],
    externalLinks: AI_PROMO_VIDEO_EXTERNAL_LINKS,
    supplies: AI_PROMO_VIDEO_SUPPLIES,
    suggestedPricing: AI_PROMO_VIDEO_PRICING,
  },
  "ai-social-helper": {
    prerequisites: [ P.computer],
    tools: t("chatgpt", "gemini", "canva", "meta_business"),
  },
  "ai-prompt-helper": {
    prerequisites: [ ...AI_PROMPT_HELPER_PREREQUISITE_EXTRAS],
    tools: [...AI_PROMPT_HELPER_TOOLS, ...t("phone_computer")],
    externalLinks: AI_PROMPT_HELPER_EXTERNAL_LINKS,
    supplies: AI_PROMPT_HELPER_SUPPLIES,
    suggestedPricing: AI_PROMPT_HELPER_PRICING,
  },
  "ai-peers": {
    prerequisites: [ ...AI_PEERS_PREREQUISITE_EXTRAS],
    tools: [...AI_PEERS_TOOLS, ...t("phone_computer")],
    externalLinks: AI_PEERS_EXTERNAL_LINKS,
    supplies: AI_PEERS_SUPPLIES,
    suggestedPricing: AI_PEERS_PRICING,
  },
  "local-business-ai-setup": {
    prerequisites: [ P.computer],
    tools: t("chatgpt", "gemini", "google_docs", "canva"),
  },
  "property-mgmt": {
    prerequisites: [ ...PROPERTY_MGMT_PREREQUISITE_EXTRAS],
    tools: [...PROPERTY_MGMT_TOOLS, ...t("phone_computer")],
    externalLinks: PROPERTY_MGMT_EXTERNAL_LINKS,
    supplies: PROPERTY_MGMT_SUPPLIES,
    suggestedPricing: PROPERTY_MGMT_PRICING,
  },
  handyman: {
    prerequisites: [ ...HANDYMAN_PREREQUISITE_EXTRAS],
    tools: [...HANDYMAN_TOOLS, ...t("phone_computer")],
    externalLinks: HANDYMAN_EXTERNAL_LINKS,
    supplies: HANDYMAN_SUPPLIES,
    suggestedPricing: HANDYMAN_PRICING,
  },
  "cleaning-service": {
    prerequisites: [ ...CLEANING_SERVICE_PREREQUISITE_EXTRAS],
    tools: [...CLEANING_SERVICE_TOOLS, ...t("phone_computer")],
    externalLinks: CLEANING_SERVICE_EXTERNAL_LINKS,
    supplies: CLEANING_SERVICE_SUPPLIES,
    suggestedPricing: CLEANING_SERVICE_PRICING,
  },
  "handyman-light": {
    prerequisites: [...LIGHT_HANDYMAN_PREREQUISITE_EXTRAS],
    tools: [...LIGHT_HANDYMAN_TOOLS, ...t("phone_computer")],
    externalLinks: LIGHT_HANDYMAN_EXTERNAL_LINKS,
    supplies: LIGHT_HANDYMAN_SUPPLIES,
    suggestedPricing: LIGHT_HANDYMAN_PRICING,
  },
  rideshare: {
    prerequisites: [ ...RIDESHARE_PREREQUISITE_EXTRAS],
    tools: [...RIDESHARE_TOOLS, ...t("phone_computer")],
    externalLinks: RIDESHARE_EXTERNAL_LINKS,
    supplies: RIDESHARE_SUPPLIES,
    suggestedPricing: RIDESHARE_PRICING,
  },
  "food-delivery": {
    prerequisites: [ ...FOOD_DELIVERY_PREREQUISITE_EXTRAS],
    tools: [
      ...t("doordash", "uber_eats", "maps_nav", "mileage_tracker", "phone_computer"),
      ...FOOD_DELIVERY_SURVIVAL_TOOLS,
    ],
    externalLinks: FOOD_DELIVERY_EXTERNAL_LINKS,
    supplies: FOOD_DELIVERY_SUPPLIES,
    suggestedPricing: FOOD_DELIVERY_PRICING,
  },
  "estate-sale-listing-helper": {
    prerequisites: [ ...ESTATE_SALE_PREREQUISITE_EXTRAS],
    tools: [...ESTATE_SALE_TOOLS, ...t("canva", "phone_computer")],
    externalLinks: ESTATE_SALE_EXTERNAL_LINKS,
    supplies: ESTATE_SALE_SUPPLIES,
    suggestedPricing: ESTATE_SALE_PRICING,
  },
  "kids-party-game-host": {
    prerequisites: [ ...KIDS_PARTY_GAME_HOST_PREREQUISITE_EXTRAS],
    tools: [...KIDS_PARTY_GAME_HOST_TOOLS, ...t("canva", "phone_computer")],
    externalLinks: KIDS_PARTY_GAME_HOST_EXTERNAL_LINKS,
    supplies: KIDS_PARTY_GAME_HOST_SUPPLIES,
    suggestedPricing: KIDS_PARTY_GAME_HOST_PRICING,
  },
  "lead-followup-assistant": {
    prerequisites: [ ...LEAD_FOLLOWUP_PREREQUISITE_EXTRAS],
    tools: [...LEAD_FOLLOWUP_TOOLS, ...t("phone_computer")],
    externalLinks: LEAD_FOLLOWUP_EXTERNAL_LINKS,
    supplies: LEAD_FOLLOWUP_SUPPLIES,
    suggestedPricing: LEAD_FOLLOWUP_PRICING,
  },
  "appointment-setter": {
    prerequisites: [ ...APPOINTMENT_SETTER_PREREQUISITE_EXTRAS],
    tools: [...APPOINTMENT_SETTER_TOOLS, ...t("phone_computer")],
    externalLinks: APPOINTMENT_SETTER_EXTERNAL_LINKS,
    supplies: APPOINTMENT_SETTER_SUPPLIES,
    suggestedPricing: APPOINTMENT_SETTER_PRICING,
  },
  "online-research-assistant": {
    prerequisites: [ ...ONLINE_RESEARCH_ASSISTANT_PREREQUISITE_EXTRAS],
    tools: [...ONLINE_RESEARCH_ASSISTANT_TOOLS, ...t("phone_computer")],
    externalLinks: ONLINE_RESEARCH_ASSISTANT_EXTERNAL_LINKS,
    supplies: ONLINE_RESEARCH_ASSISTANT_SUPPLIES,
    suggestedPricing: ONLINE_RESEARCH_ASSISTANT_PRICING,
  },
  "mothers-helper": {
    prerequisites: [ ...MOTHERS_HELPER_PREREQUISITE_EXTRAS],
    tools: [...MOTHERS_HELPER_TOOLS, ...t("phone_computer")],
    externalLinks: MOTHERS_HELPER_EXTERNAL_LINKS,
    supplies: MOTHERS_HELPER_SUPPLIES,
    suggestedPricing: MOTHERS_HELPER_PRICING,
  },
  crafts: {
    prerequisites: [ ...CRAFTS_PREREQUISITE_EXTRAS],
    tools: [...CRAFTS_TOOLS, ...t("phone_computer")],
    externalLinks: CRAFTS_EXTERNAL_LINKS,
    supplies: CRAFTS_SUPPLIES,
    suggestedPricing: CRAFTS_PRICING,
  },
  "beach-shell-jewelry": {
    prerequisites: [ ...BEACH_SHELL_JEWELRY_PREREQUISITE_EXTRAS],
    tools: [...BEACH_SHELL_JEWELRY_TOOLS, ...t("phone_computer")],
    externalLinks: BEACH_SHELL_JEWELRY_EXTERNAL_LINKS,
    supplies: BEACH_SHELL_JEWELRY_SUPPLIES,
    suggestedPricing: BEACH_SHELL_JEWELRY_PRICING,
  },
  "gift-wrapping": {
    prerequisites: [ ...GIFT_WRAPPING_PREREQUISITE_EXTRAS],
    tools: [...GIFT_WRAPPING_TOOLS, ...t("phone_computer")],
    externalLinks: GIFT_WRAPPING_EXTERNAL_LINKS,
    supplies: GIFT_WRAPPING_SUPPLIES,
    suggestedPricing: GIFT_WRAPPING_PRICING,
  },
  "fb-marketplace-helper": {
    prerequisites: [
      P.parent("Guardian controls public posts, appointments, and transportation. An eligible adult (18+) must control the Marketplace account."),
      ...FB_MARKETPLACE_HELPER_PREREQUISITE_EXTRAS,
    ],
    tools: [...FB_MARKETPLACE_HELPER_TOOLS, ...t("phone_computer")],
    externalLinks: FB_MARKETPLACE_HELPER_EXTERNAL_LINKS,
    supplies: FB_MARKETPLACE_HELPER_SUPPLIES,
    suggestedPricing: FB_MARKETPLACE_HELPER_PRICING,
  },
  "porch-package-helper": {
    prerequisites: [
      P.parent("Guardian approves every client, daylight trusted-neighbor jobs only, and controls payment, transportation, and emergency contact. No unoccupied-home entry."),
      ...PORCH_PACKAGE_PREREQUISITE_EXTRAS,
    ],
    tools: [...PORCH_PACKAGE_TOOLS, ...t("phone_computer")],
    externalLinks: PORCH_PACKAGE_EXTERNAL_LINKS,
    supplies: PORCH_PACKAGE_SUPPLIES,
    suggestedPricing: PORCH_PACKAGE_PRICING,
  },
  "book-publishing-kids": {
    prerequisites: [
      P.parent("Guardian opens and controls every publishing, payment, tax, and sales account. The child never creates a false adult account."),
      ...BOOK_PUBLISHING_KIDS_PREREQUISITE_EXTRAS,
    ],
    tools: [...BOOK_PUBLISHING_KIDS_TOOLS, ...t("phone_computer")],
    externalLinks: BOOK_PUBLISHING_KIDS_EXTERNAL_LINKS,
    supplies: BOOK_PUBLISHING_KIDS_SUPPLIES,
    suggestedPricing: BOOK_PUBLISHING_KIDS_PRICING,
  },
  "travel-research-assistant": {
    prerequisites: [
      P.parent("Guardian approves every client and project, controls contracts and payments, and keeps schoolwork first. Age-appropriate clients only."),
      ...TRAVEL_RESEARCH_PREREQUISITE_EXTRAS,
    ],
    tools: [...TRAVEL_RESEARCH_TOOLS, ...t("phone_computer")],
    externalLinks: TRAVEL_RESEARCH_EXTERNAL_LINKS,
    supplies: TRAVEL_RESEARCH_SUPPLIES,
    suggestedPricing: TRAVEL_RESEARCH_PRICING,
  },
  "transcription-notes-helper": {
    prerequisites: [
      P.parent("Guardian approves every client and project, controls contracts, payment, file transfer, and deletion. Age-appropriate, non-sensitive recordings only."),
      ...TRANSCRIPTION_NOTES_PREREQUISITE_EXTRAS,
    ],
    tools: [...TRANSCRIPTION_NOTES_TOOLS, ...t("phone_computer")],
    externalLinks: TRANSCRIPTION_NOTES_EXTERNAL_LINKS,
    supplies: TRANSCRIPTION_NOTES_SUPPLIES,
    suggestedPricing: TRANSCRIPTION_NOTES_PRICING,
  },
  "website-tester": {
    prerequisites: [
      P.parent("Guardian approves every client, domain, test account, and test plan. Public-page or supervised test-environment work only."),
      ...WEBSITE_TESTER_PREREQUISITE_EXTRAS,
    ],
    tools: [...WEBSITE_TESTER_TOOLS, ...t("phone_computer")],
    externalLinks: WEBSITE_TESTER_EXTERNAL_LINKS,
    supplies: WEBSITE_TESTER_SUPPLIES,
    suggestedPricing: WEBSITE_TESTER_PRICING,
  },
  "community-newsletter-creator": {
    prerequisites: [
      P.parent("Guardian approves every client, audience, and issue. Age-appropriate communities only; an adult controls subscriber lists, email platforms, and payments."),
      ...COMMUNITY_NEWSLETTER_PREREQUISITE_EXTRAS,
    ],
    tools: [...COMMUNITY_NEWSLETTER_TOOLS, ...t("phone_computer")],
    externalLinks: COMMUNITY_NEWSLETTER_EXTERNAL_LINKS,
    supplies: COMMUNITY_NEWSLETTER_SUPPLIES,
    suggestedPricing: COMMUNITY_NEWSLETTER_PRICING,
  },
  teaching: {
    prerequisites: [...COMMUNITY_TEACHING_PREREQUISITE_EXTRAS],
    tools: [...COMMUNITY_TEACHING_TOOLS, ...t("phone_computer")],
    externalLinks: COMMUNITY_TEACHING_EXTERNAL_LINKS,
    supplies: COMMUNITY_TEACHING_SUPPLIES,
    suggestedPricing: COMMUNITY_TEACHING_PRICING,
  },
  "review-response-assistant": {
    prerequisites: [
      P.parent("Guardian approves every client and platform. No access to sensitive complaints. An adult controls account access, publishing, and payment."),
      ...REVIEW_RESPONSE_PREREQUISITE_EXTRAS,
    ],
    tools: [...REVIEW_RESPONSE_TOOLS, ...t("phone_computer")],
    externalLinks: REVIEW_RESPONSE_EXTERNAL_LINKS,
    supplies: REVIEW_RESPONSE_SUPPLIES,
    suggestedPricing: REVIEW_RESPONSE_PRICING,
  },
  consulting: {
    prerequisites: [...CAREER_CONSULTING_PREREQUISITE_EXTRAS],
    tools: [...CAREER_CONSULTING_TOOLS, ...t("phone_computer")],
    externalLinks: CAREER_CONSULTING_EXTERNAL_LINKS,
    supplies: CAREER_CONSULTING_SUPPLIES,
    suggestedPricing: CAREER_CONSULTING_PRICING,
  },
  notary: {
    prerequisites: [...PART_TIME_NOTARY_PREREQUISITE_EXTRAS],
    tools: [...PART_TIME_NOTARY_TOOLS, ...t("phone_computer")],
    externalLinks: PART_TIME_NOTARY_EXTERNAL_LINKS,
    supplies: PART_TIME_NOTARY_SUPPLIES,
    suggestedPricing: PART_TIME_NOTARY_PRICING,
  },
  "resume-linkedin-helper": {
    prerequisites: [
      P.parent("Guardian approves every client and document. Age-appropriate clients only; an adult controls LinkedIn access, payment, and file deletion. Never request a LinkedIn password."),
      ...RESUME_LINKEDIN_PREREQUISITE_EXTRAS,
    ],
    tools: [...RESUME_LINKEDIN_TOOLS, ...t("phone_computer")],
    externalLinks: RESUME_LINKEDIN_EXTERNAL_LINKS,
    supplies: RESUME_LINKEDIN_SUPPLIES,
    suggestedPricing: RESUME_LINKEDIN_PRICING,
  },
  "short-form-video-editor": {
    prerequisites: [
      P.parent("Guardian approves every client, footage, and posting. Age-appropriate content only; an adult controls accounts, rights, and payment."),
      ...SHORT_FORM_VIDEO_PREREQUISITE_EXTRAS,
    ],
    tools: [...SHORT_FORM_VIDEO_TOOLS, ...t("phone_computer")],
    externalLinks: SHORT_FORM_VIDEO_EXTERNAL_LINKS,
    supplies: SHORT_FORM_VIDEO_SUPPLIES,
    suggestedPricing: SHORT_FORM_VIDEO_PRICING,
  },
  "google-business-helper": {
    prerequisites: [
      P.parent("Guardian approves every client and Google account. An adult owner keeps primary ownership; the helper uses a manager invitation only. Never take the owner’s password."),
      ...GBP_HELPER_PREREQUISITE_EXTRAS,
    ],
    tools: [...GBP_HELPER_TOOLS, ...t("phone_computer")],
    externalLinks: GBP_HELPER_EXTERNAL_LINKS,
    supplies: GBP_HELPER_SUPPLIES,
    suggestedPricing: GBP_HELPER_PRICING,
  },
  "ugc-creator": {
    prerequisites: [
      P.parent("Guardian approves every brand, product, and usage-rights contract. Age-appropriate products only; an adult controls filming locations, payment, and licenses."),
      ...UGC_CREATOR_PREREQUISITE_EXTRAS,
    ],
    tools: [...UGC_CREATOR_TOOLS, ...t("phone_computer")],
    externalLinks: UGC_CREATOR_EXTERNAL_LINKS,
    supplies: UGC_CREATOR_SUPPLIES,
    suggestedPricing: UGC_CREATOR_PRICING,
  },
  "virtual-assistant": {
    prerequisites: [
      P.parent("Guardian approves every client and system. An adult controls account access, payment, and offboarding. Never request a password in email or chat."),
      ...VIRTUAL_ASSISTANT_PREREQUISITE_EXTRAS,
    ],
    tools: [...VIRTUAL_ASSISTANT_TOOLS, ...t("phone_computer")],
    externalLinks: VIRTUAL_ASSISTANT_EXTERNAL_LINKS,
    supplies: VIRTUAL_ASSISTANT_SUPPLIES,
    suggestedPricing: VIRTUAL_ASSISTANT_PRICING,
  },
  "virtual-receptionist": {
    prerequisites: [...VIRTUAL_RECEPTIONIST_PREREQUISITE_EXTRAS],
    tools: [...VIRTUAL_RECEPTIONIST_TOOLS, ...t("phone_computer")],
    externalLinks: VIRTUAL_RECEPTIONIST_EXTERNAL_LINKS,
    supplies: VIRTUAL_RECEPTIONIST_SUPPLIES,
    suggestedPricing: VIRTUAL_RECEPTIONIST_PRICING,
  },
  "online-community-moderator": {
    prerequisites: [
      P.parent("Guardian approves every community. Age-appropriate communities only; an adult owner controls safeguarding."),
      ...COMMUNITY_MODERATOR_PREREQUISITE_EXTRAS,
    ],
    tools: [...COMMUNITY_MODERATOR_TOOLS, ...t("phone_computer")],
    externalLinks: COMMUNITY_MODERATOR_EXTERNAL_LINKS,
    supplies: COMMUNITY_MODERATOR_SUPPLIES,
    suggestedPricing: COMMUNITY_MODERATOR_PRICING,
  },
  "basic-invitation-creator": {
    prerequisites: [ ...BASIC_INVITATION_PREREQUISITE_EXTRAS],
    tools: [...BASIC_INVITATION_TOOLS, ...t("phone_computer")],
    externalLinks: BASIC_INVITATION_EXTERNAL_LINKS,
    supplies: BASIC_INVITATION_SUPPLIES,
    suggestedPricing: BASIC_INVITATION_PRICING,
  },
  "pet-sitting": {
    prerequisites: [ ...PET_SITTING_PREREQUISITE_EXTRAS],
    tools: [...PET_SITTING_TOOLS, ...t("phone_computer")],
    externalLinks: PET_SITTING_EXTERNAL_LINKS,
    supplies: PET_SITTING_SUPPLIES,
    suggestedPricing: PET_SITTING_PRICING,
  },
  "local-content-photographer": {
    prerequisites: [ ...LOCAL_CONTENT_PHOTO_PREREQUISITE_EXTRAS],
    tools: [...LOCAL_CONTENT_PHOTO_TOOLS, ...t("canva", "phone_computer")],
    externalLinks: LOCAL_CONTENT_PHOTO_EXTERNAL_LINKS,
    supplies: LOCAL_CONTENT_PHOTO_SUPPLIES,
    suggestedPricing: LOCAL_CONTENT_PHOTO_PRICING,
  },
  "personal-shopper": {
    prerequisites: [ ...PERSONAL_SHOPPER_PREREQUISITE_EXTRAS],
    tools: [...PERSONAL_SHOPPER_TOOLS, ...t("phone_computer")],
    externalLinks: PERSONAL_SHOPPER_EXTERNAL_LINKS,
    supplies: PERSONAL_SHOPPER_SUPPLIES,
    suggestedPricing: PERSONAL_SHOPPER_PRICING,
  },
  "youth-sports-helper": {
    prerequisites: [ ...YOUTH_SPORTS_HELPER_PREREQUISITE_EXTRAS],
    tools: [...YOUTH_SPORTS_HELPER_TOOLS, ...t("phone_computer")],
    externalLinks: YOUTH_SPORTS_HELPER_EXTERNAL_LINKS,
    supplies: YOUTH_SPORTS_HELPER_SUPPLIES,
    suggestedPricing: YOUTH_SPORTS_HELPER_PRICING,
  },
  "junior-give-back-teach": {
    prerequisites: [ ...JUNIOR_GIVE_BACK_TEACH_PREREQUISITE_EXTRAS],
    tools: [...JUNIOR_GIVE_BACK_TEACH_TOOLS, ...t("phone_computer")],
    externalLinks: JUNIOR_GIVE_BACK_TEACH_EXTERNAL_LINKS,
    supplies: JUNIOR_GIVE_BACK_TEACH_SUPPLIES,
    suggestedPricing: JUNIOR_GIVE_BACK_TEACH_PRICING,
  },
  "junior-savings-ceo": {
    prerequisites: [
      P.parent("Guardian approves earning activities, verifies prices, handles digital payments and accounts, and decides whether a task is safe."),
      ...JUNIOR_SAVINGS_CEO_PREREQUISITE_EXTRAS,
    ],
    tools: [...JUNIOR_SAVINGS_CEO_TOOLS, ...t("phone_computer")],
    externalLinks: JUNIOR_SAVINGS_CEO_EXTERNAL_LINKS,
    supplies: JUNIOR_SAVINGS_CEO_SUPPLIES,
    suggestedPricing: JUNIOR_SAVINGS_CEO_PRICING,
  },
  "kids-kindness-share": {
    prerequisites: [ ...KIDS_KINDNESS_SHARE_PREREQUISITE_EXTRAS],
    tools: [...KIDS_KINDNESS_SHARE_TOOLS, ...t("phone_computer")],
    externalLinks: KIDS_KINDNESS_SHARE_EXTERNAL_LINKS,
    supplies: KIDS_KINDNESS_SHARE_SUPPLIES,
    suggestedPricing: KIDS_KINDNESS_SHARE_PRICING,
  },
  "kids-piggy-first-goal": {
    prerequisites: [ ...KIDS_PIGGY_FIRST_GOAL_PREREQUISITE_EXTRAS],
    tools: [...KIDS_PIGGY_FIRST_GOAL_TOOLS, ...t("phone_computer")],
    externalLinks: KIDS_PIGGY_FIRST_GOAL_EXTERNAL_LINKS,
    supplies: KIDS_PIGGY_FIRST_GOAL_SUPPLIES,
    suggestedPricing: KIDS_PIGGY_FIRST_GOAL_PRICING,
  },
  "family-history-organizer": {
    prerequisites: [ ...GENEALOGY_PREREQUISITE_EXTRAS],
    tools: [...GENEALOGY_TOOLS, ...t("phone_computer")],
    externalLinks: GENEALOGY_EXTERNAL_LINKS,
    supplies: GENEALOGY_SUPPLIES,
    suggestedPricing: GENEALOGY_PRICING,
  },
  "local-event-content-creator": {
    prerequisites: [ ...LOCAL_EVENT_CONTENT_PREREQUISITE_EXTRAS],
    tools: [...LOCAL_EVENT_CONTENT_TOOLS, ...t("phone_computer")],
    externalLinks: LOCAL_EVENT_CONTENT_EXTERNAL_LINKS,
    supplies: LOCAL_EVENT_CONTENT_SUPPLIES,
    suggestedPricing: LOCAL_EVENT_CONTENT_PRICING,
  },
  "junior-reinvest-ceo": {
    prerequisites: [ ...JUNIOR_REINVEST_CEO_PREREQUISITE_EXTRAS],
    tools: [...JUNIOR_REINVEST_CEO_TOOLS, ...t("phone_computer")],
    externalLinks: JUNIOR_REINVEST_CEO_EXTERNAL_LINKS,
    supplies: JUNIOR_REINVEST_CEO_SUPPLIES,
    suggestedPricing: JUNIOR_REINVEST_CEO_PRICING,
  },
  "kids-reinvest-jar": {
    prerequisites: [ ...KIDS_REINVEST_JAR_PREREQUISITE_EXTRAS],
    tools: [...KIDS_REINVEST_JAR_TOOLS, ...t("phone_computer")],
    externalLinks: KIDS_REINVEST_JAR_EXTERNAL_LINKS,
    supplies: KIDS_REINVEST_JAR_SUPPLIES,
    suggestedPricing: KIDS_REINVEST_JAR_PRICING,
  },
  "airbnb-turnover-checker": {
    prerequisites: [ ...AIRBNB_TURNOVER_CHECKER_PREREQUISITE_EXTRAS],
    tools: [...AIRBNB_TURNOVER_CHECKER_TOOLS, ...t("phone_computer")],
    externalLinks: AIRBNB_TURNOVER_CHECKER_EXTERNAL_LINKS,
    supplies: AIRBNB_TURNOVER_CHECKER_SUPPLIES,
    suggestedPricing: AIRBNB_TURNOVER_CHECKER_PRICING,
  },
  "str-cohost": {
    prerequisites: [ ...STR_COHOST_PREREQUISITE_EXTRAS],
    tools: [...STR_COHOST_TOOLS, ...t("phone_computer")],
    externalLinks: STR_COHOST_EXTERNAL_LINKS,
    supplies: STR_COHOST_SUPPLIES,
    suggestedPricing: STR_COHOST_PRICING,
  },
  "book-publishing": {
    prerequisites: [
      P.computer,
      P.parent("Experienced teens only — guardian approves accounts, tax/payment setup, and business arrangements."),
      ...BOOK_PUBLISHING_PREREQUISITE_EXTRAS,
    ],
    tools: [...BOOK_PUBLISHING_TOOLS, ...t("phone_computer", "kdp", "canva", "google_docs")],
    externalLinks: BOOK_PUBLISHING_EXTERNAL_LINKS,
    supplies: BOOK_PUBLISHING_SUPPLIES,
    suggestedPricing: BOOK_PUBLISHING_PRICING,
  },
  "friendship-bracelet-maker": {
    prerequisites: [
      P.parent("Guardian approves selling, public posts, and payments."),
      ...FRIENDSHIP_BRACELET_PREREQUISITE_EXTRAS,
    ],
    tools: [...FRIENDSHIP_BRACELET_TOOLS, ...t("phone_computer")],
    externalLinks: FRIENDSHIP_BRACELET_EXTERNAL_LINKS,
    supplies: FRIENDSHIP_BRACELET_SUPPLIES,
    suggestedPricing: FRIENDSHIP_BRACELET_PRICING,
  },
  "leaf-raking": {
    prerequisites: [
      P.parent("Guardian approves jobs, equipment, and travel."),
      ...LEAF_RAKING_PREREQUISITE_EXTRAS,
    ],
    tools: [...LEAF_RAKING_TOOLS, ...t("phone_computer")],
    externalLinks: LEAF_RAKING_EXTERNAL_LINKS,
    supplies: LEAF_RAKING_SUPPLIES,
    suggestedPricing: LEAF_RAKING_PRICING,
  },
  "lemonade-stand": {
    prerequisites: [
      P.parent("Guardian supervises location, food rules, money, and public posts."),
      ...LEMONADE_STAND_PREREQUISITE_EXTRAS,
    ],
    tools: [...LEMONADE_STAND_TOOLS, ...t("phone_computer")],
    externalLinks: LEMONADE_STAND_EXTERNAL_LINKS,
    supplies: LEMONADE_STAND_SUPPLIES,
    suggestedPricing: LEMONADE_STAND_PRICING,
  },
  "digital-cookbook-creator": {
    prerequisites: [...DIGITAL_COOKBOOK_PREREQUISITE_EXTRAS],
    tools: [...DIGITAL_COOKBOOK_TOOLS, ...t("phone_computer")],
    externalLinks: DIGITAL_COOKBOOK_EXTERNAL_LINKS,
    supplies: DIGITAL_COOKBOOK_SUPPLIES,
    suggestedPricing: DIGITAL_COOKBOOK_PRICING,
  },
  "family-photo-slideshow": {
    prerequisites: [...FAMILY_PHOTO_SLIDESHOW_PREREQUISITE_EXTRAS],
    tools: [...FAMILY_PHOTO_SLIDESHOW_TOOLS, ...t("phone_computer")],
    externalLinks: FAMILY_PHOTO_SLIDESHOW_EXTERNAL_LINKS,
    supplies: FAMILY_PHOTO_SLIDESHOW_SUPPLIES,
    suggestedPricing: FAMILY_PHOTO_SLIDESHOW_PRICING,
  },
  "local-resource-list-creator": {
    prerequisites: [...LOCAL_RESOURCE_LIST_PREREQUISITE_EXTRAS],
    tools: [...LOCAL_RESOURCE_LIST_TOOLS, ...t("phone_computer")],
    externalLinks: LOCAL_RESOURCE_LIST_EXTERNAL_LINKS,
    supplies: LOCAL_RESOURCE_LIST_SUPPLIES,
    suggestedPricing: LOCAL_RESOURCE_LIST_PRICING,
  },
  "recycling-helper": {
    prerequisites: [
      P.parent("Guardian approves routes, access, and dark-hour work."),
      ...RECYCLING_HELPER_PREREQUISITE_EXTRAS,
    ],
    tools: [...RECYCLING_HELPER_TOOLS, ...t("phone_computer")],
    externalLinks: RECYCLING_HELPER_EXTERNAL_LINKS,
    supplies: RECYCLING_HELPER_SUPPLIES,
    suggestedPricing: RECYCLING_HELPER_PRICING,
  },
  proofreader: {
    prerequisites: [...PROOFREADER_PREREQUISITE_EXTRAS],
    tools: [...PROOFREADER_TOOLS, ...t("phone_computer")],
    externalLinks: PROOFREADER_EXTERNAL_LINKS,
    supplies: PROOFREADER_SUPPLIES,
    suggestedPricing: PROOFREADER_PRICING,
  },
  "toy-organizer": {
    prerequisites: [
      P.parent("Guardian approves homes, keep/donate/trash decisions, and payments."),
      ...TOY_ORGANIZER_PREREQUISITE_EXTRAS,
    ],
    tools: [...TOY_ORGANIZER_TOOLS, ...t("phone_computer")],
    externalLinks: TOY_ORGANIZER_EXTERNAL_LINKS,
    supplies: TOY_ORGANIZER_SUPPLIES,
    suggestedPricing: TOY_ORGANIZER_PRICING,
  },
  "trash-can-service": {
    prerequisites: [
      P.parent("Guardian approves routes, access, and dark-hour work."),
      ...TRASH_CAN_SERVICE_PREREQUISITE_EXTRAS,
    ],
    tools: [...TRASH_CAN_SERVICE_TOOLS, ...t("phone_computer")],
    externalLinks: TRASH_CAN_SERVICE_EXTERNAL_LINKS,
    supplies: TRASH_CAN_SERVICE_SUPPLIES,
    suggestedPricing: TRASH_CAN_SERVICE_PRICING,
  },
  homework: {
    prerequisites: [
      P.parent("Guardian confirms subjects, integrity rules, location, and payments."),
      ...HOMEWORK_HELPER_PREREQUISITE_EXTRAS,
    ],
    tools: [...HOMEWORK_HELPER_TOOLS, ...t("phone_computer")],
    externalLinks: HOMEWORK_HELPER_EXTERNAL_LINKS,
    supplies: HOMEWORK_HELPER_SUPPLIES,
    suggestedPricing: HOMEWORK_HELPER_PRICING,
  },
  "canva-flyer-creator": {
    prerequisites: [
      P.parent("Guardian manages Canva accounts, payments, and public posts."),
      ...CANVA_FLYER_PREREQUISITE_EXTRAS,
    ],
    tools: [...CANVA_FLYER_TOOLS, ...t("phone_computer")],
    externalLinks: CANVA_FLYER_EXTERNAL_LINKS,
    supplies: CANVA_FLYER_SUPPLIES,
    suggestedPricing: CANVA_FLYER_PRICING,
  },
  "car-interior-cleanup": {
    prerequisites: [
      P.parent("Guardian approves products, vehicles, and hazardous-item stops."),
      ...CAR_INTERIOR_PREREQUISITE_EXTRAS,
    ],
    tools: [...CAR_INTERIOR_TOOLS, ...t("phone_computer")],
    externalLinks: CAR_INTERIOR_EXTERNAL_LINKS,
    supplies: CAR_INTERIOR_SUPPLIES,
    suggestedPricing: CAR_INTERIOR_PRICING,
  },
  "dog-walk": {
    prerequisites: [
      P.parent("Guardian is involved with new customers, home entry, money, and unfamiliar dogs."),
      ...NEIGHBORHOOD_DOG_WALKER_PREREQUISITE_EXTRAS,
    ],
    tools: [...NEIGHBORHOOD_DOG_WALKER_TOOLS, ...t("phone_computer")],
    externalLinks: NEIGHBORHOOD_DOG_WALKER_EXTERNAL_LINKS,
    supplies: NEIGHBORHOOD_DOG_WALKER_SUPPLIES,
    suggestedPricing: NEIGHBORHOOD_DOG_WALKER_PRICING,
  },
  "greeting-card-creator": {
    prerequisites: [
      P.parent("Guardian approves scissors, shipping, payments, and public posts."),
      ...GREETING_CARD_PREREQUISITE_EXTRAS,
    ],
    tools: [...GREETING_CARD_TOOLS, ...t("phone_computer")],
    externalLinks: GREETING_CARD_EXTERNAL_LINKS,
    supplies: GREETING_CARD_SUPPLIES,
    suggestedPricing: GREETING_CARD_PRICING,
  },
  "holiday-decorating-helper": {
    prerequisites: [
      P.parent("Adults handle all ladder-dependent tasks."),
      ...HOLIDAY_DECORATING_PREREQUISITE_EXTRAS,
    ],
    tools: [...HOLIDAY_DECORATING_TOOLS, ...t("phone_computer")],
    externalLinks: HOLIDAY_DECORATING_EXTERNAL_LINKS,
    supplies: HOLIDAY_DECORATING_SUPPLIES,
    suggestedPricing: HOLIDAY_DECORATING_PRICING,
  },
  tutoring: {
    prerequisites: [...TUTORING_SKILLS_PREREQUISITE_EXTRAS],
    tools: [...TUTORING_SKILLS_TOOLS, ...t("phone_computer")],
    externalLinks: TUTORING_SKILLS_EXTERNAL_LINKS,
    supplies: TUTORING_SKILLS_SUPPLIES,
    suggestedPricing: TUTORING_SKILLS_PRICING,
  },
  "vacation-mail-plant-helper": {
    prerequisites: [
      P.parent("Guardian involvement for new customers, access, and unfamiliar homes."),
      ...VACATION_PLANT_PREREQUISITE_EXTRAS,
    ],
    tools: [...VACATION_PLANT_TOOLS, ...t("phone_computer")],
    externalLinks: VACATION_PLANT_EXTERNAL_LINKS,
    supplies: VACATION_PLANT_SUPPLIES,
    suggestedPricing: VACATION_PLANT_PRICING,
  },
};

const GUIDE_TOOL_MAP: Record<string, (keyof typeof TOOL_CATALOG)[]> = {
  dog_walk: ["phone_computer", "basic_supplies"],
};

for (const [id, keys] of Object.entries({
  "friendship-bracelet-maker": ["phone_computer", "canva"],
  "greeting-card-creator": ["canva", "phone_computer", "google_docs"],
  "basic-invitation-creator": ["canva", "phone_computer", "google_docs"],
  "digital-cookbook-creator": ["canva", "chatgpt", "google_docs"],
  "family-photo-slideshow": ["canva", "capcut", "phone_computer"],
  "lemonade-stand": ["phone_computer", "canva"],
  "toy-organizer": ["phone_computer"],
  "dog-walk": ["phone_computer"],
  "pet-sitting": ["phone_computer"],
  crafts: ["phone_computer", "canva"],
  "yard-help": ["phone_computer"],
  tutoring: ["phone_computer", "zoom", "google_docs"],
  proofreader: ["phone_computer", "google_docs", "chatgpt"],
  homework: ["phone_computer", "google_docs"],
  "tech-helper": ["phone_computer"],
  "errand-runner": ["phone_computer"],
  "trash-can-service": ["phone_computer"],
  "leaf-raking": ["phone_computer"],
  "car-interior-cleanup": ["phone_computer"],
  "neighborhood-helper": ["phone_computer", "canva"],
  "holiday-decorating-helper": ["phone_computer"],
  "recycling-helper": ["phone_computer"],
  "vacation-mail-plant-helper": ["phone_computer"],
  "plant-watering": ["phone_computer"],
  "garage-sale-helper": ["phone_computer"],
} as Record<string, (keyof typeof TOOL_CATALOG)[]>)) {
  if (!GUIDE_KITS[id]) {
    GUIDE_KITS[id] = {
      prerequisites: [...DEFAULT_PREREQS],
      tools: t(...keys),
    };
  }
}

void GUIDE_TOOL_MAP;

/** Apps / accounts only — physical buys live on the Supply list. */
const PHYSICAL_TOOL_IDS = new Set([
  "basic_supplies",
  "handyman_kit",
  "printer",
]);

function toolsWithoutSupplyDupes(
  tools: GuideToolCost[],
  hasSupplies: boolean,
): GuideToolCost[] {
  return tools.filter((tool) => {
    if (PHYSICAL_TOOL_IDS.has(tool.id)) return false;
    // When a supply list exists, keep phone + software; drop vague “basic supplies”.
    if (hasSupplies && tool.id === "basic_supplies") return false;
    return true;
  });
}

/** When steps mention Google Docs, always surface it on the Tools tab with the sign-in link. */
export function ensureGoogleDocsTool(
  tools: GuideToolCost[],
  steps?: { title?: string; desc?: string; body?: string }[],
): GuideToolCost[] {
  const blob = (steps ?? [])
    .map((s) => `${s.title ?? ""} ${s.desc ?? ""} ${s.body ?? ""}`)
    .join("\n");
  const mentionsDocs = /google\s*docs?/i.test(blob);
  if (!mentionsDocs) return tools;
  const fresh = TOOL_CATALOG.google_docs;
  if (tools.some((t) => t.id === "google_docs")) {
    return tools.map((t) => (t.id === "google_docs" ? { ...fresh } : t));
  }
  return [...tools, { ...fresh }];
}

/** When steps mention Canva, always surface it on the Tools tab. */
export function ensureCanvaTool(
  tools: GuideToolCost[],
  steps?: { title?: string; desc?: string; body?: string }[],
): GuideToolCost[] {
  const blob = (steps ?? [])
    .map((s) => `${s.title ?? ""} ${s.desc ?? ""} ${s.body ?? ""}`)
    .join("\n");
  if (!/\bcanva\b/i.test(blob)) return tools;
  const fresh = TOOL_CATALOG.canva;
  if (tools.some((t) => t.id === "canva")) {
    return tools.map((t) => (t.id === "canva" ? { ...fresh } : t));
  }
  return [...tools, { ...fresh }];
}

function ensureMentionedAppTools(
  tools: GuideToolCost[],
  steps?: { title?: string; desc?: string; body?: string }[],
): GuideToolCost[] {
  return ensureCanvaTool(ensureGoogleDocsTool(tools, steps), steps);
}

/** Delivery-driver kits: no free-plan pitches; drop marketing app injects. */
function finalizeDeliveryDriverTools(guideId: string, tools: GuideToolCost[]): GuideToolCost[] {
  if (guideId !== "food-delivery" && guideId !== "rideshare") return tools;
  const skip = new Set(["google_docs", "canva", "chatgpt", "phone_computer"]);
  return tools
    .filter((t) => !skip.has(t.id))
    .map((t) => ({ ...t, planLabelApplicable: false }));
}

/** Full kit for any guide / hustle / kids-guide id. */
export function guideKitForId(guideId: string): GuideKit {
  const base = GUIDE_KITS[guideId] ?? {
    prerequisites: [...DEFAULT_PREREQS],
    tools: DEFAULT_TOOLS,
  };
  const supplies = base.supplies ?? suppliesForGuide(guideId) ?? defaultSuppliesForGuide(guideId);
  const suggestedPricing =
    base.suggestedPricing ?? suggestedPricingForGuide(guideId) ?? defaultSuggestedPricingForGuide(guideId);
  let tools = toolsWithoutSupplyDupes(base.tools, Boolean(supplies?.items.length));
  let kit: GuideKit = { ...base, tools };
  if (supplies?.items?.length) kit = { ...kit, supplies };
  if (suggestedPricing?.items?.length) kit = { ...kit, suggestedPricing };
  const hustle = hustleById(guideId);
  const kids = hustle ? undefined : kidsGuideById(guideId);
  const audiences =
    hustle?.audiences ??
    (kids
      ? kids.audience === "junior"
        ? (["junior"] as const)
        : (["kids"] as const)
      : undefined);

  const withMarketing = (raw: { title: string; desc: string }[]) =>
    finalizeGuidePlaybookSteps(
      guideId,
      ensureMarketingPlanSteps(raw, guideId),
      { audiences },
    );

  const finish = (next: GuideKit): GuideKit => ({
    ...next,
    prerequisites: stripGyshFreeAccountPrerequisite(next.prerequisites),
    tools: finalizeDeliveryDriverTools(guideId, next.tools),
  });

  const detailed = detailedStepsForGuide(guideId, { audiences });
  if (detailed?.length) {
    const steps = finalizeGuidePlaybookSteps(
      guideId,
      ensureMarketingPlanSteps(detailed, guideId),
      { audiences },
    );
    tools = ensureMentionedAppTools(tools, steps);
    return finish({ ...kit, tools, steps });
  }
  /** Prefer authored kit playbooks (e.g. AI games with ChatGPT/Scratch URLs) over short Kids Corner teasers. */
  if (kit.steps?.length && !isGenericGuideSteps(kit.steps)) {
    const steps = withMarketing(kit.steps.map((s) => ({ title: s.title, desc: s.desc })));
    return finish({ ...kit, tools: ensureMentionedAppTools(tools, steps), steps });
  }
  if (kids?.steps?.length) {
    const steps = withMarketing(kids.steps.map((s) => ({ title: s.title, desc: s.body })));
    return finish({ ...kit, tools: ensureMentionedAppTools(tools, steps), steps });
  }
  if (kit.steps?.length && isGenericGuideSteps(kit.steps)) {
    const steps = withMarketing([]);
    return finish({ ...kit, tools: ensureMentionedAppTools(tools, steps), steps });
  }
  if (kit.steps?.length) {
    const steps = withMarketing(kit.steps.map((s) => ({ title: s.title, desc: s.desc })));
    return finish({ ...kit, tools: ensureMentionedAppTools(tools, steps), steps });
  }
  const steps = withMarketing([]);
  return finish({ ...kit, tools: ensureMentionedAppTools(tools, steps), steps });
}

/** @deprecated Prefer guideKitForId — kept for existing imports. */
export function toolsForGuide(guideId: string): GuideToolCost[] {
  return guideKitForId(guideId).tools;
}

export function formatGuideToolLine(tool: GuideToolCost): string {
  const opt = tool.optional ? " (optional)" : "";
  const showPlan = tool.planLabelApplicable !== false;
  const plan = showPlan
    ? tool.freePlanAvailable
      ? "Free plan available — start here; upgrade only if you need it"
      : "Paid tool"
    : null;
  const planBit = plan ? ` — ${plan}.` : " —";
  const link = tool.url ? ` · ${tool.url}` : "";
  const alt = tool.alternatives ? ` · Alternatives: ${tool.alternatives}` : "";
  return `${tool.name}${opt}${planBit} ${tool.costNote}${link}${alt}`;
}

export function guideToolsDisclaimer(): string {
  return "Vendor prices are estimates. Check the vendor site for current pricing. Start on the free plan where available (Canva, Hedra, CapCut, ChatGPT, and similar) and upgrade only when/if you need it.";
}

/** Tools blurb for delivery-driver guides — apps are standard for drivers (no free-plan pitch). */
export function deliveryDriverToolsDisclaimer(): string {
  return "Driver apps and navigation are standard for this hustle. Your real costs are vehicle/bike use, fuel, and any gear you buy — check the Supply List for purchase items.";
}

export {
  estateSaleToolsDisclaimer,
  genealogyToolsDisclaimer,
  kidsPartyGameHostToolsDisclaimer,
  leadFollowupToolsDisclaimer,
  localContentPhotoToolsDisclaimer,
  personalShopperToolsDisclaimer,
  youthSportsHelperToolsDisclaimer,
  juniorGiveBackTeachToolsDisclaimer,
  juniorSavingsCeoToolsDisclaimer,
  kidsKindnessShareToolsDisclaimer,
  kidsPiggyFirstGoalToolsDisclaimer,
  appointmentSetterToolsDisclaimer,
  onlineResearchAssistantToolsDisclaimer,
  mothersHelperToolsDisclaimer,
  craftsToolsDisclaimer,
  beachShellJewelryToolsDisclaimer,
  giftWrappingToolsDisclaimer,
  affiliateToolsDisclaimer,
  dropshippingToolsDisclaimer,
  fbMarketplaceHelperToolsDisclaimer,
  basicInvitationToolsDisclaimer,
  podToolsDisclaimer,
  petSittingToolsDisclaimer,
  handymanToolsDisclaimer,
  babysittingToolsDisclaimer,
  errandRunnerToolsDisclaimer,
  aiAgentsToolsDisclaimer,
  aiPromoVideoToolsDisclaimer,
  aiTimingToolsDisclaimer,
  techHelperToolsDisclaimer,
  plantWateringToolsDisclaimer,
  yardHelpToolsDisclaimer,
  cleaningServiceToolsDisclaimer,
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
  kidsGamesAiToolsDisclaimer,
  aiPromptHelperToolsDisclaimer,
  aiPeersToolsDisclaimer,
  juniorGamesAiToolsDisclaimer,
  etsyStoreToolsDisclaimer,
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
  porchPackageHelperToolsDisclaimer,
  bookPublishingKidsToolsDisclaimer,
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
  virtualAssistantToolsDisclaimer,
  virtualReceptionistToolsDisclaimer,
  socialInfluencerToolsDisclaimer,
  onlineCommunityModeratorToolsDisclaimer,
};

export function prerequisitesDisclaimer(): string {
  return "Complete every prerequisite before step 1. Tools are listed separately so you know what to install or open.";
}
