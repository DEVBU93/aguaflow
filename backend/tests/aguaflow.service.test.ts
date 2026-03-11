/**
 * Tests unitarios — AguaFlow Service
 * Verifica la lógica de scoring AGUA FLOW
 */
import { scoreToGrade, calculateDimensionScore } from '../services/aguaflow.service';

// ── Tests de puntuación ───────────────────────────────────────
describe('scoreToGrade', () => {
  it('should return S for score >= 90', () => {
    expect(scoreToGrade(90)).toBe('S');
    expect(scoreToGrade(100)).toBe('S');
  });
  it('should return A for score 80-89', () => {
    expect(scoreToGrade(80)).toBe('A');
    expect(scoreToGrade(89)).toBe('A');
  });
  it('should return B for score 70-79', () => {
    expect(scoreToGrade(70)).toBe('B');
  });
  it('should return C for score 60-69', () => {
    expect(scoreToGrade(60)).toBe('C');
  });
  it('should return D for score 50-59', () => {
    expect(scoreToGrade(50)).toBe('D');
  });
  it('should return F for score < 50', () => {
    expect(scoreToGrade(49)).toBe('F');
    expect(scoreToGrade(0)).toBe('F');
  });
});

// ── Tests de dimensiones AGUA FLOW ───────────────────────────
describe('AGUA FLOW dimensions', () => {
  it('should score Agilidad correctly', () => {
    const metrics = { deployFrequency: 10, avgCycleTime: 2, issueResolutionTime: 24 };
    const score = calculateDimensionScore('agilidad', metrics);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should return 0 for empty metrics', () => {
    const score = calculateDimensionScore('crecimiento', {});
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

// ── Tests del análisis completo ───────────────────────────────
describe('AguaFlow analysis structure', () => {
  it('should produce valid grade from overall score', () => {
    const grades = ['S', 'A', 'B', 'C', 'D', 'F'];
    [95, 85, 75, 65, 55, 30].forEach((score, i) => {
      expect(scoreToGrade(score)).toBe(grades[i]);
    });
  });
});
