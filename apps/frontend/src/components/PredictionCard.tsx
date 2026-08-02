interface AIPrediction {
  id: string;
  ingredientId?: string;
  predictionType: string;
  value: number;
  confidence: number;
  unit: string;
  reason?: string;
  recommendation?: string;
  predictedFor: string;
}

export default function PredictionCard({ prediction }: { prediction: AIPrediction }) {
  const icons: Record<string, string> = {
    WASTE: '🚨',
    DEMAND: '📦',
    EXPIRY: '⏰',
    PURCHASE: '💰',
    RISK_SCORE: '⚠️',
  };

  const confidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-green-600';
    if (conf >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const typeLabel = prediction.predictionType.toLowerCase().replace('_', ' ');
  const icon = icons[prediction.predictionType] || '📊';

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-sm font-bold ${confidenceColor(prediction.confidence)}`}>
          {Math.round(prediction.confidence * 100)}%
        </span>
      </div>
      <h4 className="font-semibold text-gray-900 capitalize mb-1 text-sm">
        {typeLabel}
      </h4>
      <p className="text-lg font-bold text-gray-900 mb-2">
        {prediction.value.toFixed(2)} {prediction.unit}
      </p>
      {prediction.recommendation && (
        <p className="text-xs text-gray-600 bg-white bg-opacity-70 p-2 rounded leading-relaxed">
          💡 {prediction.recommendation}
        </p>
      )}
    </div>
  );
}
