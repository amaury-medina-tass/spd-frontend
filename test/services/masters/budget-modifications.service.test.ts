jest.mock("@/lib/http", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

import { getBudgetModifications, createBudgetModification } from "@/services/masters/budget-modifications.service";
import { get, post } from "@/lib/http";

const mockGet = get as jest.Mock;
const mockPost = post as jest.Mock;

describe("budget-modifications.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
    mockPost.mockResolvedValue({});
  });

  it("getBudgetModifications", async () => {
    await getBudgetModifications("page=1");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("budget-modifications?page=1"));
  });

  it("createBudgetModification", async () => {
    const data = { amount: 1000 };
    await createBudgetModification(data);
    expect(mockPost).toHaveBeenCalledWith(expect.stringContaining("budget-modifications"), data);
  });
});
