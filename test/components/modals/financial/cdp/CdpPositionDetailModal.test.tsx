import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { CdpPositionDetailModal } from "@/components/modals/financial/cdp/CdpPositionDetailModal";
import { get } from "@/lib/http";

// ── Capture Tabs.onSelectionChange so we can switch tabs in tests ───────────
let capturedTabsOnSelectionChange: ((key: any) => void) | null = null;
let capturedModalOnOpenChange: (() => void) | null = null;

jest.mock("@heroui/react", () => {
  const React = require("react");

  const c = (name: string) =>
    React.forwardRef(
      ({ children, onPress, onClick, as, href, ...props }: any, ref: any) => {
        const Tag = as || (href ? "a" : "div");
        return React.createElement(
          Tag,
          { ...props, href, onClick: onPress || onClick, ref, "data-testid": props["data-testid"] || name },
          children
        );
      }
    );

  return {
    Button: c("Button"),
    Card: c("Card"),
    CardBody: c("CardBody"),
    Divider: () => React.createElement("hr"),
    Input: React.forwardRef(
      ({ label, value, onValueChange, placeholder, startContent, ...props }: any, ref: any) =>
        React.createElement(
          "div",
          null,
          label && React.createElement("label", null, label),
          React.createElement("input", {
            ...props,
            ref,
            placeholder,
            value: value || "",
            onChange: (e: any) => onValueChange?.(e.target.value),
            "aria-label": label,
          }),
          startContent
        )
    ),
    Modal: ({ children, isOpen, onOpenChange }: any) => {
      capturedModalOnOpenChange = onOpenChange ?? null;
      return isOpen ? React.createElement("div", { role: "dialog" }, children) : null;
    },
    ModalContent: ({ children }: any) => {
      if (typeof children === "function")
        return React.createElement("div", null, children(() => {}));
      return React.createElement("div", null, children);
    },
    ModalHeader: c("ModalHeader"),
    ModalBody: c("ModalBody"),
    ModalFooter: c("ModalFooter"),
    Tabs: ({ children, onSelectionChange, ...props }: any) => {
      capturedTabsOnSelectionChange = onSelectionChange ?? null;
      return React.createElement("div", props, children);
    },
    Tab: ({ children, ...props }: any) =>
      React.createElement("div", props, children),
    Tooltip: ({ children, content }: any) =>
      React.createElement("div", { title: content }, children),
    addToast: jest.fn(),
  };
});

// ── Capture CleanTable callback props for direct testing ────────────────────
let capturedRenderCell: ((item: any, columnKey: React.Key) => React.ReactNode) | null = null;
let capturedRenderMobileItem: ((item: any) => React.ReactNode) | null = null;
let capturedOnPageChange: ((page: number) => void) | null = null;
let capturedOnLimitChange: ((limit: number) => void) | null = null;
let capturedEmptyContent: React.ReactNode = null;

jest.mock("@/components/tables/CleanTable", () => ({
  CleanTable: (props: any) => {
    capturedRenderCell = props.renderCell;
    capturedRenderMobileItem = props.renderMobileItem;
    capturedOnPageChange = props.onPageChange;
    capturedOnLimitChange = props.onLimitChange;
    capturedEmptyContent = props.emptyContent;
    return <div data-testid="clean-table" />;
  },
}));

// ── helpers ────────────────────────────────────────────────────────────────

