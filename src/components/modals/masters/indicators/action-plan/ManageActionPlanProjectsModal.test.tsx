import { render, screen } from "@testing-library/react";
import { ManageActionPlanProjectsModal } from "./ManageActionPlanProjectsModal";

jest.mock("./projects/AssociatedProjectsTab", () => ({
  AssociatedProjectsTab: () => <div>AssociatedProjectsTab</div>,
}));
jest.mock("./projects/AvailableProjectsTab", () => ({
  AvailableProjectsTab: () => <div>AvailableProjectsTab</div>,
}));

const defaultProps = {
  isOpen: true,
  indicatorId: "i1",
  indicatorCode: "IND-001",
  onClose: jest.fn(),
};

describe("ManageActionPlanProjectsModal", () => {
  it("renders when open", () => {
    render(<ManageActionPlanProjectsModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<ManageActionPlanProjectsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders Gestionar Proyectos header", () => {
    render(<ManageActionPlanProjectsModal {...defaultProps} />);
    expect(screen.getByText("Gestionar Proyectos")).toBeInTheDocument();
  });

  it("shows indicator code in header", () => {
    render(<ManageActionPlanProjectsModal {...defaultProps} />);
    expect(screen.getByText(/IND-001/)).toBeInTheDocument();
  });

  it("renders AssociatedProjectsTab by default", () => {
    render(<ManageActionPlanProjectsModal {...defaultProps} />);
    expect(screen.getByText("AssociatedProjectsTab")).toBeInTheDocument();
  });

  it("renders without indicatorCode", () => {
    render(<ManageActionPlanProjectsModal isOpen={true} indicatorId="i1" onClose={jest.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
