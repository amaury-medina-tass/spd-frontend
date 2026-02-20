jest.mock("@/context/SidebarContext", () => jest.requireActual("@/context/SidebarContext"));

import React from "react";
import { renderHook, act } from "@testing-library/react";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SidebarProvider, null, children);

describe("SidebarContext", () => {
  beforeEach(() => {
    // Default to desktop size
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
  });

  it("should throw when useSidebar is used outside provider", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      renderHook(() => useSidebar());
    }).toThrow("useSidebar must be used within a SidebarProvider");
    consoleSpy.mockRestore();
  });

  it("should initialize with isOpen=true on desktop", () => {
    const { result } = renderHook(() => useSidebar(), { wrapper });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.isMobile).toBe(false);
  });

  it("should initialize with isOpen=false on mobile", () => {
    Object.defineProperty(window, "innerWidth", { value: 500, writable: true });
    const { result } = renderHook(() => useSidebar(), { wrapper });
    // Trigger resize
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isOpen).toBe(false);
  });

  it("should toggle sidebar", () => {
    const { result } = renderHook(() => useSidebar(), { wrapper });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggleSidebar();
    });
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggleSidebar();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("should close sidebar", () => {
    const { result } = renderHook(() => useSidebar(), { wrapper });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeSidebar();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("should open sidebar", () => {
    const { result } = renderHook(() => useSidebar(), { wrapper });

    act(() => {
      result.current.closeSidebar();
    });
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.openSidebar();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("should respond to window resize events", () => {
    const { result } = renderHook(() => useSidebar(), { wrapper });

    // Go mobile
    act(() => {
      Object.defineProperty(window, "innerWidth", { value: 500, writable: true });
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isOpen).toBe(false);

    // Go desktop
    act(() => {
      Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isOpen).toBe(true);
  });
});
