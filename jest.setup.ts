import "@testing-library/jest-dom";

// ─── Next.js mocks ───
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => "/dashboard"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, priority, loading, ...rest } = props;
    return require("react").createElement("img", rest);
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: any) =>
    require("react").createElement("a", { href, ...rest }, children),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({
      getAll: () => [],
    })
  ),
}));

// ─── HeroUI mocks ───
jest.mock("@heroui/react", () => {
  const React = require("react");
  const c = (name: string) =>
    React.forwardRef(({ children, onPress, onClick, as, href, ...props }: any, ref: any) => {
      const Tag = as || (href ? "a" : "div");
      return React.createElement(
        Tag,
        { ...props, href, onClick: onPress || onClick, ref, "data-testid": props["data-testid"] || name },
        children
      );
    });
  return {
    HeroUIProvider: ({ children }: any) => React.createElement("div", null, children),
    Button: c("Button"),
    Card: c("Card"),
    CardBody: c("CardBody"),
    CardHeader: c("CardHeader"),
    Input: React.forwardRef(({ label, value, onValueChange, endContent, errorMessage, ...props }: any, ref: any) =>
      React.createElement("div", null,
        label && React.createElement("label", null, label),
        React.createElement("input", {
          ...props,
          ref,
          value: value || "",
          onChange: (e: any) => onValueChange?.(e.target.value),
          "aria-label": label,
        }),
        errorMessage && React.createElement("span", null, errorMessage),
        endContent,
      )
    ),
    InputOtp: ({ length, value, onValueChange, ...props }: any) =>
      React.createElement("input", {
        ...props,
        value: value || "",
        onChange: (e: any) => onValueChange?.(e.target.value),
        "data-testid": "input-otp",
      }),
    Link: ({ children, href, onPress, ...props }: any) =>
      React.createElement("a", { href, onClick: onPress, ...props }, children),
    Navbar: c("Navbar"),
    NavbarContent: c("NavbarContent"),
    Dropdown: ({ children }: any) => React.createElement("div", null, children),
    DropdownTrigger: ({ children }: any) => React.createElement("div", null, children),
    DropdownMenu: ({ children }: any) => React.createElement("div", null, children),
    DropdownItem: ({ children, onPress, startContent, ...props }: any) =>
      React.createElement("div", { onClick: onPress, ...props }, startContent, children),
    Avatar: ({ name, ...props }: any) => React.createElement("span", props, name),
    Badge: ({ children, content, ...props }: any) =>
      React.createElement("span", props, children, content && React.createElement("span", null, content)),
    Popover: ({ children }: any) => React.createElement("div", null, children),
    PopoverTrigger: ({ children }: any) => React.createElement("div", null, children),
    PopoverContent: ({ children }: any) => React.createElement("div", null, children),
    ScrollShadow: ({ children, ...props }: any) => React.createElement("div", props, children),
    Divider: () => React.createElement("hr"),
    Tooltip: ({ children, content }: any) => React.createElement("div", { title: content }, children),
    Modal: ({ children, isOpen }: any) => (isOpen ? React.createElement("div", { role: "dialog" }, children) : null),
    ModalContent: ({ children }: any) => {
      if (typeof children === "function") return React.createElement("div", null, children(() => {}));
      return React.createElement("div", null, children);
    },
    ModalHeader: c("ModalHeader"),
    ModalBody: c("ModalBody"),
    ModalFooter: c("ModalFooter"),
    useDisclosure: () => ({ isOpen: false, onOpen: jest.fn(), onClose: jest.fn(), onOpenChange: jest.fn() }),
    Chip: ({ children, ...props }: any) => React.createElement("span", props, children),
    Spinner: (props: any) => React.createElement("div", { ...props, "data-testid": "spinner" }, "Loading..."),
    Select: ({ children, label, selectedKeys, onSelectionChange, ...props }: any) =>
      React.createElement("select", { "aria-label": label, onChange: (e: any) => onSelectionChange?.(new Set([e.target.value])), ...props }, children),
    SelectItem: ({ children, ...props }: any) => React.createElement("option", props, children),
    Tabs: ({ children, onSelectionChange, ...props }: any) => React.createElement("div", props, children),
    Tab: ({ children, ...props }: any) => React.createElement("div", props, children),
    Table: ({ children, ...props }: any) => React.createElement("table", props, children),
    TableHeader: ({ children, columns, ...props }: any) =>
      React.createElement("thead", props,
        React.createElement("tr", null,
          columns
            ? (typeof children === "function" ? columns.map((col: any) => children(col)) : columns.map((col: any) => React.createElement("th", { key: col.key || col.uid }, col.name || col.label)))
            : children
        )),
    TableColumn: ({ children, ...props }: any) => React.createElement("th", props, children),
    TableBody: ({ children, items, ...props }: any) =>
      React.createElement("tbody", props,
        items && typeof children === "function"
          ? items.map((item: any) => children(item))
          : children
      ),
    TableRow: ({ children, ...props }: any) => React.createElement("tr", props, children),
    TableCell: ({ children, ...props }: any) => React.createElement("td", props, children),
    Pagination: (props: any) => React.createElement("nav", { "data-testid": "pagination" }),
    Textarea: React.forwardRef(({ label, value, onValueChange, ...props }: any, ref: any) =>
      React.createElement("textarea", {
        ...props,
        ref,
        value: value || "",
        onChange: (e: any) => onValueChange?.(e.target.value),
        "aria-label": label,
      })
    ),
    Checkbox: ({ children, isSelected, onValueChange, ...props }: any) =>
      React.createElement("label", null,
        React.createElement("input", { type: "checkbox", checked: isSelected, onChange: (e: any) => onValueChange?.(e.target.checked), ...props }),
        children
      ),
    Switch: ({ children, isSelected, onValueChange, ...props }: any) =>
      React.createElement("label", null,
        React.createElement("input", { type: "checkbox", role: "switch", checked: isSelected, onChange: (e: any) => onValueChange?.(e.target.checked), ...props }),
        children
      ),
    Accordion: ({ children }: any) => React.createElement("div", null, children),
    AccordionItem: ({ children, title }: any) => React.createElement("div", null, React.createElement("h3", null, title), children),
    Skeleton: (props: any) => React.createElement("div", { "data-testid": "skeleton", ...props }),
    addToast: jest.fn(),
    DateRangePicker: ({ "aria-label": label, ...props }: any) =>
      React.createElement("div", { "aria-label": label, "data-testid": "date-range-picker", ...props }),
    Progress: ({ value, label, ...props }: any) =>
      React.createElement("div", { "data-testid": "progress", "aria-label": label, ...props }, `${value ?? 0}%`),
    Breadcrumbs: ({ children }: any) => React.createElement("nav", { "aria-label": "breadcrumbs" }, children),
    BreadcrumbItem: ({ children }: any) => React.createElement("span", null, children),
    CardFooter: c("CardFooter"),
    Autocomplete: React.forwardRef(({ label, children, ...props }: any, ref: any) =>
      React.createElement("div", { ...props, ref }, label && React.createElement("label", null, label), children)),
    AutocompleteItem: ({ children, ...props }: any) => React.createElement("div", props, children),
    RadioGroup: ({ children, label, ...props }: any) => React.createElement("fieldset", props, label && React.createElement("legend", null, label), children),
    Radio: ({ children, value, ...props }: any) =>
      React.createElement("label", null, React.createElement("input", { type: "radio", value, ...props }), children),
    DatePicker: React.forwardRef(({ label, ...props }: any, ref: any) =>
      React.createElement("div", { ...props, ref, "data-testid": "date-picker" }, label && React.createElement("label", null, label))),
  };
});

