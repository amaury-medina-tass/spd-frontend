import {
  FormulaEditorModal,
  FormulaGuideModal,
  ReplicateFormulaModal,
  StepChip,
  MONTHS,
  ALL_MONTH_ITEMS,
  cleanLabel,
  serializeFormula,
} from "@/components/modals/masters/indicators/formulas/index";

describe("formulas barrel exports", () => {
  it("exports FormulaEditorModal", () => {
    expect(FormulaEditorModal).toBeDefined();
  });

  it("exports FormulaGuideModal", () => {
    expect(FormulaGuideModal).toBeDefined();
  });

  it("exports ReplicateFormulaModal", () => {
    expect(ReplicateFormulaModal).toBeDefined();
  });

  it("exports StepChip component", () => {
    expect(StepChip).toBeDefined();
  });

  it("exports MONTHS constant", () => {
    expect(MONTHS).toBeDefined();
    expect(Array.isArray(MONTHS)).toBe(true);
    expect(MONTHS.length).toBe(12);
  });

  it("exports ALL_MONTH_ITEMS constant", () => {
    expect(ALL_MONTH_ITEMS).toBeDefined();
    expect(Array.isArray(ALL_MONTH_ITEMS)).toBe(true);
    expect(ALL_MONTH_ITEMS.length).toBe(13); // 12 months + ALL
  });

  it("exports cleanLabel utility", () => {
    expect(typeof cleanLabel).toBe("function");
  });

  it("exports serializeFormula utility", () => {
    expect(typeof serializeFormula).toBe("function");
  });
});
