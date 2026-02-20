import { render, screen } from "@testing-library/react";
import { AuthGuard } from "./AuthGuard";
import { AuthContext } from "./AuthProvider";

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() };
jest.mocked(require("next/navigation").useRouter).mockReturnValue(mockRouter);
jest.mocked(require("next/navigation").usePathname).mockReturnValue("/dashboard");

const renderGuard = (me: any, loading: boolean) =>
  render(
    <AuthContext.Provider value={{ me, loading, refreshMe: jest.fn(), clear: jest.fn() }}>
      <AuthGuard><span data-testid="child">Protected</span></AuthGuard>
    </AuthContext.Provider>
  );

describe("AuthGuard", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows loading state", () => {
    renderGuard(null, true);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).toBeNull();
  });

  it("redirects when no user", () => {
    renderGuard(null, false);
    expect(mockRouter.replace).toHaveBeenCalledWith("/login?next=%2Fdashboard");
    expect(screen.queryByTestId("child")).toBeNull();
  });

  it("renders children when user exists", () => {
    renderGuard({ id: "1", first_name: "A" }, false);
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