jest.mock("@heroui/toast", () => ({
  addToast: jest.fn(),
  ToastProvider: ({ children }: any) => require("react").createElement("div", null, children),
}));

// ─── next-themes mock ───
jest.mock("next-themes", () => ({
  ThemeProvider: ({ children }: any) => require("react").createElement("div", null, children),
  useTheme: jest.fn(() => ({ theme: "light", setTheme: jest.fn() })),
}));

// ─── lucide-react mock ───
jest.mock("lucide-react", () => {
  const React = require("react");
  return new Proxy(
    {},
    {
      get: (_target: any, prop: string) => {
        if (prop === "__esModule") return true;
        return (props: any) =>
          React.createElement("svg", { "data-testid": `icon-${prop}`, ...props });
      },
    }
  );
});

// ─── react-map-gl/maplibre mock ───
jest.mock("react-map-gl/maplibre", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ children, onClick, ...props }: any) =>
      React.createElement("div", { "data-testid": "map", onClick, ...props }, children),
    Source: ({ children }: any) => React.createElement("div", null, children),
    Layer: () => React.createElement("div"),
    Marker: ({ children }: any) => React.createElement("div", null, children),
  };
});

jest.mock("maplibre-gl", () => ({}));

// ─── recharts mock ───
jest.mock("recharts", () => {
  const React = require("react");
  const ch = (name: string) => ({ children, ...props }: any) =>
    React.createElement("div", { "data-testid": name, ...props }, children);
  return {
    ResponsiveContainer: ch("ResponsiveContainer"),
    BarChart: ch("BarChart"),
    Bar: ch("Bar"),
    LineChart: ch("LineChart"),
    Line: ch("Line"),
    PieChart: ch("PieChart"),
    Pie: ch("Pie"),
    Cell: ch("Cell"),
    XAxis: ch("XAxis"),
    YAxis: ch("YAxis"),
    CartesianGrid: ch("CartesianGrid"),
    Tooltip: ch("Tooltip"),
    Legend: ch("Legend"),
    Area: ch("Area"),
    AreaChart: ch("AreaChart"),
    RadarChart: ch("RadarChart"),
    Radar: ch("Radar"),
    PolarGrid: ch("PolarGrid"),
    PolarAngleAxis: ch("PolarAngleAxis"),
    PolarRadiusAxis: ch("PolarRadiusAxis"),
    Label: ch("Label"),
    ComposedChart: ch("ComposedChart"),
  };
});

