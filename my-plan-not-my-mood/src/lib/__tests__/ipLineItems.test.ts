import { describe, expect, it } from 'vitest';
import {
  addIpLineItem,
  createBlankIpLineItem,
  keepSavedLineItemCopy,
  mergeSavedIpLineItems,
  removeIpLineItem,
} from '../ipLineItems';

describe('ipLineItems', () => {
  it('creates a blank Phase 1 or Phase 2 item', () => {
    const phase1 = createBlankIpLineItem('phase1_build', 100);
    expect(phase1.id).toBe('custom-100');
    expect(phase1.phase).toBe('phase1_build');
    expect(phase1.duration).toBe('1 Week');
    expect(phase1.visible).toBe(true);

    const phase2 = createBlankIpLineItem('phase2_addons', 200);
    expect(phase2.phase).toBe('phase2_addons');
    expect(phase2.duration).toBe('Phase 2 — future discussion');

    const phase3 = createBlankIpLineItem('phase3_future', 300);
    expect(phase3.phase).toBe('phase3_future');
    expect(phase3.name).toBe('New Phase 3 item');
  });

  it('adds and removes items without resurrecting a deleted default', () => {
    const defaults = [
      { id: 'sprint0', name: 'Sprint 0' },
      { id: 'sprint1', name: 'Sprint 1' },
    ];
    const added = addIpLineItem(defaults, { id: 'custom-1', name: 'Workshop' });
    expect(added.map((item) => item.id)).toEqual(['sprint0', 'sprint1', 'custom-1']);
    expect(addIpLineItem(added, { id: 'custom-1', name: 'Dup' })).toEqual(added);

    const withoutSprint1 = removeIpLineItem(added, 'sprint1');
    expect(withoutSprint1.map((item) => item.id)).toEqual(['sprint0', 'custom-1']);

    const merged = mergeSavedIpLineItems(withoutSprint1, defaults, (_, saved) => saved);
    expect(merged.map((item) => item.id)).toEqual(['sprint0', 'custom-1']);
    expect(merged.some((item) => item.id === 'sprint1')).toBe(false);
  });

  it('uses defaults only when nothing has been saved yet', () => {
    const defaults = [{ id: 'sprint0', name: 'Sprint 0' }];
    expect(mergeSavedIpLineItems(null, defaults, (_, saved) => saved)).toEqual(defaults);
    expect(mergeSavedIpLineItems(undefined, defaults, (_, saved) => saved)).toEqual(defaults);
    expect(mergeSavedIpLineItems([], defaults, (_, saved) => saved)).toEqual([]);
  });

  it('keeps saved budget title, description, notes, sprint, status, and assignee', () => {
    const seed = {
      name: 'Sprint 0 seed',
      summary: 'Seed summary',
      description: 'Seed description',
      notes: '',
      sprint: 'Sprint 0',
      status: 'not_started',
      assignee: 'unassigned',
    };
    const saved = {
      name: 'Brand shell',
      summary: 'Updated summary',
      description: 'Updated description',
      notes: 'Angela asked for organic tees.',
      sprint: 'Sprint 1',
      status: 'in_progress',
      assignee: 'evelyn',
    };
    expect(keepSavedLineItemCopy(seed, saved)).toMatchObject(saved);
    expect(createBlankIpLineItem('phase1_build', 1).notes).toBe('');
    expect(createBlankIpLineItem('phase1_build', 1).status).toBe('not_started');
  });
});
