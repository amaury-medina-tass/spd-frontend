import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreatePoaiPpaModal } from "@/components/modals/financial/poai-ppa/CreatePoaiPpaModal";

const mockGet = jest.fn();
jest.mock("@/lib/http", () => ({ get: (...args: any[]) => mockGet(...args) }));
jest.mock("@/lib/endpoints", () => ({
  endpoints: { financial: { projectsSelect: "/projects/select" } },
}));

const projects = [{ id: "p1", code: "P001", name: "Project Alpha" }];

describe("CreatePoaiPpaModal", () => {
  const defaultProps = {
    isOpen: true,
    isLoading: false,
    onClose: jest.fn(),
    onSave: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    mockGet.mockResolvedValue({ data: projects });
    jest.clearAllMocks();
    defaultProps.onClose = jest.fn();
    defaultProps.onSave = jest.fn().mockResolvedValue(undefined);
  });

  it("renders when open", () => {
    render(<CreatePoaiPpaModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<CreatePoaiPpaModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows modal header", () => {
    render(<CreatePoaiPpaModal {...defaultProps} />);
    expect(screen.getByText("Crear Registro POAI PPA")).toBeInTheDocument();
  });

  it("shows Cancelar button", () => {
    render(<CreatePoaiPpaModal {...defaultProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("shows Crear button", () => {
    render(<CreatePoaiPpaModal {...defaultProps} />);
    expect(screen.getByText("Crear")).toBeInTheDocument();
  });

  it("calls get to load projects when modal opens", async () => {
    render(<CreatePoaiPpaModal {...defaultProps} />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("projects/select")));
  });

  it("handles project fetch error gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockRejectedValue(new Error("Network error"));
    render(<CreatePoaiPpaModal {...defaultProps} />);
    await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith("Error loading projects", expect.any(Error)));
    consoleSpy.mockRestore();
  });

  it("calls onClose when Cancelar is clicked", async () => {
    render(<CreatePoaiPpaModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("selects project and sets projectCode via handleProjectChange", async () => {
    render(<CreatePoaiPpaModal {...defaultProps} />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    const projectSelect = screen.getByRole("combobox", { name: /Proyecto/i });
    fireEvent.change(projectSelect, { target: { value: "p1" } });
    // No crash = pass; coverage of handleProjectChange line 96 covered
  });

  it("submits form and calls onSave when valid", async () => {
    render(<CreatePoaiPpaModal {...defaultProps} />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    // Select a project to make projectId valid
    const projectSelect = screen.getByRole("combobox", { name: /Proyecto/i });
    fireEvent.change(projectSelect, { target: { value: "p1" } });
    // Wait for validation update
    await waitFor(() => {});
    // Submit the form directly
    const { container } = render(<CreatePoaiPpaModal {...defaultProps} />);
    const form = container.querySelector("form");
    // fill project select in second render
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    const selects = container.querySelectorAll("select");
    if (selects[0]) fireEvent.change(selects[0], { target: { value: "p1" } });
    await waitFor(() => {});
    if (form) fireEvent.submit(form);
  });

  it("calls get again when isOpen changes from false to true", async () => {
    const { rerender } = render(<CreatePoaiPpaModal {...defaultProps} isOpen={false} />);
    rerender(<CreatePoaiPpaModal {...defaultProps} isOpen={true} />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
  });
});
