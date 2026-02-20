import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";

describe("UI Card components", () => {
  it("renders Card with data-slot", () => {
    render(<Card data-testid="card">content</Card>);
    expect(screen.getByTestId("card")).toHaveAttribute("data-slot", "card");
  });

  it("renders CardHeader", () => {
    render(<CardHeader data-testid="header">header</CardHeader>);
    expect(screen.getByTestId("header")).toHaveAttribute("data-slot", "card-header");
  });

  it("renders CardTitle", () => {
    render(<CardTitle>My Title</CardTitle>);
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("renders CardDescription", () => {
    render(<CardDescription>description</CardDescription>);
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("renders CardContent", () => {
    render(<CardContent data-testid="content">body</CardContent>);
    expect(screen.getByTestId("content")).toHaveAttribute("data-slot", "card-content");
  });

  it("renders CardFooter", () => {
    render(<CardFooter data-testid="footer">footer</CardFooter>);
    expect(screen.getByTestId("footer")).toHaveAttribute("data-slot", "card-footer");
  });
});
