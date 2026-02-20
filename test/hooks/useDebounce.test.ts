jest.unmock("@/hooks/useDebounce");

import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello"));
    expect(result.current).toBe("hello");
  });

  it("should debounce value updates", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "hello", delay: 500 } }
    );

    expect(result.current).toBe("hello");

    rerender({ value: "world", delay: 500 });
    // Not yet updated
    expect(result.current).toBe("hello");

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("world");
  });

  it("should use default 500ms delay when none provided", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "b" });
    expect(result.current).toBe("a");

    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(result.current).toBe("a");

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe("b");
  });

  it("should reset timer on rapid value changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "b" });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: "c" });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Still "a" because timer resets
    expect(result.current).toBe("a");

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe("c");
  });

  it("should work with non-string types", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 1 } }
    );

    rerender({ value: 42 });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe(42);
  });
});
