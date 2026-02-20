jest.mock("@/lib/http", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

import { getLocationsSelect, createLocation } from "./locations.service";
import { get, post } from "@/lib/http";

const mockGet = get as jest.Mock;
const mockPost = post as jest.Mock;

describe("locations.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [], meta: {} });
    mockPost.mockResolvedValue({});
  });

  it("getLocationsSelect", async () => {
    await getLocationsSelect("search=test");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("locations"));
  });

  it("createLocation", async () => {
    const data = { communeId: "c1", address: "123 Main St" };
    await createLocation(data);
    expect(mockPost).toHaveBeenCalledWith(expect.stringContaining("locations"), data);
  });
});
