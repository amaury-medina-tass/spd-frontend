import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";

jest.mock("@/components/auth/useAuth", () => ({
  useAuth: () => ({
    me: {
      id: "u1",
      first_name: "Test",
      last_name: "User",
      email: "test@example.com",
      document_number: "123456",
      is_active: true,
      roles: ["Admin"],
      permissions: {
        "/access-control/users": {
          name: "Usuarios",
          actions: {
            READ: { name: "Leer", allowed: true },
            CREATE: { name: "Crear", allowed: true },
          },
        },
      },
    },
    loading: false,
  }),
}));

import ProfilePage from "@/app/dashboard/profile/page";

describe("ProfilePage", () => {
  it("renders user full name", () => {
    renderWithProviders(<ProfilePage />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("renders email", () => {
    renderWithProviders(<ProfilePage />);
    const emails = screen.getAllByText("test@example.com");
    expect(emails.length).toBeGreaterThan(0);
  });

  it("renders roles section", () => {
    renderWithProviders(<ProfilePage />);
    expect(screen.getByText("Roles")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("renders permissions section", () => {
    renderWithProviders(<ProfilePage />);
    expect(screen.getByText(/Permisos del Sistema/)).toBeInTheDocument();
  });
});
