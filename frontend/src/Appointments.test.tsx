// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Appointments } from './pages/Appointments';
import { QueueManagement } from './pages/QueueManagement';
import { BrowserRouter } from 'react-router-dom';

// Mock API
vi.mock('./services/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: { queue: [], history: [] } }),
    put: vi.fn()
  }
}));

describe('Appointment & Queue UIs', () => {
  it('renders the Patient Appointments correctly', () => {
    render(
      <BrowserRouter>
        <Appointments />
      </BrowserRouter>
    );
    expect(screen.getByText('My Appointments')).toBeInTheDocument();
  });

  it('renders the Staff Queue Management correctly', () => {
    render(
      <BrowserRouter>
        <QueueManagement />
      </BrowserRouter>
    );
    expect(screen.getByText('Queue Management (Live)')).toBeInTheDocument();
  });
});
