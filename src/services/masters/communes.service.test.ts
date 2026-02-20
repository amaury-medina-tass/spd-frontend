jest.mock("@/lib/http", () => ({
  get: jest.fn(),
}));

import { getCommunesSelect } from "./communes.service";
import { get } from "@/lib/http";

const mockGet = get as jest.Mock;

describe("communes.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
  });

  it("getCommunesSelect", async () => {
    await getCommunesSelect("search=test");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("communes"));
  });
});