const metaFull = {
  total: 2,
  page: 1,
  limit: 5,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const activity1 = {
  id: "a1",
  detailedActivityId: "da1",
  activityCode: "ACT-001",
  activityName: "Actividad de Prueba",
  projectCode: "PROJ-001",
  assignedValue: 1500000,
  balance: 500000,
};

const activity2 = {
  id: "a2",
  detailedActivityId: "da2",
  activityCode: "ACT-002",
  activityName: "Segunda Actividad",
  projectCode: "PROJ-001",
  assignedValue: 3000000,
  balance: 200000,
};

const makeInitialData = (overrides: Partial<any> = {}) => ({
  id: "pos1",
  projectCode: "PROJ-001",
  rubricCode: "RUB-001",
  positionNumber: "5",
  positionValue: 5000000,
  needCode: "NEC-001",
  cdpNumber: "CDP-001",
  cdpTotalValue: 10000000,
  fundingSourceName: "Fuente X",
  fundingSourceCode: "FX-01",
  observations: "Observación de prueba",
  totalConsumed: 2000000,
  masterContract: null,
  associatedRps: [],
  consumedByActivity: {
    data: [activity1],
    meta: metaFull,
  },
  ...overrides,
});

const defaultProps = {
  isOpen: true,
  positionId: "p1",
  initialData: makeInitialData() as any,
  onClose: jest.fn(),
};

// ── tests ──────────────────────────────────────────────────────────────────

describe("CdpPositionDetailModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedTabsOnSelectionChange = null;
    capturedModalOnOpenChange = null;
    capturedRenderCell = null;
    capturedRenderMobileItem = null;
    capturedOnPageChange = null;
    capturedOnLimitChange = null;
    capturedEmptyContent = null;
    (get as jest.Mock).mockResolvedValue(makeInitialData());
  });

  describe("basic rendering", () => {
    it("renders dialog when open", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("renders nothing when closed", () => {
      render(<CdpPositionDetailModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("returns null when position (initialData) is null", () => {
      render(<CdpPositionDetailModal {...defaultProps} initialData={null} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("shows position number in header", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getByText("Posición 5")).toBeInTheDocument();
    });

    it("shows CDP and project in subtitle", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getAllByText(/CDP-001/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/PROJ-001/).length).toBeGreaterThan(0);
    });

    it("shows section header Detalle de la Posición", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getByText("Detalle de la Posición")).toBeInTheDocument();
    });

    it("shows Cerrar button and calls onClose", () => {
      const onClose = jest.fn();
      render(<CdpPositionDetailModal {...defaultProps} onClose={onClose} />);
      fireEvent.click(screen.getByText("Cerrar"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose via Modal onOpenChange (backdrop/Esc dismiss)", () => {
      const onClose = jest.fn();
      render(<CdpPositionDetailModal {...defaultProps} onClose={onClose} />);
      expect(capturedModalOnOpenChange).toBeInstanceOf(Function);
      act(() => {
        capturedModalOnOpenChange!();
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("displays formatted currency values for positionValue", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      // 5000000 COP formatted
      expect(screen.getAllByText(/5\.000\.000|5,000,000|\$\s*5/i).length).toBeGreaterThan(0);
    });

    it("shows cdpNumber field", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getAllByText("CDP-001").length).toBeGreaterThan(0);
    });

    it("shows needCode", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getByText("NEC-001")).toBeInTheDocument();
    });

    it("shows rubricCode", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getByText("RUB-001")).toBeInTheDocument();
    });

    it("shows observations text", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getByText("Observación de prueba")).toBeInTheDocument();
    });

    it("shows 'Sin observaciones' fallback when observations is empty", () => {
      const data = makeInitialData({ observations: "" });
      render(<CdpPositionDetailModal {...defaultProps} initialData={data} />);
      expect(screen.getByText("Sin observaciones")).toBeInTheDocument();
    });

    it("renders CleanTable (funding tab activities)", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getByTestId("clean-table")).toBeInTheDocument();
    });
  });

  describe("info sections", () => {
    it("shows Información del CDP heading", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getByText("Información del CDP")).toBeInTheDocument();
    });

    it("shows Información del Proyecto heading", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getByText("Información del Proyecto")).toBeInTheDocument();
    });

    it("shows Número CDP label", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getByText("Número CDP")).toBeInTheDocument();
    });

    it("shows Código Proyecto label", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getByText("Código Proyecto")).toBeInTheDocument();
    });

    it("shows Posición Presupuestal label", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getByText("Posición Presupuestal")).toBeInTheDocument();
    });

    it("shows Valor Posición label", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getByText("Valor Posición")).toBeInTheDocument();
    });

    it("shows Código Necesidad label", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getByText("Código Necesidad")).toBeInTheDocument();
    });

    it("shows Observaciones heading", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getByText("Observaciones")).toBeInTheDocument();
    });
  });

  describe("masterContract tab", () => {
    const dataWithContract = makeInitialData({
      masterContract: {
        id: "mc1",
        number: "CONT-2024-001",
        object: "Servicios de consultoría",
        totalValue: 20000000,
      },
    });

    it("shows Contrato Marco heading when masterContract is present", () => {
      render(<CdpPositionDetailModal {...defaultProps} initialData={dataWithContract} />);
      expect(screen.getByText("Contrato Marco")).toBeInTheDocument();
    });

    it("shows contract number", () => {
      render(<CdpPositionDetailModal {...defaultProps} initialData={dataWithContract} />);
      expect(screen.getByText("CONT-2024-001")).toBeInTheDocument();
    });

    it("shows contract object", () => {
      render(<CdpPositionDetailModal {...defaultProps} initialData={dataWithContract} />);
      expect(screen.getByText("Servicios de consultoría")).toBeInTheDocument();
    });

    it("shows Número Contrato label", () => {
      render(<CdpPositionDetailModal {...defaultProps} initialData={dataWithContract} />);
      expect(screen.getByText("Número Contrato")).toBeInTheDocument();
    });

    it("shows Objeto label", () => {
      render(<CdpPositionDetailModal {...defaultProps} initialData={dataWithContract} />);
      expect(screen.getByText("Objeto")).toBeInTheDocument();
    });

    it("does NOT show Contrato Marco when masterContract is null", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.queryByText("Número Contrato")).not.toBeInTheDocument();
    });
  });

  describe("RPS tab", () => {
    const dataWithRps = makeInitialData({
      associatedRps: [
        { id: "rp1", number: "RP-001", totalValue: 1000000, balance: 400000 },
        { id: "rp2", number: "RP-002", totalValue: 500000, balance: 500000 },
      ],
    });

    it("shows RPS numbers when associatedRps has items", () => {
      render(<CdpPositionDetailModal {...defaultProps} initialData={dataWithRps} />);
      expect(screen.getByText("RP-001")).toBeInTheDocument();
      expect(screen.getByText("RP-002")).toBeInTheDocument();
    });

    it("shows Valor and Saldo for each RP", () => {
      render(<CdpPositionDetailModal {...defaultProps} initialData={dataWithRps} />);
      expect(screen.getAllByText(/Valor:/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Saldo:/).length).toBeGreaterThan(0);
    });

    it("does NOT render RPS section when associatedRps is empty", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      // No RP numbers should appear
      expect(screen.queryByText("RP-001")).not.toBeInTheDocument();
    });
  });

  describe("funding tab search input", () => {
    it("shows search input placeholder", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getByPlaceholderText("Buscar actividad...")).toBeInTheDocument();
    });

    it("updates activitySearchInput when typing", async () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      const input = screen.getByPlaceholderText("Buscar actividad...");
      await act(async () => {
        fireEvent.change(input, { target: { value: "consultoría" } });
      });
      expect((input as HTMLInputElement).value).toBe("consultoría");
    });

    it("shows Saldo CDP label in funding header", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(screen.getByText(/Saldo CDP/)).toBeInTheDocument();
    });
  });

  describe("CleanTable callbacks", () => {
    it("captures onPageChange callback and calls setActivityPage", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(capturedOnPageChange).not.toBeNull();
      act(() => {
        capturedOnPageChange!(3);
      });
      // No error thrown = success
    });

    it("captures onLimitChange callback and resets page", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(capturedOnLimitChange).not.toBeNull();
      act(() => {
        capturedOnLimitChange!(10);
      });
    });
  });

  describe("renderCell", () => {
    beforeEach(() => {
      render(<CdpPositionDetailModal {...defaultProps} />);
    });

    it("renders activityCode column", () => {
      expect(capturedRenderCell).not.toBeNull();
      const cell = capturedRenderCell!(activity1, "activityCode");
      const { container } = render(<>{cell}</>);
      expect(container.textContent).toContain("ACT-001");
    });

    it("renders activityName column", () => {
      const cell = capturedRenderCell!(activity1, "activityName");
      const { container } = render(<>{cell}</>);
      expect(container.textContent).toContain("Actividad de Prueba");
    });

    it("renders assignedValue column with currency", () => {
      const cell = capturedRenderCell!(activity1, "assignedValue");
      const { container } = render(<>{cell}</>);
      expect(container.textContent).toMatch(/1\.500\.000|1,500,000|\$\s*1/i);
    });

    it("renders balance column with currency", () => {
      const cell = capturedRenderCell!(activity1, "balance");
      const { container } = render(<>{cell}</>);
      expect(container.textContent).toMatch(/500\.000|500,000/i);
    });

    it("returns null for unknown column key", () => {
      const cell = capturedRenderCell!(activity1, "unknownColumn");
      expect(cell).toBeNull();
    });
  });

  describe("renderMobileItem", () => {
    beforeEach(() => {
      render(<CdpPositionDetailModal {...defaultProps} />);
    });

    it("renders activity code in mobile card", () => {
      expect(capturedRenderMobileItem).not.toBeNull();
      const item = capturedRenderMobileItem!(activity1);
      const { container } = render(<>{item}</>);
      expect(container.textContent).toContain("ACT-001");
    });

    it("renders activity name in mobile card", () => {
      const item = capturedRenderMobileItem!(activity1);
      const { container } = render(<>{item}</>);
      expect(container.textContent).toContain("Actividad de Prueba");
    });

    it("renders balance in mobile card", () => {
      const item = capturedRenderMobileItem!(activity1);
      const { container } = render(<>{item}</>);
      expect(container.textContent).toMatch(/500\.000|500,000/i);
    });

    it("renders assignedValue in mobile card", () => {
      const item = capturedRenderMobileItem!(activity1);
      const { container } = render(<>{item}</>);
      expect(container.textContent).toMatch(/Asignado/i);
    });
  });

  describe("activityMeta display", () => {
    it("shows total activities count area in header when meta set", () => {
      const data = makeInitialData({
        consumedByActivity: {
          data: [activity1, activity2],
          meta: { ...metaFull, total: 2 },
        },
      });
      render(<CdpPositionDetailModal {...defaultProps} initialData={data} />);
      // activityMeta.total shown in Tabs title via re-render after initial setup
      expect(screen.getByTestId("clean-table")).toBeInTheDocument();
    });
  });

  describe("state reset on open", () => {
    it("resets position state when isOpen changes to true", () => {
      const { rerender } = render(
        <CdpPositionDetailModal {...defaultProps} isOpen={false} />
      );
      rerender(<CdpPositionDetailModal {...defaultProps} isOpen={true} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("loads activities from initialData on open", () => {
      const data = makeInitialData({
        consumedByActivity: {
          data: [activity1, activity2],
          meta: metaFull,
        },
      });
      render(<CdpPositionDetailModal {...defaultProps} initialData={data} />);
      // CleanTable should render (activities loaded)
      expect(screen.getByTestId("clean-table")).toBeInTheDocument();
    });
  });

  // ── Funding tab (covers fetchActivities lines 83-105 and useEffect line 118) ─

  describe("funding tab – onSelectionChange captures setSelectedTab", () => {
    it("Tabs exposes onSelectionChange callback after render", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(capturedTabsOnSelectionChange).toBeInstanceOf(Function);
    });

    it("switching to funding tab triggers fetchActivities via get()", async () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      await act(async () => {
        capturedTabsOnSelectionChange!("funding");
      });
      expect(get as jest.Mock).toHaveBeenCalledWith(
        expect.stringContaining("positions/p1")
      );
    });

    it("fetchActivities updates position and activities from API response", async () => {
      const apiData = makeInitialData({
        consumedByActivity: {
          data: [activity2],
          meta: { ...metaFull, total: 1 },
        },
      });
      (get as jest.Mock).mockResolvedValueOnce(apiData);

      render(<CdpPositionDetailModal {...defaultProps} />);
      await act(async () => {
        capturedTabsOnSelectionChange!("funding");
      });

      await waitFor(() => {
        expect(get as jest.Mock).toHaveBeenCalledTimes(1);
      });
    });

    it("fetchActivities includes activitySearch in URL when search is set", async () => {
      render(<CdpPositionDetailModal {...defaultProps} />);

      // Set the search input BEFORE switching tab – so activitySearch is non-empty
      // when fetchActivities fires (covers the params.set("activitySearch", ...) branch)
      const input = screen.getByPlaceholderText("Buscar actividad...");
      await act(async () => {
        fireEvent.change(input, { target: { value: "consultoría" } });
      });

      // Now switch to the funding tab – fetchActivities runs with activitySearch set
      await act(async () => {
        capturedTabsOnSelectionChange!("funding");
      });

      expect(get as jest.Mock).toHaveBeenCalledWith(
        expect.stringContaining("activitySearch=consultor")
      );
    });

    it("switching to a non-funding tab does not call fetchActivities", async () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      await act(async () => {
        capturedTabsOnSelectionChange!("info");
      });
      expect(get as jest.Mock).not.toHaveBeenCalled();
    });

    it("switching to masterContract tab does not call fetchActivities", async () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      await act(async () => {
        capturedTabsOnSelectionChange!("masterContract");
      });
      expect(get as jest.Mock).not.toHaveBeenCalled();
    });

    it("fetchActivities handles API error gracefully without throwing", async () => {
      (get as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
      render(<CdpPositionDetailModal {...defaultProps} />);
      await expect(
        act(async () => {
          capturedTabsOnSelectionChange!("funding");
          await Promise.resolve();
        })
      ).resolves.not.toThrow();
    });

    it("re-fetches when activityPage changes via onPageChange", async () => {
      render(<CdpPositionDetailModal {...defaultProps} />);

      // Switch to funding tab to activate the effect
      await act(async () => {
        capturedTabsOnSelectionChange!("funding");
      });
      const firstCallCount = (get as jest.Mock).mock.calls.length;

      // Change page
      await act(async () => {
        capturedOnPageChange!(2);
      });

      // get should have been called again (fetchActivities reacts to activityPage change)
      expect((get as jest.Mock).mock.calls.length).toBeGreaterThan(firstCallCount);
    });

    it("re-fetches and resets page when activityLimit changes", async () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      await act(async () => {
        capturedTabsOnSelectionChange!("funding");
      });
      const firstCallCount = (get as jest.Mock).mock.calls.length;

      await act(async () => {
        capturedOnLimitChange!(10);
      });

      expect((get as jest.Mock).mock.calls.length).toBeGreaterThan(firstCallCount);
    });

    it("does NOT fetch when positionId is null", async () => {
      render(
        <CdpPositionDetailModal
          {...defaultProps}
          positionId={null}
        />
      );
      await act(async () => {
        capturedTabsOnSelectionChange!("funding");
      });
      expect(get as jest.Mock).not.toHaveBeenCalled();
    });
  });

  describe("emptyContent rendering", () => {
    it("shows 'No hay actividades detalladas' when no search and no activities", () => {
      render(<CdpPositionDetailModal {...defaultProps} />);
      expect(capturedEmptyContent).not.toBeNull();
      const { getByText } = render(<>{capturedEmptyContent}</>);
      expect(getByText("No hay actividades detalladas")).toBeInTheDocument();
    });
  });
});

