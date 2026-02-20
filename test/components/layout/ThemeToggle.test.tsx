import { render, screen, fireEvent } from "@testing-library/react";
import { useTheme } from "next-themes";

import { ThemeToggle } from "@/components/layout/ThemeToggle";

describe("ThemeToggle", () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ theme: "light", setTheme: mockSetTheme });
  });

  it("renders toggle button", () => {
    render(<ThemeToggle />);
    expect(screen.getByLabelText(/toggle theme/i)).toBeInTheDocument();
  });

  it("calls setTheme to dark when currently light", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByLabelText(/toggle theme/i));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("calls setTheme to light when currently dark", () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: "dark", setTheme: mockSetTheme });
    render(<ThemeToggle />);
    fireEvent.click(screen.getByLabelText(/toggle theme/i));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });
});
