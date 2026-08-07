import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import PredictionCard from './PredictionCard';

describe('PredictionCard', () => {
  const basePrediction = {
    id: 'pred-1',
    predictionType: 'WASTE',
    value: 45.5,
    confidence: 0.85,
    unit: 'kg',
    recommendation: 'Reduce waste by 20%',
    predictedFor: '2026-08-10',
  };

  describe('rendering', () => {
    it('renders prediction with icon, value, and unit', () => {
      render(<PredictionCard prediction={basePrediction} />);

      expect(screen.getByText('🚨')).toBeInTheDocument();
      expect(screen.getByText('45.50 kg')).toBeInTheDocument();
    });

    it('displays confidence percentage correctly', () => {
      render(<PredictionCard prediction={basePrediction} />);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('displays prediction type label in lowercase', () => {
      render(<PredictionCard prediction={basePrediction} />);

      expect(screen.getByText('waste')).toBeInTheDocument();
    });

    it('displays recommendation when provided', () => {
      render(<PredictionCard prediction={basePrediction} />);

      expect(screen.getByText(/Reduce waste by 20%/)).toBeInTheDocument();
    });

    it('does not display recommendation when not provided', () => {
      const noPrediction = { ...basePrediction, recommendation: undefined };
      render(<PredictionCard prediction={noPrediction} />);

      expect(screen.queryByText(/💡/)).not.toBeInTheDocument();
    });
  });

  describe('confidence color coding', () => {
    it('shows green color for high confidence (>= 0.8)', () => {
      const { container } = render(<PredictionCard prediction={basePrediction} />);

      const confidenceSpan = container.querySelector('.text-green-600');
      expect(confidenceSpan).toBeInTheDocument();
      expect(confidenceSpan).toHaveTextContent('85%');
    });

    it('shows yellow color for medium confidence (0.6-0.79)', () => {
      const prediction = { ...basePrediction, confidence: 0.7 };
      const { container } = render(<PredictionCard prediction={prediction} />);

      const confidenceSpan = container.querySelector('.text-yellow-600');
      expect(confidenceSpan).toBeInTheDocument();
      expect(confidenceSpan).toHaveTextContent('70%');
    });

    it('shows red color for low confidence (< 0.6)', () => {
      const prediction = { ...basePrediction, confidence: 0.5 };
      const { container } = render(<PredictionCard prediction={prediction} />);

      const confidenceSpan = container.querySelector('.text-red-600');
      expect(confidenceSpan).toBeInTheDocument();
      expect(confidenceSpan).toHaveTextContent('50%');
    });

    it('shows yellow color for confidence at boundary 0.6', () => {
      const prediction = { ...basePrediction, confidence: 0.6 };
      const { container } = render(<PredictionCard prediction={prediction} />);

      const confidenceSpan = container.querySelector('.text-yellow-600');
      expect(confidenceSpan).toBeInTheDocument();
    });

    it('shows green color for confidence at boundary 0.8', () => {
      const prediction = { ...basePrediction, confidence: 0.8 };
      const { container } = render(<PredictionCard prediction={prediction} />);

      const confidenceSpan = container.querySelector('.text-green-600');
      expect(confidenceSpan).toBeInTheDocument();
    });
  });

  describe('icons for prediction types', () => {
    it('renders correct icon for WASTE type', () => {
      render(<PredictionCard prediction={{ ...basePrediction, predictionType: 'WASTE' }} />);
      expect(screen.getByText('🚨')).toBeInTheDocument();
    });

    it('renders correct icon for DEMAND type', () => {
      render(<PredictionCard prediction={{ ...basePrediction, predictionType: 'DEMAND' }} />);
      expect(screen.getByText('📦')).toBeInTheDocument();
    });

    it('renders correct icon for EXPIRY type', () => {
      render(<PredictionCard prediction={{ ...basePrediction, predictionType: 'EXPIRY' }} />);
      expect(screen.getByText('⏰')).toBeInTheDocument();
    });

    it('renders correct icon for PURCHASE type', () => {
      render(<PredictionCard prediction={{ ...basePrediction, predictionType: 'PURCHASE' }} />);
      expect(screen.getByText('💰')).toBeInTheDocument();
    });

    it('renders correct icon for RISK_SCORE type', () => {
      render(<PredictionCard prediction={{ ...basePrediction, predictionType: 'RISK_SCORE' }} />);
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('renders default icon for unknown type', () => {
      render(<PredictionCard prediction={{ ...basePrediction, predictionType: 'UNKNOWN' }} />);
      expect(screen.getByText('📊')).toBeInTheDocument();
    });
  });

  describe('value formatting', () => {
    it('formats value with fixed decimal places', () => {
      render(<PredictionCard prediction={{ ...basePrediction, value: 45.1234 }} />);
      expect(screen.getByText('45.12 kg')).toBeInTheDocument();
    });

    it('handles integer values correctly', () => {
      render(<PredictionCard prediction={{ ...basePrediction, value: 50 }} />);
      expect(screen.getByText('50.00 kg')).toBeInTheDocument();
    });

    it('handles different units correctly', () => {
      render(<PredictionCard prediction={{ ...basePrediction, unit: '$' }} />);
      expect(screen.getByText('45.50 $')).toBeInTheDocument();
    });

    it('handles zero value', () => {
      render(<PredictionCard prediction={{ ...basePrediction, value: 0 }} />);
      expect(screen.getByText('0.00 kg')).toBeInTheDocument();
    });

    it('handles large values correctly', () => {
      render(<PredictionCard prediction={{ ...basePrediction, value: 9999.99 }} />);
      expect(screen.getByText('9999.99 kg')).toBeInTheDocument();
    });
  });

  describe('type label formatting', () => {
    it('formats WASTE label correctly', () => {
      render(<PredictionCard prediction={{ ...basePrediction, predictionType: 'WASTE' }} />);
      expect(screen.getByText('waste')).toBeInTheDocument();
    });

    it('formats RISK_SCORE label with underscores correctly', () => {
      render(<PredictionCard prediction={{ ...basePrediction, predictionType: 'RISK_SCORE' }} />);
      expect(screen.getByText('risk score')).toBeInTheDocument();
    });

    it('formats all prediction types as lowercase', () => {
      const types = ['WASTE', 'DEMAND', 'EXPIRY', 'PURCHASE', 'RISK_SCORE'];
      types.forEach((type) => {
        const { unmount } = render(
          <PredictionCard prediction={{ ...basePrediction, predictionType: type }} />
        );
        expect(screen.getByText(type.toLowerCase().replace(/_/g, ' '))).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('styling and accessibility', () => {
    it('applies correct background gradient', () => {
      const { container } = render(<PredictionCard prediction={basePrediction} />);
      const card = container.querySelector('.bg-gradient-to-br');

      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('from-blue-50', 'to-blue-100');
    });

    it('applies correct border styling', () => {
      const { container } = render(<PredictionCard prediction={basePrediction} />);
      const card = container.querySelector('.border-blue-200');

      expect(card).toBeInTheDocument();
    });

    it('applies hover effect', () => {
      const { container } = render(<PredictionCard prediction={basePrediction} />);
      const card = container.querySelector('.hover\\:shadow-md');

      expect(card).toBeInTheDocument();
    });

    it('has proper rounded corners', () => {
      const { container } = render(<PredictionCard prediction={basePrediction} />);
      const card = container.querySelector('.rounded-lg');

      expect(card).toBeInTheDocument();
    });

    it('has proper padding', () => {
      const { container } = render(<PredictionCard prediction={basePrediction} />);
      const card = container.querySelector('.p-4');

      expect(card).toBeInTheDocument();
    });

    it('has transition effect', () => {
      const { container } = render(<PredictionCard prediction={basePrediction} />);
      const card = container.querySelector('.transition');

      expect(card).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles empty recommendation string', () => {
      render(<PredictionCard prediction={{ ...basePrediction, recommendation: '' }} />);
      expect(screen.queryByText(/💡/)).not.toBeInTheDocument();
    });

    it('handles very long recommendations', () => {
      const longRec =
        'This is a very long recommendation that should still render properly without breaking the card layout';
      render(<PredictionCard prediction={{ ...basePrediction, recommendation: longRec }} />);
      expect(screen.getByText(new RegExp(longRec))).toBeInTheDocument();
    });

    it('handles very high confidence (> 1)', () => {
      render(<PredictionCard prediction={{ ...basePrediction, confidence: 1.5 }} />);
      expect(screen.getByText('150%')).toBeInTheDocument();
    });

    it('handles negative confidence', () => {
      render(<PredictionCard prediction={{ ...basePrediction, confidence: -0.5 }} />);
      expect(screen.getByText('-50%')).toBeInTheDocument();
    });
  });
});
