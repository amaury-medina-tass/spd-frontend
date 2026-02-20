import React from "react";
import { render, screen } from "@testing-library/react";
import {
  renderWithProviders,
  mockAuthValue,
  mockSidebarValue,
  mockNotificationValue,
  flushAsync,
} from "@//test-utils";

// A dummy component that reads auth context
function AuthConsumer() {
  const { useContext } = React;
  const { AuthContext } = require("@/components/auth/AuthProvider");
  const ctx = useContext(AuthContext);
  return (
    <div>
      <span data-testid="user-email">{ctx?.me?.email}</span>
      <span data-testid="loading">{String(ctx?.loading)}</span>
    </div>
  );
}

describe("test-utils exports", () => {
  it("exports mockAuthValue with expected shape", () => {
    expect(mockAuthValue.me).toBeDefined();
    expect(mockAuthValue.me.email).toBe("test@example.com");
    expect(mockAuthValue.loading).toBe(false);
    expect(typeof mockAuthValue.refreshMe).toBe("function");
    expect(typeof mockAuthValue.clear).toBe("function");
  });

  it("mockAuthValue.me has permissions", () => {
    expect(mockAuthValue.me.permissions).toBeDefined();
    expect(mockAuthValue.me.permissions["access-control.users"]).toBeDefined();
    expect(mockAuthValue.me.permissions["access-control.users"].actions.READ.allowed).toBe(true);
  });

  it("mockAuthValue.me has roles", () => {
    expect(mockAuthValue.me.roles).toHaveLength(1);
    expect(mockAuthValue.me.roles[0].name).toBe("Admin");
  });

  it("exports mockSidebarValue with expected shape", () => {
    expect(mockSidebarValue.isOpen).toBe(true);
    expect(mockSidebarValue.isMobile).toBe(false);
    expect(typeof mockSidebarValue.toggleSidebar).toBe("function");
    expect(typeof mockSidebarValue.closeSidebar).toBe("function");
    expect(typeof mockSidebarValue.openSidebar).toBe("function");
  });

  it("exports mockNotificationValue with expected shape", () => {
    expect(mockNotificationValue.notifications).toEqual([]);
    expect(mockNotificationValue.unreadCount).toBe(0);
    expect(typeof mockNotificationValue.markAsRead).toBe("function");
    expect(typeof mockNotificationValue.markAllAsRead).toBe("function");
    expect(mockNotificationValue.loading).toBe(false);
  });
});

describe("renderWithProviders", () => {
  it("wraps children in AuthContext provider", () => {
    renderWithProviders(<AuthConsumer />);
    expect(screen.getByTestId("user-email").textContent).toBe("test@example.com");
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });

  it("allows custom authValue override", () => {
    const custom = {
      ...mockAuthValue,
      me: { ...mockAuthValue.me, email: "custom@example.com" },
    };
    renderWithProviders(<AuthConsumer />, { authValue: custom });
    expect(screen.getByTestId("user-email").textContent).toBe("custom@example.com");
  });

  it("returns render result with container", () => {
    const result = renderWithProviders(<div data-testid="test-child">Hello</div>);
    expect(result.container).toBeTruthy();
    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  it("passes render options through", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    renderWithProviders(<span>Content</span>, { container });
    expect(container.textContent).toBe("Content");
    document.body.removeChild(container);
  });

  it("applies sidebarValue when provided", () => {
    // This exercises the sidebarValue branch in renderWithProviders
    renderWithProviders(<div>Test</div>, { sidebarValue: mockSidebarValue });
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("applies notificationValue when provided", () => {
    // This exercises the notificationValue branch in renderWithProviders
    renderWithProviders(<div>Test</div>, { notificationValue: mockNotificationValue });
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});

describe("flushAsync", () => {
  it("flushes pending microtasks", async () => {
    let resolved = false;
    Promise.resolve().then(() => { resolved = true; });
    await flushAsync();
    expect(resolved).toBe(true);
  });

  it("can be called multiple times", async () => {
    await flushAsync();
    await flushAsync();
    // No errors thrown
  });
});
