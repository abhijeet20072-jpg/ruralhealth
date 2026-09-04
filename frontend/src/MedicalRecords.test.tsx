// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MedicalRecords } from './pages/MedicalRecords';
import { BrowserRouter } from 'react-router-dom';

vi.mock('./services/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: { timeline: [] } }),
    post: vi.fn()
  }
}));

vi.mock('./context/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'ROLE_DOCTOR_MO' }
  })
}));

describe('Medical Records Timeline', () => {
  it('renders the EHR timeline and form for clinicians', () => {
    render(
      <BrowserRouter>
        <MedicalRecords />
      </BrowserRouter>
    );
    expect(screen.getByText('Longitudinal Medical Records')).toBeInTheDocument();
    expect(screen.getByText('Add Clinical Record')).toBeInTheDocument(); // Doctor should see form
  });
});
