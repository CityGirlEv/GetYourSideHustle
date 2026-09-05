import { describe, expect, it } from 'vitest';
import {
  ANGELA_NIECE_ORIGIN,
  DEFAULT_PROPOSAL_TEXT,
  ensureAngelaNieceOrigin,
  MUNTIE_EV_BIO,
  PLAN_EXEC_TITLE,
  PLAN_LIVING_DOCUMENT_LINE,
  PLAN_OVERVIEW_TITLE,
  PROJECT_OVERVIEW_TEXT,
  planRoadmapIntro,
} from '../planIntro';
import { CLIENT_DISPLAY_NAME, CLIENT_EMAIL } from '../clientIdentity';

describe('planIntro', () => {
  it('matches the PDF living-document intro and executive summary', () => {
    const intro = planRoadmapIntro();
    expect(intro.livingDocument).toBe(PLAN_LIVING_DOCUMENT_LINE);
    expect(intro.preparedFor).toBe(CLIENT_DISPLAY_NAME);
    expect(intro.clientEmail).toBe(CLIENT_EMAIL);
    expect(intro.execTitle).toBe(PLAN_EXEC_TITLE);
    expect(intro.execSummary).toContain('Do not let a temporary mood determine a permanent outcome');
    expect(intro.execSummary).toContain('niece');
    expect(intro.originStory).toBe(ANGELA_NIECE_ORIGIN);
    expect(intro.partnerBio).toContain('Evelyn Harris');
    expect(intro.partnerBio).toContain("Muntie Ev's AI Studio");
    expect(DEFAULT_PROPOSAL_TEXT).toContain(CLIENT_DISPLAY_NAME);
    expect(DEFAULT_PROPOSAL_TEXT).toContain('niece');
    expect(PLAN_OVERVIEW_TITLE).toBe('Overall Description of the Project');
    expect(PROJECT_OVERVIEW_TEXT).toContain('Phase 1');
    expect(PROJECT_OVERVIEW_TEXT).toContain('flat-rate $10,000');
    expect(PROJECT_OVERVIEW_TEXT).toContain('Gear and Socials');
    expect(PROJECT_OVERVIEW_TEXT).toContain('Coming Soon');
    expect(PROJECT_OVERVIEW_TEXT).toMatch(/organic tee-shirt sales/i);
    expect(PROJECT_OVERVIEW_TEXT).toMatch(/6\.2K/);
    expect(PROJECT_OVERVIEW_TEXT).toContain(CLIENT_DISPLAY_NAME);
    expect(intro.amountTitle).toBe('How We Got to This Amount');
    expect(intro.amountStory).toMatch(/lean into organic tee-shirt sales/i);
    expect(MUNTIE_EV_BIO).toContain('Technical Execution Partner');
    expect(MUNTIE_EV_BIO).toContain("Bachelor's in Computer Science");
    expect(MUNTIE_EV_BIO).toContain("Master's in Software Engineering");
    expect(MUNTIE_EV_BIO).toContain('over 30 years');
    expect(ensureAngelaNieceOrigin('Feel it.')).toContain('niece');
    expect(ensureAngelaNieceOrigin(DEFAULT_PROPOSAL_TEXT)).toBe(DEFAULT_PROPOSAL_TEXT);
  });
});
