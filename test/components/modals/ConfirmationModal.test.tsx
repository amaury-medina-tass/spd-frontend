import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";

jest.mock("@heroui/react", () => {
  const React = require("react");
  return {
    Modal: ({ children, isOpen, onOpenChange }: any) =>
      isOpen
        ? React.createElement(
            "div",
            { role: "dialog" },
            children,
            React.createElement("button", { "data-testid": "modal-close-trigger", onClick: () => onOpenChange?.() }, "X")
          )
        : null,
    ModalContent: ({ children }: any) => React.createElement("div", null, children),
    ModalHeader: ({ children }: any) => React.createElement("div", null, children),
    ModalBody: ({ children }: any) => React.createElement("div", null, children),
    ModalFooter: ({ children }: any) => React.createElement("div", null, children),
    Button: ({ children, onPress, isDisabled, startContent }: any) =>
      React.createElement("button", { onClick: onPress, disabled: isDisabled }, startContent, children),
    Spinner: () => React.createElement("div", { "data-testid": "spinner" }, "Loading..."),
  };
});

describe("ConfirmationModal", () => {
  const baseProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: "Confirmar acción",
    description: "¿Está seguro?",
  };

  it("renders title and description when open", () => {
    render(<ConfirmationModal {...baseProps} />);
    expect(screen.getByText("Confirmar acción")).toBeInTheDocument();
    expect(screen.getByText("¿Está seguro?")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<ConfirmationModal {...baseProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders default cancel button", () => {
    render(<ConfirmationModal {...baseProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("renders default confirm button", () => {
    render(<ConfirmationModal {...baseProps} />);
    expect(screen.getByText("Confirmar")).toBeInTheDocument();
  });

  it("renders custom cancelText", () => {
    render(<ConfirmationModal {...baseProps} cancelText="Volver" />);
    expect(screen.getByText("Volver")).toBeInTheDocument();
  });

  it("renders custom confirmText", () => {
    render(<ConfirmationModal {...baseProps} confirmText="Eliminar" />);
    expect(screen.getByText("Eliminar")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button pressed", () => {
    const onConfirm = jest.fn();
    render(<ConfirmationModal {...baseProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText("Confirmar"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("calls onClose when cancel button pressed", () => {
    const onClose = jest.fn();
    render(<ConfirmationModal {...baseProps} onClose={onClose} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(onClose).toHaveBeenCalled();
  });

  it("onOpenChange calls onClose when not loading", () => {
    const onClose = jest.fn();
    render(<ConfirmationModal {...baseProps} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("modal-close-trigger"));
    expect(onClose).toHaveBeenCalled();
  });

  it("onOpenChange does not call onClose when isLoading", () => {
    const onClose = jest.fn();
    render(<ConfirmationModal {...baseProps} isLoading={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("modal-close-trigger"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("isLoading shows spinner in confirm button", () => {
    render(<ConfirmationModal {...baseProps} isLoading={true} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("cancel button is disabled when isLoading", () => {
    render(<ConfirmationModal {...baseProps} isLoading={true} />);
    expect(screen.getByText("Cancelar").closest("button")).toBeDisabled();
  });
});
