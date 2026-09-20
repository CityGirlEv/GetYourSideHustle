import { describe, expect, it } from 'vitest';
import {
  HOME_RECEIPTS_HEADING,
  HOME_WHO_WON_TODAY_LABEL,
  HOME_WHO_WON_TODAY_POP_CLASS,
  HOME_WHO_WON_TODAY_TARGET,
  homeMoodLabelDisplay,
  homeMoodTitleDisplay,
  homeMovementTitleDisplay,
  homePillarDisplay,
  homeReceiptsTitleDisplay,
} from '../homePillars';

describe('homePillarDisplay', () => {
  it('maps the five hero pillars to elegant script plus kicker', () => {
    expect(homePillarDisplay(0)).toEqual({ kicker: 'Wear the', script: 'Mindset' });
    expect(homePillarDisplay(1)).toEqual({ kicker: 'Practical', script: 'Tools' });
    expect(homePillarDisplay(2)).toEqual({ kicker: 'Real Life', script: 'Resources' });
    expect(homePillarDisplay(3)).toEqual({ kicker: 'Daily', script: 'Encourage' });
    expect(homePillarDisplay(4)).toEqual({ kicker: 'A Stronger', script: 'You' });
  });

  it('title-cases unknown titles and keeps the last word as the script', () => {
    expect(homePillarDisplay(9, 'WEAR THE PLAN')).toEqual({ kicker: 'Wear The', script: 'Plan' });
    expect(homePillarDisplay(9, 'Freedom')).toEqual({ kicker: '', script: 'Freedom' });
    expect(homePillarDisplay(9, '   ')).toEqual({ kicker: '', script: '' });
  });
});

describe('home fancy headings', () => {
  it('splits How Are You Feeling Today into Cinzel plus script', () => {
    expect(homeMoodTitleDisplay('HOW ARE YOU FEELING TODAY?')).toEqual({
      kicker: 'How Are You',
      script: 'Feeling Today?',
    });
  });

  it('splits A Movement for Real Life into Cinzel plus script', () => {
    expect(homeMovementTitleDisplay('A Movement for Real Life.')).toEqual({
      kicker: 'A Movement for',
      script: 'Real Life',
    });
    expect(homeMovementTitleDisplay('A Plan For Next Week')).toEqual({
      kicker: 'A Plan For',
      script: 'Next Week',
    });
  });

  it('points Who Won Today next to Real Life down to the receipts section', () => {
    expect(HOME_WHO_WON_TODAY_LABEL).toBe('Who Won Today?');
    expect(HOME_WHO_WON_TODAY_TARGET).toBe('receipts');
    expect(HOME_WHO_WON_TODAY_POP_CLASS).toBe('home-who-won-today-pop');
  });

  it('splits What Won Today Plan Receipts into Cinzel plus script', () => {
    expect(HOME_RECEIPTS_HEADING).toBe('WHAT WON TODAY? (PLAN RECEIPTS)');
    expect(homeReceiptsTitleDisplay(HOME_RECEIPTS_HEADING)).toEqual({
      kicker: 'Plan Receipts',
      script: 'What Won Today?',
    });
    expect(homeReceiptsTitleDisplay('A New Daily Win Log')).toEqual({
      kicker: 'A New Daily',
      script: 'Win Log',
    });
  });

  it('title-cases mood bubble labels for Cinzel type', () => {
    expect(homeMoodLabelDisplay('TIRED')).toBe('Tired');
    expect(homeMoodLabelDisplay('OVER IT')).toBe('Over It');
    expect(homeMoodLabelDisplay('MOTIVATE ME!')).toBe('Motivate Me!');
  });
});
