import { render, screen, fireEvent } from "@testing-library/react";
import { ManageDetailedActivitiesModal } from "@/components/modals/masters/activities/mga/ManageDetailedActivitiesModal";

jest.mock("@/components/modals/masters/activities/mga/tabs/AssociatedDetailedActivitiesTab", () => ({
  AssociatedDetailedActivitiesTab: () => <div>AssociatedTab</div>,
}));
jest.mock("@/components/modals/masters/activities/mga/tabs/AvailableDetailedActivitiesTab", () => ({
  AvailableDetailedActivitiesTab: () => <div>AvailableTab</div>,
}));

describe("ManageDetailedActivitiesModal", () => {
  const defaultProps = {
    isOpen: true,
    mgaActivityId: "m1",
    mgaActivityCode: "MGA-001",
    onClose: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    defaultProps.onClose = jest.fn();
    defaultProps.onSuccess = jest.fn();
  });

  it("renders when open", () => {
    render(<ManageDetailedActivitiesModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<ManageDetailedActivitiesModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows modal title", () => {
    render(<ManageDetailedActivitiesModal {...defaultProps} />);
    expect(screen.getByText("Gestionar Actividades Detalladas")).toBeInTheDocument();
  });

  it("shows mgaActivityCode", () => {
    render(<ManageDetailedActivitiesModal {...defaultProps} />);
    expect(screen.getByText("MGA-001")).toBeInTheDocument();
  });

  it("shows first tab content (AssociatedTab)", () => {
    render(<ManageDetailedActivitiesModal {...defaultProps} />);
    expect(screen.getByText("AssociatedTab")).toBeInTheDocument();
  });

  it("shows Cerrar button", () => {
    render(<ManageDetailedActivitiesModal {...defaultProps} />);
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  it("calls onSuccess and onClose when Cerrar is clicked (covers handleClose lines 33-34)", () => {
    render(<ManageDetailedActivitiesModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Cerrar"));
    expect(defaultProps.onSuccess).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onClose without error when onSuccess is undefined (covers optional chain line 33)", () => {
    render(<ManageDetailedActivitiesModal {...defaultProps} onSuccess={undefined} />);
    fireEvent.click(screen.getByText("Cerrar"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("renders without mgaActivityCode", () => {
    render(<ManageDetailedActivitiesModal {...defaultProps} mgaActivityCode={undefined} />);
    expect(screen.getByText("Gestionar Actividades Detalladas")).toBeInTheDocument();
    expect(screen.queryByText("MGA-001")).not.toBeInTheDocument();
  });
});
