jest.mock("@/lib/http", () => ({
  post: jest.fn(),
  patch: jest.fn(),
  get: jest.fn(),
}));

import { createFormula, updateFormula, getIndicatorFormulaData } from "./formulas.service";
import { post, patch, get } from "@/lib/http";

const mockPost = post as jest.Mock;
const mockPatch = patch as jest.Mock;
const mockGet = get as jest.Mock;

describe("formulas.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockResolvedValue({});
    mockPatch.mockResolvedValue({});
    mockGet.mockResolvedValue({});
  });

  it("createFormula", async () => {
    const data = { expression: "A+B", ast: {} };
    await createFormula(data);
    expect(mockPost).toHaveBeenCalledWith("/spd/masters/formulas", data);
  });

  it("updateFormula", async () => {
    await updateFormula("f1", { expression: "A-B" });
    expect(mockPatch).toHaveBeenCalledWith("/masters/formulas/f1", { expression: "A-B" });
  });

  it("getIndicatorFormulaData with default type", async () => {
    await getIndicatorFormulaData("ind1", "2024");
    expect(mockGet).toHaveBeenCalledWith("/masters/formulas/indicator-data/ind1?year=2024&type=action");
  });

  it("getIndicatorFormulaData with indicative type", async () => {
    await getIndicatorFormulaData("ind1", "2024", "indicative");
    expect(mockGet).toHaveBeenCalledWith("/masters/formulas/indicator-data/ind1?year=2024&type=indicative");
  });
});
