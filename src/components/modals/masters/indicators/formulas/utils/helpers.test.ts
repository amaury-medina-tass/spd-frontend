import { cleanLabel, serializeFormula, MONTHS, ALL_MONTH_ITEMS } from './helpers';

describe('cleanLabel', () => {
  it('returns fallback when label is undefined', () => {
    expect(cleanLabel(undefined, 'fallback')).toBe('fallback');
  });

  it('returns fallback when label is empty string', () => {
    expect(cleanLabel('', 'fallback')).toBe('fallback');
  });

  it('returns label when no colon present', () => {
    expect(cleanLabel('My Label', 'fallback')).toBe('My Label');
  });

  it('trims text before colon', () => {
    expect(cleanLabel('Label :value', 'fallback')).toBe('Label');
  });

  it('trims text before first colon only', () => {
    expect(cleanLabel('Part1:Part2:Part3', 'fallback')).toBe('Part1');
  });

  it('returns trimmed result when spaces before colon', () => {
    expect(cleanLabel('  Test  :value', 'fallback')).toBe('Test');
  });
});

describe('serializeFormula', () => {
  it('serializes variable step', () => {
    const steps = [{ type: 'variable' as const, value: { id: 'v1' } }];
    expect(serializeFormula(steps as any)).toBe('VAR[v1]');
  });

  it('serializes constant step', () => {
    const steps = [{ type: 'constant' as const, value: '42' }];
    expect(serializeFormula(steps as any)).toBe('42');
  });

  it('serializes operator step', () => {
    const steps = [{ type: 'operator' as const, value: { symbol: '+' } }];
    expect(serializeFormula(steps as any)).toBe('+');
  });

  it('serializes function step', () => {
    const steps = [{ type: 'function' as const, value: { id: 'SUM' } }];
    expect(serializeFormula(steps as any)).toBe('SUM(');
  });

  it('serializes parenthesis step', () => {
    const steps = [{ type: 'parenthesis' as const, value: ')' }];
    expect(serializeFormula(steps as any)).toBe(')');
  });

  it('serializes separator step', () => {
    const steps = [{ type: 'separator' as const, value: ',' }];
    expect(serializeFormula(steps as any)).toBe(',');
  });

  it('serializes goal_variable step', () => {
    const steps = [{ type: 'goal_variable' as const, value: { idMeta: 'g1' } }];
    expect(serializeFormula(steps as any)).toBe('GOAL_VAR[g1]');
  });

  it('serializes goal_indicator step', () => {
    const steps = [{ type: 'goal_indicator' as const, value: { idMeta: 'gi1' } }];
    expect(serializeFormula(steps as any)).toBe('GOAL_IND[gi1]');
  });

  it('serializes quadrennium_variable step', () => {
    const steps = [{ type: 'quadrennium_variable' as const, value: { id: 'qv1' } }];
    expect(serializeFormula(steps as any)).toBe('QUAD_VAR[qv1]');
  });

  it('serializes quadrennium_indicator step', () => {
    const steps = [{ type: 'quadrennium_indicator' as const, value: { id: 'qi1' } }];
    expect(serializeFormula(steps as any)).toBe('QUAD_IND[qi1]');
  });

  it('serializes advance step with months', () => {
    const steps = [{ type: 'advance' as const, value: { year: 2024, months: [1, 2, 3] } }];
    expect(serializeFormula(steps as any)).toBe('ADVANCE[2024:1,2,3]');
  });

  it('serializes advance step without months', () => {
    const steps = [{ type: 'advance' as const, value: { year: 2024, months: null } }];
    expect(serializeFormula(steps as any)).toBe('ADVANCE[2024]');
  });

  it('serializes complex expression', () => {
    const steps = [
      { type: 'variable' as const, value: { id: 'v1' } },
      { type: 'operator' as const, value: { symbol: '+' } },
      { type: 'constant' as const, value: '10' },
    ];
    expect(serializeFormula(steps as any)).toBe('VAR[v1]+10');
  });

  it('returns empty string for unknown step type', () => {
    const steps = [{ type: 'unknown' as const, value: {} }];
    expect(serializeFormula(steps as any)).toBe('');
  });

  it('returns empty string for empty steps array', () => {
    expect(serializeFormula([])).toBe('');
  });
});

describe('MONTHS (re-exported in helpers)', () => {
  it('should have 12 months', () => {
    expect(MONTHS).toHaveLength(12);
  });
});

describe('ALL_MONTH_ITEMS (re-exported in helpers)', () => {
  it('should have 13 items', () => {
    expect(ALL_MONTH_ITEMS).toHaveLength(13);
  });
});