// ─── Data mocks (commune/corregimiento JSON) ───
jest.mock("@/data/communes/commune_1.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/communes/commune_2.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/communes/commune_3.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/communes/commune_4.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/communes/commune_5.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/communes/commune_6.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/communes/commune_7.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/communes/commune_8.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/communes/commune_9.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/communes/commune_10.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/communes/commune_11.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/communes/commune_12.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/communes/commune_13.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/communes/commune_14.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/communes/commune_15.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/communes/commune_16.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/corregimientos/corregimiento_50.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/corregimientos/corregimiento_60.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/corregimientos/corregimiento_70.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/corregimientos/corregimiento_80.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });
jest.mock("@/data/corregimientos/corregimiento_90.json", () => ({ type: "FeatureCollection", features: [] }), { virtual: true });

// ─── window mocks ─── (guarded for @jest-environment node)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // IntersectionObserver mock
  class MockIntersectionObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
    constructor(public callback: any, public options?: any) {}
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: MockIntersectionObserver,
  });
  Object.defineProperty(global, "IntersectionObserver", {
    writable: true,
    value: MockIntersectionObserver,
  });
}

// Suppress React act() warnings globally
const originalError = console.error;
console.error = (...args: any[]) => {
  if (typeof args[0] === "string" && args[0].includes("not wrapped in act")) return;
  if (typeof args[0] === "string" && args[0].includes("not recognize the")) return;
  originalError(...args);
};

// ─── Context hook mocks ───
jest.mock("@/context/SidebarContext", () => ({
  SidebarProvider: ({ children }: any) => require("react").createElement("div", null, children),
  useSidebar: jest.fn(() => ({
    isOpen: true,
    isMobile: false,
    toggleSidebar: jest.fn(),
    closeSidebar: jest.fn(),
    openSidebar: jest.fn(),
  })),
}));

jest.mock("@/context/NotificationContext", () => ({
  NotificationProvider: ({ children }: any) => require("react").createElement("div", null, children),
  useNotifications: jest.fn(() => ({
    notifications: [],
    unreadCount: 0,
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    loading: false,
  })),
}));

// ─── Common hooks mocks ───
jest.mock("@/hooks/usePermissions", () => ({
  usePermissions: jest.fn(() => ({
    canRead: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canAssignRole: true,
    canAssignPermission: true,
    canAssignUser: true,
    hasPermission: jest.fn(() => true),
  })),
}));

jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: jest.fn((value: string) => value),
}));

// ─── HTTP & endpoints mocks ───
jest.mock("@/lib/http", () => ({
  get: jest.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } }),
  post: jest.fn().mockResolvedValue({}),
  patch: jest.fn().mockResolvedValue({}),
  del: jest.fn().mockResolvedValue({}),
  HttpError: class HttpError extends Error { data: any; constructor(m: string, d?: any) { super(m); this.data = d; } },
}));

// Endpoints are NOT mocked — service tests use real endpoint paths

jest.mock("@/lib/error-codes", () => ({
  getErrorMessage: jest.fn((code: string) => `Error: ${code}`),
  ErrorCodes: {},
}));

// ─── @internationalized/date mock ───
jest.mock("@internationalized/date", () => ({
  parseDate: jest.fn((d: string) => ({ toString: () => d })),
  CalendarDate: jest.fn(),
  getLocalTimeZone: jest.fn(() => "America/Bogota"),
  today: jest.fn(() => ({ toString: () => "2024-01-01" })),
}));

// ─── Services mocks ───
jest.mock("@/services/exports.service", () => ({
  requestExport: jest.fn().mockResolvedValue(undefined),
}));
