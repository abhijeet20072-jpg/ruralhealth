// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Patients } from './pages/Patients';
import { BrowserRouter } from 'react-router-dom';

// Mock the Auth context and API
vi.mock('./context/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'ROLE_ASHA' }
  })
}));

vi.mock('./services/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: { patients: [] } })
  }
}));

describe('Patients List Component', () => {
  it('renders the patients directory securely', () => {
    render(
      <BrowserRouter>
        <Patients />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Patient Directory')).toBeInTheDocument();
    expect(screen.getByText('+ Register Patient')).toBeInTheDocument();
  });
});
