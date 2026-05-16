import { describe, expect, it } from "vitest";
import {
  ROLES,
  canAccessMenu,
  canAccessSubstansi,
  getFilteredMenuItems,
  getRoleDisplayName,
  hasPermission,
  isAdmin,
  normalizeRole,
} from "./permissions";

describe("permission utilities", () => {
  it("normalizes roles defensively and falls back to the least privileged role", () => {
    expect(normalizeRole(" Admin_BPKA ")).toBe(ROLES.ADMIN_BPKA);
    expect(normalizeRole(undefined)).toBe(ROLES.BPN);
  });

  it("allows BPKA users to manage sewa aset but keeps BPN users read-only for asset records", () => {
    expect(canAccessMenu("bpka", "sewa-aset")).toBe(true);
    expect(hasPermission("bpka", "sewaAset", "create")).toBe(true);

    expect(hasPermission("bpn", "aset", "view")).toBe(true);
    expect(hasPermission("bpn", "aset", "create")).toBe(false);
    expect(hasPermission("bpn", "aset", "delete")).toBe(false);
  });

  it("limits administrative menus to admin roles", () => {
    expect(isAdmin("admin_bpn")).toBe(true);
    expect(canAccessMenu("admin_bpka", "backup")).toBe(true);
    expect(canAccessMenu("bpka", "backup")).toBe(false);
    expect(canAccessMenu("bpn", "user")).toBe(false);
  });

  it("filters menu items according to the active role", () => {
    const menuItems = [
      { id: "dashboard", label: "Dashboard" },
      { id: "backup", label: "Backup" },
      { id: "sewa-aset", label: "Sewa Aset" },
    ];

    expect(getFilteredMenuItems("bpka", menuItems).map((item) => item.id)).toEqual([
      "dashboard",
      "sewa-aset",
    ]);
  });

  it("exposes BPN substansi access and readable display names", () => {
    expect(canAccessSubstansi("bpn", "legal")).toBe(true);
    expect(canAccessSubstansi("bpka", "legal")).toBe(false);
    expect(getRoleDisplayName("ADMIN_BPKA")).toBe("Admin BPKA");
  });
});
