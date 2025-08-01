// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingTour from '../components/OnboardingTour';

describe('OnboardingTour', () => {
  it('stores onboarding state when finished', async () => {
    localStorage.clear();
    render(
      <>
        <div data-tour="thesis-input" />
        <div data-tour="mcq-review" />
        <div data-tour="saved-mcqs" />
        <OnboardingTour run onFinish={() => localStorage.setItem('onboardingSeen', '1')} />
      </>
    );
    const skip = await screen.findByText(/skip/i);
    await userEvent.click(skip);
    expect(localStorage.getItem('onboardingSeen')).toBe('1');
  });
});
