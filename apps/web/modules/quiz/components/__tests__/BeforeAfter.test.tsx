import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BeforeAfter } from '../BeforeAfter';

const CONTEXT = 'Your team resists a new tool.';
const SCENARIO_A = {
  label: 'Manager A',
  text: 'Presents 50 slides of data proving the tool is better.',
};
const SCENARIO_B = {
  label: 'Manager B',
  text: "Says 'I know this means relearning. Let's try it for one task.'",
};
const EXPLANATION = 'Manager B acknowledged the loss first.';

function setup(onCorrect = vi.fn()) {
  render(
    <BeforeAfter
      context={CONTEXT}
      scenarioA={SCENARIO_A}
      scenarioB={SCENARIO_B}
      correctScenario="B"
      explanation={EXPLANATION}
      onCorrect={onCorrect}
    />,
  );
  return { onCorrect };
}

describe('BeforeAfter', () => {
  it('renders the context', () => {
    setup();
    expect(screen.getByText(CONTEXT)).toBeInTheDocument();
  });

  it('renders both scenarios', () => {
    setup();
    expect(screen.getByText(SCENARIO_A.label)).toBeInTheDocument();
    expect(screen.getByText(SCENARIO_A.text)).toBeInTheDocument();
    expect(screen.getByText(SCENARIO_B.label)).toBeInTheDocument();
    expect(screen.getByText(SCENARIO_B.text)).toBeInTheDocument();
  });

  it('does not show the explanation before a choice is made', () => {
    setup();
    expect(screen.queryByText(EXPLANATION)).not.toBeInTheDocument();
  });

  it('shows explanation, Correct badge, and Next when the correct scenario is chosen', () => {
    const { onCorrect } = setup();
    fireEvent.click(screen.getByText(SCENARIO_B.text));

    expect(screen.getByText(EXPLANATION)).toBeInTheDocument();
    expect(screen.getByText(/Correct/)).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: 'Next →' });
    fireEvent.click(nextButton);
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });

  it('shows explanation and retry (no Next) when the wrong scenario is chosen', () => {
    setup();
    fireEvent.click(screen.getByText(SCENARIO_A.text));

    expect(screen.getByText('Not quite')).toBeInTheDocument();
    expect(screen.getByText(EXPLANATION)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next →' })).not.toBeInTheDocument();
  });

  it('allows retry after a wrong choice and then succeeds', () => {
    const { onCorrect } = setup();
    fireEvent.click(screen.getByText(SCENARIO_A.text));
    expect(screen.queryByRole('button', { name: 'Next →' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(SCENARIO_B.text));
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });
});
