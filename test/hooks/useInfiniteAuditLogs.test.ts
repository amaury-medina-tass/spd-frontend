jest.mock("@/lib/http", () => ({
  get: jest.fn(),
  PaginatedData: {},
}));

import { renderHook, act } from "@testing-library/react";
import { useInfiniteAuditLogs, AuditFilters } from "@/hooks/useInfiniteAuditLogs";
import { get } from "@/lib/http";

const mockGet = get as jest.Mock;

/** Flush all pending microtasks / resolved promises inside act() */
const flushAsync = () => act(async () => {
  await new Promise(resolve => setTimeout(resolve, 0));
});

const createPaginatedResponse = (data: any[], page: number, hasNextPage: boolean) => ({
  data,
  meta: {
    page,
    limit: 20,
    total: hasNextPage ? 100 : data.length,
    totalPages: hasNextPage ? 5 : page,
    hasNextPage,
    hasPreviousPage: page > 1,
  },
});

describe("useInfiniteAuditLogs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch initial logs on mount", async () => {
    const logs = [{ id: "1", action: "CREATE", entity: "User" }];
    mockGet.mockResolvedValue(createPaginatedResponse(logs, 1, true));

    const { result } = renderHook(() => useInfiniteAuditLogs());
    await flushAsync();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.logs).toEqual(logs);
    expect(result.current.meta).toBeDefined();
    expect(result.current.hasMore).toBe(true);
    expect(mockGet).toHaveBeenCalled();
  });

  it("should start with default filters", async () => {
    mockGet.mockResolvedValue(createPaginatedResponse([], 1, false));

    const { result } = renderHook(() => useInfiniteAuditLogs());

    expect(result.current.filters).toEqual({
      search: "",
      action: "",
      entityType: "",
      system: "",
      startDate: "",
      endDate: "",
      sortBy: "timestamp",
      sortOrder: "DESC",
    });

    await flushAsync();
  });

  it("should merge default filters", async () => {
    mockGet.mockResolvedValue(createPaginatedResponse([], 1, false));

    const { result } = renderHook(() =>
      useInfiniteAuditLogs({ system: "AUTH" })
    );

    expect(result.current.filters.system).toBe("AUTH");
    expect(result.current.filters.sortBy).toBe("timestamp");

    await flushAsync();
  });

  it("should handle errors", async () => {
    mockGet.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useInfiniteAuditLogs());
    await flushAsync();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe("Network error");
  });

  it("should handle non-Error throws", async () => {
    mockGet.mockRejectedValue("string error");

    const { result } = renderHook(() => useInfiniteAuditLogs());
    await flushAsync();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error?.message).toBe("Error fetching logs");
  });

  it("should update filters", async () => {
    mockGet.mockResolvedValue(createPaginatedResponse([], 1, false));

    const { result } = renderHook(() => useInfiniteAuditLogs());
    await flushAsync();

    act(() => {
      result.current.setFilters({ search: "test" });
    });

    expect(result.current.filters.search).toBe("test");

    await flushAsync();
  });

  it("should reset filters", async () => {
    mockGet.mockResolvedValue(createPaginatedResponse([], 1, false));

    const { result } = renderHook(() => useInfiniteAuditLogs());
    await flushAsync();

    act(() => {
      result.current.setFilters({ search: "test", action: "CREATE" });
    });
    await flushAsync();

    act(() => {
      result.current.resetFilters();
    });
    await flushAsync();

    expect(result.current.filters.search).toBe("");
    expect(result.current.filters.action).toBe("");
  });

  it("should refresh logs", async () => {
    mockGet.mockResolvedValue(createPaginatedResponse([{ id: "1" }], 1, false));

    const { result } = renderHook(() => useInfiniteAuditLogs());
    await flushAsync();

    const callCount = mockGet.mock.calls.length;

    await act(async () => {
      result.current.refresh();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockGet.mock.calls.length).toBeGreaterThan(callCount);
  });

  it("should load more pages when hasMore is true", async () => {
    const page1 = createPaginatedResponse([{ id: "1" }], 1, true);
    const page2 = createPaginatedResponse([{ id: "2" }], 2, false);

    mockGet.mockResolvedValueOnce(page1).mockResolvedValueOnce(page2);

    const { result } = renderHook(() => useInfiniteAuditLogs());
    await flushAsync();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      result.current.loadMore();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoadingMore).toBe(false);
    expect(result.current.logs).toHaveLength(2);
  });

  it("should include all non-empty filters as params", async () => {
    mockGet.mockResolvedValue(createPaginatedResponse([], 1, false));

    renderHook(() =>
      useInfiniteAuditLogs({
        search: "test",
        action: "CREATE",
        entityType: "User",
        system: "AUTH",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        sortBy: "action",
        sortOrder: "ASC",
      })
    );
    await flushAsync();

    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("search=test");
    expect(url).toContain("action=CREATE");
    expect(url).toContain("entityType=User");
    expect(url).toContain("system=AUTH");
    expect(url).toContain("startDate=2024-01-01");
    expect(url).toContain("endDate=2024-12-31");
    expect(url).toContain("sortBy=action");
    expect(url).toContain("sortOrder=ASC");
  });
});
