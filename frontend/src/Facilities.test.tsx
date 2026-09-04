// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Facilities } from './pages/Facilities';
import { BrowserRouter } from 'react-router-dom';

// Mock the Auth context and API
vi.mock('./context/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'ROLE_FACILITY_ADMIN' }
  })
}));

vi.mock('./services/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: { facilities: [] } })
  }
}));

describe('Facilities List Component', () => {
  it('renders the facilities page correctly', () => {
    render(
      <BrowserRouter>
        <Facilities />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Healthcare Facilities')).toBeInTheDocument();
    // Admin should see Register button
    expect(screen.getByText('+ Register Facility')).toBeInTheDocument();
  });
});
