import {
  menuItems,
  isMenuGroup,
  allMenuItems,
  getAvailableRoutes,
  MenuItem,
  MenuGroup,
} from "./navigation";

describe("navigation", () => {
  describe("menuItems", () => {
    it("should be a non-empty array", () => {
      expect(Array.isArray(menuItems)).toBe(true);
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it("should contain Inicio as a direct MenuItem", () => {
      const inicio = menuItems.find(
        (item) => !isMenuGroup(item) && (item as MenuItem).label === "Inicio"
      ) as MenuItem;
      expect(inicio).toBeDefined();
      expect(inicio.href).toBe("/dashboard");
    });

    it("should contain menu groups with items", () => {
      const groups = menuItems.filter(isMenuGroup) as MenuGroup[];
      expect(groups.length).toBeGreaterThan(0);
      groups.forEach((g) => {
        expect(g.items.length).toBeGreaterThan(0);
        expect(g.label).toBeDefined();
        expect(g.icon).toBeDefined();
      });
    });

    it("should contain Control de Acceso group", () => {
      const group = menuItems.find(
        (item) => isMenuGroup(item) && item.label === "Control de Acceso"
      ) as MenuGroup;
      expect(group).toBeDefined();
      expect(group.items.length).toBe(4);
    });

    it("should contain Financiero group", () => {
      const group = menuItems.find(
        (item) => isMenuGroup(item) && item.label === "Financiero"
      ) as MenuGroup;
      expect(group).toBeDefined();
      expect(group.items.length).toBeGreaterThanOrEqual(5);
    });

    it("should contain Maestros group", () => {
      const group = menuItems.find(
        (item) => isMenuGroup(item) && item.label === "Maestros"
      ) as MenuGroup;
      expect(group).toBeDefined();
      expect(group.items.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("isMenuGroup", () => {
    it("should return true for groups", () => {
      const group = menuItems.find(
        (item) => "items" in item
      );
      expect(group).toBeDefined();
      expect(isMenuGroup(group!)).toBe(true);
    });

    it("should return false for plain items", () => {
      const item = menuItems.find(
        (item) => !("items" in item)
      );
      expect(item).toBeDefined();
      expect(isMenuGroup(item!)).toBe(false);
    });
  });

  describe("allMenuItems", () => {
    it("should be a flat array of MenuItem", () => {
      expect(Array.isArray(allMenuItems)).toBe(true);
      allMenuItems.forEach((item) => {
        expect(item.label).toBeDefined();
        expect(item.href).toBeDefined();
      });
    });

    it("should contain more items than top-level menuItems (due to flattening)", () => {
      expect(allMenuItems.length).toBeGreaterThan(menuItems.length);
    });

    it("should include nested items like Usuarios", () => {
      const user = allMenuItems.find((i) => i.label === "Usuarios");
      expect(user).toBeDefined();
      expect(user?.href).toBe("/dashboard/access-control/users");
    });
  });

  describe("getAvailableRoutes", () => {
    it("should return items with permissionPath", () => {
      const routes = getAvailableRoutes();
      expect(routes.length).toBeGreaterThan(0);
      routes.forEach((r) => {
        expect(r.label).toBeDefined();
        expect(r.path).toBeDefined();
        expect(r.href).toBeDefined();
      });
    });

    it("should not include Inicio (no permissionPath)", () => {
      const routes = getAvailableRoutes();
      const inicio = routes.find((r) => r.label === "Inicio");
      expect(inicio).toBeUndefined();
    });

    it("should include Usuarios with proper path", () => {
      const routes = getAvailableRoutes();
      const users = routes.find((r) => r.label === "Usuarios");
      expect(users).toBeDefined();
      expect(users?.path).toBe("/access-control/users");
    });
  });
});
