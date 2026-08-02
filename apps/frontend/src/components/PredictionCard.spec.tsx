import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PredictionCard from './PredictionCard';

describe('PredictionCard', () => {
  const mockPrediction = {
    id: 'pred-1',
    predictionType: 'WASTE' as const,
    value: 45.5,
    confidence: 0.85,
    unit: 'kg',
    recommendation: 'Reduce waste by 20%',
    predictedFor: '2026-08-02',
  };

  it('renders prediction with icon and value', () => {
    render(<PredictionCard prediction={mockPrediction} />);

    expect(screen.getByText('🚨')).toBeInTheDocument();
    expect(screen.getByText(/45.50 kg/)).toBeInTheDocument();
  });

  it('displays confidence percentage', () => {
    render(<PredictionCard prediction={mockPrediction} />);

    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('shows green confidence color for >= 0.8', () => {
    const { container } = render(<PredictionCard prediction={mockPrediction} />);

    const confidenceSpan = container.querySelector('.text-green-600');
    expect(confidenceSpan).toBeInTheDocument();
  });

  it('shows yellow confidence color for 0.6-0.79', () => {
    const lowConfPrediction = { ...mockPrediction, confidence: 0.7 };
    const { container } = render(<PredictionCard prediction={lowConfPrediction} />);

    const confidenceSpan = container.querySelector('.text-yellow-600');
    expect(confidenceSpan).toBeInTheDocument();
  });

  it('shows red confidence color for < 0.6', () => {
    const veryLowConfPrediction = { ...mockPrediction, confidence: 0.5 };
    const { container } = render(<PredictionCard prediction={veryLowConfPrediction} />);

    const confidenceSpan = container.querySelector('.text-red-600');
    expect(confidenceSpan).toBeInTheDocument();
  });

  it('displays recommendation when provided', () => {
    render(<PredictionCard prediction={mockPrediction} />);

    expect(screen.getByText(/Reduce waste by 20%/)).toBeInTheDocument();
  });

  it('does not display recommendation when not provided', () => {
    const noPrediction = { ...mockPrediction, recommendation: undefined };
    render(<PredictionCard prediction={noPrediction} />);

    expect(screen.queryByText(/💡/)).not.toBeInTheDocument();
  });

  it('renders correct icons for different prediction types', () => {
    const demandPrediction = { ...mockPrediction, predictionType: 'DEMAND' as const };
    const { rerender } = render(<PredictionCard prediction={demandPrediction} />);

    expect(screen.getByText('📦')).toBeInTheDocument();

    const expiryPrediction = { ...mockPrediction, predictionType: 'EXPIRY' as const };
    rerender(<PredictionCard prediction={expiryPrediction} />);

    expect(screen.getByText('⏰')).toBeInTheDocument();
  });

  it('displays prediction type label in lowercase', () => {
    render(<PredictionCard prediction={mockPrediction} />);

    expect(screen.getByText('waste')).toBeInTheDocument();
  });
});
