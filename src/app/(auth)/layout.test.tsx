import { render } from "@testing-library/react";
import AuthLayout from "./layout";

describe("AuthLayout", () => {
  it("renders children", () => {
    const { getByText } = render(<AuthLayout><span>child</span></AuthLayout>);
    expect(getByText("child")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    const { getByText } = render(
      <AuthLayout>
        <span>first</span>
        <span>second</span>
      </AuthLayout>
    );
    expect(getByText("first")).toBeInTheDocument();
    expect(getByText("second")).toBeInTheDocument();
  });

  it("renders without adding extra DOM nodes", () => {
    const { container } = render(
      <AuthLayout><div id="auth-content">content</div></AuthLayout>
    );
    expect(container.querySelector("#auth-content")).toBeInTheDocument();
  });

  it("renders nested components", () => {
    const { getByText } = render(
      <AuthLayout>
        <div>
          <h1>Login</h1>
          <p>Welcome back</p>
        </div>
      </AuthLayout>
    );
    expect(getByText("Login")).toBeInTheDocument();
    expect(getByText("Welcome back")).toBeInTheDocument();
  });
});
