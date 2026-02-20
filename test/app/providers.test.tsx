import { render } from "@testing-library/react";
import Providers from "@/app/providers";

describe("Providers", () => {
  it("renders children wrapped in providers", () => {
    const { getByText } = render(<Providers><span>wrapped</span></Providers>);
    expect(getByText("wrapped")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    const { getByText } = render(
      <Providers>
        <span>child1</span>
        <span>child2</span>
      </Providers>
    );
    expect(getByText("child1")).toBeInTheDocument();
    expect(getByText("child2")).toBeInTheDocument();
  });

  it("renders nested elements", () => {
    const { getByText } = render(
      <Providers>
        <div><h1>Dashboard</h1></div>
      </Providers>
    );
    expect(getByText("Dashboard")).toBeInTheDocument();
  });

  it("wraps content without removing it from DOM", () => {
    const { container } = render(
      <Providers><div id="root-content">root</div></Providers>
    );
    expect(container.querySelector("#root-content")).toBeInTheDocument();
  });
});
