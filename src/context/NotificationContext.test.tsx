jest.mock("@/context/NotificationContext", () => jest.requireActual("@/context/NotificationContext"));

jest.mock("@/lib/http", () => ({
  get: jest.fn(),
  patch: jest.fn(),
}));
jest.mock("@/lib/endpoints", () => ({
  endpoints: {
    auth: { wsToken: "/public/auth/ws-token" },
    notifications: {
      list: "/public/notifications",
      unreadCount: "/public/notifications/unread-count",
      markRead: (id: string) => `/public/notifications/${id}/read`,
      readAll: "/public/notifications/read-all",
    },
  },
}));

// Socket mock that captures event handlers
let socketHandlers: Record<string, Function> = {};
const mockSocket = {
  on: jest.fn((event: string, handler: Function) => {
    socketHandlers[event] = handler;
  }),
  disconnect: jest.fn(),
};
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => mockSocket),
}));

jest.mock("@heroui/toast", () => ({
  addToast: jest.fn(),
}));

import React from "react";
import { render, renderHook, act, waitFor, fireEvent } from "@testing-library/react";
import { NotificationProvider, useNotifications } from "./NotificationContext";
import { get, patch } from "@/lib/http";
import { addToast } from "@heroui/toast";

const mockGet = get as jest.Mock;
const mockPatch = patch as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(NotificationProvider, null, children);

