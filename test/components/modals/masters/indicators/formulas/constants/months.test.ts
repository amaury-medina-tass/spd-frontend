import { MONTHS, ALL_MONTH_ITEMS } from '@/components/modals/masters/indicators/formulas/constants/months';

describe('months constants', () => {
  it('should export 12 months', () => {
    expect(MONTHS).toHaveLength(12);
  });

  it('should have value/label shape for each month', () => {
    MONTHS.forEach((m, idx) => {
      expect(m.value).toBe(idx + 1);
      expect(typeof m.label).toBe('string');
      expect(m.label.length).toBeGreaterThan(0);
    });
  });

  it('should have January as first and December as last', () => {
    expect(MONTHS[0]).toEqual({ value: 1, label: 'Enero' });
    expect(MONTHS[11]).toEqual({ value: 12, label: 'Diciembre' });
  });

  it('ALL_MONTH_ITEMS should start with "Todo el año" special item', () => {
    expect(ALL_MONTH_ITEMS[0]).toEqual({ key: 'ALL', label: 'Todo el año', isSpecial: true });
  });

  it('ALL_MONTH_ITEMS should have 13 items total', () => {
    expect(ALL_MONTH_ITEMS).toHaveLength(13);
  });

  it('ALL_MONTH_ITEMS non-special items should have key as string of month value', () => {
    const monthItems = ALL_MONTH_ITEMS.slice(1);
    monthItems.forEach((item, idx) => {
      expect(item.key).toBe((idx + 1).toString());
      expect(item.isSpecial).toBe(false);
    });
  });
});
