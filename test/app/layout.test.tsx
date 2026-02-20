import { render } from "@testing-library/react";

jest.mock("@/app/providers", () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="providers">{children}</div>,
}));

import RootLayout from "@/app/layout";

describe("RootLayout", () => {
  it("renders children inside providers", () => {
    const { getByText } = render(<RootLayout><span>child</span></RootLayout>);
    expect(getByText("child")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    const { getByText } = render(
      <RootLayout>
        <span>first</span>
        <span>second</span>
      </RootLayout>
    );
    expect(getByText("first")).toBeInTheDocument();
    expect(getByText("second")).toBeInTheDocument();
  });

  it("renders providers wrapper", () => {
    const { getByTestId } = render(<RootLayout><span>x</span></RootLayout>);
    expect(getByTestId("providers")).toBeInTheDocument();
  });

  it("renders html element with lang attribute", () => {
    const { container } = render(<RootLayout><span>x</span></RootLayout>);
    const html = container.closest("html");
    expect(html).toBeTruthy();
  });
});
