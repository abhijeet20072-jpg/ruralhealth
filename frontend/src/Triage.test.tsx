// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Triage } from './pages/Triage';
import { BrowserRouter } from 'react-router-dom';

vi.mock('./services/api', () => ({
  api: { post: vi.fn() }
}));

describe('Digital Triage Component', () => {
  it('renders the triage form correctly', () => {
    render(
      <BrowserRouter>
        <Triage />
      </BrowserRouter>
    );
    expect(screen.getByText('Digital Triage & Assessment')).toBeInTheDocument();
    expect(screen.getByText('Run CDSS Triage')).toBeInTheDocument();
  });
});
