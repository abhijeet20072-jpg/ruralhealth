// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReferralDashboard } from './pages/ReferralDashboard';
import { BrowserRouter } from 'react-router-dom';

vi.mock('./services/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: { referrals: [] } }),
    put: vi.fn()
  }
}));

describe('Referral Dashboard Component', () => {
  it('renders the incoming and outgoing tabs', () => {
    render(
      <BrowserRouter>
        <ReferralDashboard />
      </BrowserRouter>
    );
    expect(screen.getByText('Referral Management Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Incoming Referrals (To Us)')).toBeInTheDocument();
    expect(screen.getByText('Outgoing Referrals (From Us)')).toBeInTheDocument();
  });
});
