import { describe, expect, it } from 'vitest';
import {
  hostingAgreementSearchBlob,
  hostingFeeSchedule,
  hostingRetailTotal,
} from '../hostingAgreement';

describe('hostingAgreement', () => {
  it('lists 4 marketing videos as complimentary work at $0 charged', () => {
    const videos = hostingFeeSchedule().find((item) => item.id === 'comp-videos');
    expect(videos).toMatchObject({
      name: '4 marketing videos (complimentary, no charge)',
      retailAmount: 1_500,
      chargedAmount: 0,
    });
    expect(hostingRetailTotal()).toBe(5_250);
    expect(hostingAgreementSearchBlob()).toMatch(/4 marketing videos/);
    expect(hostingAgreementSearchBlob()).toMatch(/complimentary/);
  });
});
