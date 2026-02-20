import { renderHook } from "@testing-library/react";
import { useAuth } from "@/components/auth/useAuth";
import { AuthContext } from "@/components/auth/AuthProvider";
import React from "react";

describe("useAuth", () => {
  it("returns context value when inside provider", () => {
    const value = { me: { id: "1" } as any, loading: false, refreshMe: jest.fn(), clear: jest.fn() };
    const wrapper = ({ children }: any) => (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.me).toEqual({ id: "1" });
  });

  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within AuthProvider");
  });

  it("returns loading value from context", () => {
    const value = { me: null, loading: true, refreshMe: jest.fn(), clear: jest.fn() };
    const wrapper = ({ children }: any) => (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.loading).toBe(true);
  });

  it("provides refreshMe function", () => {
    const refreshMe = jest.fn();
    const value = { me: null, loading: false, refreshMe, clear: jest.fn() };
    const wrapper = ({ children }: any) => (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.refreshMe).toBe(refreshMe);
  });
});
