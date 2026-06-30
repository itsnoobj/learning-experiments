import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { DragMatch, type DragMatchItem } from '../DragMatch';

const INSTRUCTION = 'Put these steps in the right order';

const ITEMS: DragMatchItem[] = [
  { id: 'a', text: 'Name the loss' },
  { id: 'b', text: 'Make first step tiny' },
  { id: 'c', text: 'Let early adopters prove it' },
  { id: 'd', text: 'Protect status' },
];

const CORRECT_ORDER = ['a', 'b', 'c', 'd'];

function setup(onCorrect = vi.fn()) {
  render(
    <DragMatch
      instruction={INSTRUCTION}
      items={ITEMS}
      correctOrder={CORRECT_ORDER}
      onCorrect={onCorrect}
    />,
  );
  return { onCorrect };
}

/** The visible item texts in current display order. */
function currentOrderTexts(): string[] {
  return screen.getAllByRole('listitem').map((li) => {
    // The middle span holds the item text; pick the one matching a known item.
    const match = ITEMS.find((item) => within(li).queryByText(item.text));
    return match ? match.text : '';
  });
}

describe('DragMatch', () => {
  beforeEach(() => {
    // Force a deterministic, non-correct starting order: reverse of correct.
    // Math.random returning 0 makes Fisher–Yates a no-op, but the reshuffle
    // guard then leaves input order; instead we stub to produce a known swap.
    let calls = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      // Return values that reverse the list on the first shuffle pass.
      calls += 1;
      return calls % 2 === 0 ? 0.99 : 0.01;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the instruction', () => {
    setup();
    expect(screen.getByText(INSTRUCTION)).toBeInTheDocument();
  });

  it('renders all items', () => {
    setup();
    ITEMS.forEach((item) => {
      expect(screen.getByText(item.text)).toBeInTheDocument();
    });
  });

  it('renders position numbers for each item', () => {
    setup();
    expect(screen.getAllByRole('listitem')).toHaveLength(ITEMS.length);
    ITEMS.forEach((_, index) => {
      expect(screen.getByText(String(index + 1))).toBeInTheDocument();
    });
  });

  it('reorders items when an arrow button is pressed', () => {
    setup();
    const before = currentOrderTexts();
    const firstItemText = before[0];

    // Move the first item down; it should swap with the second.
    const downButton = screen.getByRole('button', { name: `Move "${firstItemText}" down` });
    fireEvent.click(downButton);

    const after = currentOrderTexts();
    expect(after[1]).toBe(firstItemText);
    expect(after).not.toEqual(before);
  });

  it('shows success and calls onCorrect once the order is correct', () => {
    const { onCorrect } = setup();

    // Insertion sort using the up arrows: for each target position, bring the
    // item that belongs there up until it lands, one step at a time. Positions
    // already placed are never disturbed because we only move items upward.
    for (let pos = 0; pos < CORRECT_ORDER.length; pos += 1) {
      const expectedText = ITEMS.find((i) => i.id === CORRECT_ORDER[pos])!.text;
      let guard = 0;
      while (currentOrderTexts()[pos] !== expectedText && guard < ITEMS.length * 2) {
        const upButton = screen.getByRole('button', { name: `Move "${expectedText}" up` });
        fireEvent.click(upButton);
        guard += 1;
      }
    }

    expect(currentOrderTexts()).toEqual(ITEMS.map((i) => i.text));

    fireEvent.click(screen.getByRole('button', { name: 'Check Order' }));

    expect(screen.getByText('Correct!')).toBeInTheDocument();
    const nextButton = screen.getByRole('button', { name: 'Next →' });
    fireEvent.click(nextButton);
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });

  it('shows "Try again" when the order is wrong', () => {
    setup();
    // Starting order is shuffled (reversed), so checking immediately is wrong.
    fireEvent.click(screen.getByRole('button', { name: 'Check Order' }));
    expect(screen.getByText('Try again')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next →' })).not.toBeInTheDocument();
  });
});