describe("NotificationContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    socketHandlers = {};
    // Re-implement socket.on handler capture after clearAllMocks
    mockSocket.on.mockImplementation((event: string, handler: Function) => {
      socketHandlers[event] = handler;
    });

    // Default: API succeeds with empty data
    mockGet.mockImplementation((url: string) => {
      if (url.includes("unread-count")) return Promise.resolve({ count: 3 });
      if (url.includes("notifications")) return Promise.resolve([]);
      if (url.includes("ws-token")) return Promise.resolve({ token: "test-token" });
      return Promise.resolve({});
    });
    mockPatch.mockResolvedValue({});
  });

  it("should provide default context values", () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.connected).toBe(false);
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it("should fetch notifications on mount", async () => {
    const notifications = [
      { id: "1", user_id: "u1", event: "Test", title: "T", message: "M", is_read: false, created_at: "" },
    ];
    mockGet.mockImplementation((url: string) => {
      if (url.includes("unread-count")) return Promise.resolve({ count: 1 });
      if (url.includes("notifications") && url.includes("limit")) return Promise.resolve(notifications);
      if (url.includes("ws-token")) return Promise.resolve({ token: "t" });
      return Promise.resolve({});
    });

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notifications).toEqual(notifications);
    expect(result.current.unreadCount).toBe(1);
  });

  it("should clear notifications", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes("unread-count")) return Promise.resolve({ count: 2 });
      if (url.includes("notifications") && url.includes("limit"))
        return Promise.resolve([{ id: "1" }]);
      if (url.includes("ws-token")) return Promise.resolve({ token: "t" });
      return Promise.resolve({});
    });

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.notifications.length).toBe(1);
    });

    act(() => {
      result.current.clearNotifications();
    });

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it("should mark a single notification as read", async () => {
    const notifications = [
      { id: "n1", user_id: "u1", event: "E", title: "T", message: "M", is_read: false, created_at: "" },
      { id: "n2", user_id: "u1", event: "E", title: "T", message: "M", is_read: false, created_at: "" },
    ];
    mockGet.mockImplementation((url: string) => {
      if (url.includes("unread-count")) return Promise.resolve({ count: 2 });
      if (url.includes("notifications") && url.includes("limit")) return Promise.resolve(notifications);
      if (url.includes("ws-token")) return Promise.resolve({ token: "t" });
      return Promise.resolve({});
    });

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.notifications.length).toBe(2);
    });

    await act(async () => {
      await result.current.markAsRead("n1");
    });

    expect(mockPatch).toHaveBeenCalledWith("/public/notifications/n1/read");
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.notifications.find((n) => n.id === "n1")?.is_read).toBe(true);
  });

  it("should mark all notifications as read", async () => {
    const notifications = [
      { id: "n1", user_id: "u1", event: "E", title: "T", message: "M", is_read: false, created_at: "" },
    ];
    mockGet.mockImplementation((url: string) => {
      if (url.includes("unread-count")) return Promise.resolve({ count: 1 });
      if (url.includes("notifications") && url.includes("limit")) return Promise.resolve(notifications);
      if (url.includes("ws-token")) return Promise.resolve({ token: "t" });
      return Promise.resolve({});
    });

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(1);
    });

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(mockPatch).toHaveBeenCalledWith("/public/notifications/read-all");
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications.every((n) => n.is_read)).toBe(true);
  });

  it("should refresh notifications", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes("unread-count")) return Promise.resolve({ count: 0 });
      if (url.includes("notifications") && url.includes("limit")) return Promise.resolve([]);
      if (url.includes("ws-token")) return Promise.resolve({ token: "t" });
      return Promise.resolve({});
    });

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refreshNotifications();
    });

    const notifCalls = mockGet.mock.calls.filter(
      (c: any[]) => c[0].includes("notifications")
    );
    expect(notifCalls.length).toBeGreaterThanOrEqual(2);
  });

  it("should handle fetch errors gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockRejectedValue(new Error("API down"));

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notifications).toEqual([]);
    consoleSpy.mockRestore();
  });

  it("should handle markAsRead errors gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockImplementation((url: string) => {
      if (url.includes("unread-count")) return Promise.resolve({ count: 1 });
      if (url.includes("notifications") && url.includes("limit"))
        return Promise.resolve([{ id: "1", is_read: false }]);
      if (url.includes("ws-token")) return Promise.resolve({ token: "t" });
      return Promise.resolve({});
    });
    mockPatch.mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.markAsRead("1");
    });

    expect(result.current.unreadCount).toBe(1);
    consoleSpy.mockRestore();
  });

  // ---- WebSocket events ----

  it("should set connected to true on socket connect event", async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(socketHandlers["connect"]).toBeDefined());

    act(() => socketHandlers["connect"]());
    expect(result.current.connected).toBe(true);
  });

  it("should set connected to false on socket disconnect event", async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(socketHandlers["connect"]).toBeDefined());

    act(() => socketHandlers["connect"]());
    expect(result.current.connected).toBe(true);

    act(() => socketHandlers["disconnect"]());
    expect(result.current.connected).toBe(false);
  });

  it("should disconnect socket on unmount", async () => {
    const { unmount } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(socketHandlers["connect"]).toBeDefined());

    unmount();
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  // ---- Notification toast colors ----

  it("should show success toast for Completed event", async () => {
    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(socketHandlers["notification"]).toBeDefined());

    await act(async () => {
      socketHandlers["notification"]({
        id: "n1", event: "Task.Completed", title: "Done", message: "Task done",
        timestamp: new Date().toISOString(),
      });
    });

    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Done", color: "success", timeout: 8000 })
    );
  });

  it("should show success toast for Created event", async () => {
    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(socketHandlers["notification"]).toBeDefined());

    await act(async () => {
      socketHandlers["notification"]({
        id: "n2", event: "Resource.Created", title: "Created", message: "Resource created",
        timestamp: new Date().toISOString(),
      });
    });

    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ color: "success" })
    );
  });

  it("should show danger toast for Failed event", async () => {
    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(socketHandlers["notification"]).toBeDefined());

    await act(async () => {
      socketHandlers["notification"]({
        id: "n3", event: "Import.Failed", title: "Error", message: "Import failed",
        timestamp: new Date().toISOString(),
      });
    });

    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ color: "danger" })
    );
  });

  it("should show warning toast for Sync event", async () => {
    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(socketHandlers["notification"]).toBeDefined());

    await act(async () => {
      socketHandlers["notification"]({
        id: "n4", event: "Data.Sync", title: "Sync", message: "Syncing",
        timestamp: new Date().toISOString(),
      });
    });

    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ color: "warning" })
    );
  });

  it("should show primary toast for generic event", async () => {
    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(socketHandlers["notification"]).toBeDefined());

    await act(async () => {
      socketHandlers["notification"]({
        id: "n5", event: "Custom.Event", title: "Info", message: "Something happened",
        timestamp: new Date().toISOString(),
      });
    });

    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ color: "primary" })
    );
  });

  // ---- ExportCompleted notification ----

  it("should show download toast for ExportCompleted with downloadUrl", async () => {
    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(socketHandlers["notification"]).toBeDefined());

    await act(async () => {
      socketHandlers["notification"]({
        id: "exp1", event: "Files.ExportCompleted", title: "Export Ready",
        message: "File is ready",
        data: { downloadUrl: "https://example.com/file.xlsx", fileName: "report.xlsx" },
        timestamp: new Date().toISOString(),
      });
    });

    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Export Ready", color: "success", timeout: 15000,
        endContent: expect.anything(),
      })
    );
  });

  it("should show regular toast for ExportCompleted without downloadUrl", async () => {
    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(socketHandlers["notification"]).toBeDefined());

    await act(async () => {
      socketHandlers["notification"]({
        id: "exp2", event: "Files.ExportCompleted", title: "Export", message: "Done",
        data: {},
        timestamp: new Date().toISOString(),
      });
    });

    // Falls through to non-download toast
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ timeout: 8000 })
    );
  });

  it("should trigger download when clicking endContent button", async () => {
    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(socketHandlers["notification"]).toBeDefined());

    await act(async () => {
      socketHandlers["notification"]({
        id: "exp3", event: "Files.ExportCompleted", title: "Export",
        message: "Ready",
        data: { downloadUrl: "https://example.com/file.xlsx", fileName: "report.xlsx" },
        timestamp: new Date().toISOString(),
      });
    });

    const call = (addToast as jest.Mock).mock.calls.find(
      (c: any[]) => c[0]?.endContent
    );
    expect(call).toBeDefined();

    // Render and click the download button — exercises triggerDownload
    const { getByText } = render(call[0].endContent);
    expect(() => fireEvent.click(getByText("Descargar"))).not.toThrow();
  });

  it("should use default fileName for ExportCompleted without fileName", async () => {
    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(socketHandlers["notification"]).toBeDefined());

    await act(async () => {
      socketHandlers["notification"]({
        id: "exp4", event: "Files.ExportCompleted", title: "Export",
        message: "Ready",
        data: { downloadUrl: "https://example.com/file.xlsx" },
        timestamp: new Date().toISOString(),
      });
    });

    const call = (addToast as jest.Mock).mock.calls.find(
      (c: any[]) => c[0]?.endContent
    );
    expect(call).toBeDefined();
    // Renders without errors — fileName defaults to "export.xlsx"
    const { getByText } = render(call[0].endContent);
    expect(() => fireEvent.click(getByText("Descargar"))).not.toThrow();
  });

  // ---- Notification side effects ----

  it("should increment unread count on notification", async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(socketHandlers["notification"]).toBeDefined());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const initial = result.current.unreadCount;

    await act(async () => {
      socketHandlers["notification"]({
        id: "n10", event: "Info", title: "T", message: "M",
        timestamp: new Date().toISOString(),
      });
    });

    expect(result.current.unreadCount).toBe(initial + 1);
  });

  it("should refresh notifications after receiving notification event", async () => {
    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(socketHandlers["notification"]).toBeDefined());

    const callsBefore = mockGet.mock.calls.length;

    await act(async () => {
      socketHandlers["notification"]({
        id: "n11", event: "Info", title: "T", message: "M",
        timestamp: new Date().toISOString(),
      });
    });

    await waitFor(() => {
      expect(mockGet.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  it("should handle notification refresh error gracefully", async () => {
    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(socketHandlers["notification"]).toBeDefined());

    // Make notification list refresh fail
    mockGet.mockImplementation((url: string) => {
      if (url.includes("notifications") && url.includes("limit"))
        return Promise.reject(new Error("Network error"));
      return Promise.resolve({});
    });

    // Should not throw
    await act(async () => {
      socketHandlers["notification"]({
        id: "n12", event: "Info", title: "T", message: "M",
        timestamp: new Date().toISOString(),
      });
    });

    expect(addToast).toHaveBeenCalled();
  });

  // ---- Auth/token ----

  it("should not create socket when ws-token fetch fails", async () => {
    const { io } = require("socket.io-client");
    io.mockClear();

    mockGet.mockImplementation((url: string) => {
      if (url.includes("ws-token")) return Promise.reject(new Error("Auth failed"));
      if (url.includes("unread-count")) return Promise.resolve({ count: 0 });
      if (url.includes("notifications")) return Promise.resolve([]);
      return Promise.resolve({});
    });

    renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      const wsCalls = mockGet.mock.calls.filter((c: any[]) => c[0].includes("ws-token"));
      expect(wsCalls.length).toBeGreaterThanOrEqual(1);
    });

    // io should not have been called since token failed
    expect(io).not.toHaveBeenCalled();
  });

  it("should handle markAllAsRead errors gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockImplementation((url: string) => {
      if (url.includes("unread-count")) return Promise.resolve({ count: 2 });
      if (url.includes("notifications") && url.includes("limit"))
        return Promise.resolve([{ id: "1", is_read: false }]);
      if (url.includes("ws-token")) return Promise.resolve({ token: "t" });
      return Promise.resolve({});
    });
    mockPatch.mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAllAsRead();
    });

    // Should not crash, unread count stays original
    expect(result.current.unreadCount).toBe(2);
    consoleSpy.mockRestore();
  });

  it("should handle null responses from API", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes("unread-count")) return Promise.resolve(null);
      if (url.includes("notifications") && url.includes("limit")) return Promise.resolve(null);
      if (url.includes("ws-token")) return Promise.resolve({ token: "t" });
      return Promise.resolve({});
    });

    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it("should show Approved event with success color", async () => {
    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(socketHandlers["notification"]).toBeDefined());

    await act(async () => {
      socketHandlers["notification"]({
        id: "n20", event: "Request.Approved", title: "Approved", message: "Approved",
        timestamp: new Date().toISOString(),
      });
    });

    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ color: "success" })
    );
  });
});
