export const calculateAccuracy = (correct: number, total: number) => {
  if (total <= 0) return 1;
  return Math.min(1, Math.max(0, correct / total));
};

export const calculateCpm = (correct: number, durationSec: number) => {
  if (durationSec <= 0) return 0;
  return Math.round((correct / durationSec) * 60);
};

export const calculateWpm = (cpm: number) => Math.round(cpm / 5);

export const calculateScore = (cpm: number, accuracy: number) =>
  Math.floor(cpm * Math.pow(accuracy, 2) / 2);

export const formatAccuracy = (accuracy: number) => `${(accuracy * 100).toFixed(1)}%`;

export const formatSpeed = (value: number) => `${value.toLocaleString()} cpm`;

export const sanitizeKey = (key: string) => {
  if (key.length === 1) {
    return key;
  }
  switch (key) {
    case ' ': {
      return ' ';
    }
    case 'Tab':
      return '\t';
    default:
      return key;
  }
};

export const calculateAnomalyScore = (intervals: number[]) => {
  if (intervals.length < 2) {
    return 0;
  }
  const avg = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
  const variance =
    intervals.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / intervals.length;
  const std = Math.sqrt(variance);
  const coefficient = avg === 0 ? 0 : std / avg;
  return Number((1 - Math.min(coefficient, 1)).toFixed(2));
};
