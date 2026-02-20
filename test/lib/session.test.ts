jest.mock("@/lib/http", () => ({
  get: jest.fn(),
}));

import { getMe } from "@/lib/session";
import { get } from "@/lib/http";

describe("getMe", () => {
  it("should call get with the auth.me endpoint", async () => {
    const mockUser = { id: "1", email: "test@test.com", roles: [] };
    (get as jest.Mock).mockResolvedValue(mockUser);

    const result = await getMe();

    expect(get).toHaveBeenCalledWith("/public/auth/me");
    expect(result).toEqual(mockUser);
  });
});
