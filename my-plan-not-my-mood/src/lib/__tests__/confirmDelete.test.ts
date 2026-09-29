import { describe, expect, it, vi } from 'vitest';
import { ARE_YOU_SURE_LABEL, confirmDelete } from '../confirmDelete';

describe('confirmDelete', () => {
  it('asks Are you sure? and only proceeds when the user confirms', () => {
    const spy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    expect(ARE_YOU_SURE_LABEL).toBe('Are you sure?');
    expect(confirmDelete()).toBe(true);
    expect(spy).toHaveBeenCalledWith('Are you sure?');
    spy.mockReturnValue(false);
    expect(confirmDelete()).toBe(false);
    spy.mockRestore();
  });
});
