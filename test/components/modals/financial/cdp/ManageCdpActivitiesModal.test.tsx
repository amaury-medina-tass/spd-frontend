import { render, screen, fireEvent } from "@testing-library/react";
import { ManageCdpActivitiesModal } from "@/components/modals/financial/cdp/ManageCdpActivitiesModal";

jest.mock("@/components/modals/financial/cdp/activities/AssociatedCdpActivitiesTab", () => ({
  AssociatedCdpActivitiesTab: ({ positionId }: any) => (
    <div data-testid="associated-tab">AssociatedTab-{positionId}</div>
  ),
}));
jest.mock("@/components/modals/financial/cdp/activities/AvailableCdpActivitiesTab", () => ({
  AvailableCdpActivitiesTab: ({ positionId }: any) => (
    <div data-testid="available-tab">AvailableTab-{positionId}</div>
  ),
}));

describe("ManageCdpActivitiesModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders dialog when open", () => {
      render(<ManageCdpActivitiesModal isOpen={true} positionId="p1" onClose={jest.fn()} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("renders nothing when closed", () => {
      render(<ManageCdpActivitiesModal isOpen={false} positionId="p1" onClose={jest.fn()} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("shows header title", () => {
      render(<ManageCdpActivitiesModal isOpen={true} positionId="p1" onClose={jest.fn()} />);
      expect(screen.getByText("Gestionar Actividades Detalladas")).toBeInTheDocument();
    });

    it("shows AssociatedCdpActivitiesTab with positionId", () => {
      render(<ManageCdpActivitiesModal isOpen={true} positionId="pos-42" onClose={jest.fn()} />);
      expect(screen.getByTestId("associated-tab")).toBeInTheDocument();
      expect(screen.getByText("AssociatedTab-pos-42")).toBeInTheDocument();
    });

    it("shows AvailableCdpActivitiesTab with positionId", () => {
      render(<ManageCdpActivitiesModal isOpen={true} positionId="pos-42" onClose={jest.fn()} />);
      expect(screen.getByTestId("available-tab")).toBeInTheDocument();
      expect(screen.getByText("AvailableTab-pos-42")).toBeInTheDocument();
    });

    it("shows Cerrar button", () => {
      render(<ManageCdpActivitiesModal isOpen={true} positionId="p1" onClose={jest.fn()} />);
      expect(screen.getByText("Cerrar")).toBeInTheDocument();
    });
  });

  describe("positionNumber prop", () => {
    it("does NOT show position number when positionNumber is not provided", () => {
      render(<ManageCdpActivitiesModal isOpen={true} positionId="p1" onClose={jest.fn()} />);
      expect(screen.queryByText(/Posición #/)).not.toBeInTheDocument();
    });

    it("shows positionNumber when provided", () => {
      render(
        <ManageCdpActivitiesModal
          isOpen={true}
          positionId="p1"
          positionNumber="007"
          onClose={jest.fn()}
        />
      );
      expect(screen.getByText("Posición #007")).toBeInTheDocument();
    });
  });

  describe("handleClose", () => {
    it("calls onClose when Cerrar button is clicked", () => {
      const onClose = jest.fn();
      render(<ManageCdpActivitiesModal isOpen={true} positionId="p1" onClose={onClose} />);
      fireEvent.click(screen.getByText("Cerrar"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onSuccess before onClose when Cerrar is clicked", () => {
      const onClose = jest.fn();
      const onSuccess = jest.fn();
      const callOrder: string[] = [];
      onSuccess.mockImplementation(() => callOrder.push("success"));
      onClose.mockImplementation(() => callOrder.push("close"));

      render(
        <ManageCdpActivitiesModal
          isOpen={true}
          positionId="p1"
          onClose={onClose}
          onSuccess={onSuccess}
        />
      );
      fireEvent.click(screen.getByText("Cerrar"));
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(callOrder).toEqual(["success", "close"]);
    });

    it("does not throw when onSuccess is not provided and Cerrar clicked", () => {
      const onClose = jest.fn();
      render(<ManageCdpActivitiesModal isOpen={true} positionId="p1" onClose={onClose} />);
      expect(() => fireEvent.click(screen.getByText("Cerrar"))).not.toThrow();
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("handles null positionId gracefully", () => {
      render(
        <ManageCdpActivitiesModal isOpen={true} positionId={null} onClose={jest.fn()} />
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
