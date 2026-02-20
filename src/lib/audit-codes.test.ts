import {
  AuditActions,
  ACTION_LABELS,
  ACTION_COLORS,
  FIELD_LABELS,
  AuditEntityTypes,
  ENTITY_TYPE_LABELS,
  METADATA_LABELS,
  getActionLabel,
  getActionColor,
  getFieldLabel,
  getEntityTypeLabel,
  getMetadataLabel,
} from "./audit-codes";

describe("AuditActions", () => {
  it("should have all auth actions", () => {
    expect(AuditActions.USER_CREATED).toBe("USER_CREATED");
    expect(AuditActions.LOGIN_SUCCESS).toBe("LOGIN_SUCCESS");
    expect(AuditActions.PASSWORD_CHANGED).toBe("PASSWORD_CHANGED");
  });

  it("should have masters actions", () => {
    expect(AuditActions.VARIABLE_CREATED).toBe("VARIABLE_CREATED");
    expect(AuditActions.MGA_ACTIVITY_CREATED).toBe("MGA_ACTIVITY_CREATED");
    expect(AuditActions.DETAILED_ACTIVITY_CREATED).toBe("DETAILED_ACTIVITY_CREATED");
  });

  it("should have financial actions", () => {
    expect(AuditActions.PROJECT_CREATED).toBe("PROJECT_CREATED");
    expect(AuditActions.CDP_FUNDING_CONSUMED).toBe("CDP_FUNDING_CONSUMED");
  });

  it("should have SAP actions", () => {
    expect(AuditActions.SAP_SYNC_REQUESTED).toBe("SAP_SYNC_REQUESTED");
    expect(AuditActions.SAP_SYNC_COMPLETED).toBe("SAP_SYNC_COMPLETED");
    expect(AuditActions.SAP_SYNC_FAILED).toBe("SAP_SYNC_FAILED");
  });
});

describe("ACTION_LABELS", () => {
  it("should have a label for every audit action", () => {
    const actions = Object.values(AuditActions);
    for (const action of actions) {
      expect(ACTION_LABELS[action]).toBeDefined();
      expect(typeof ACTION_LABELS[action]).toBe("string");
    }
  });
});

describe("ACTION_COLORS", () => {
  it("should have a color for every audit action", () => {
    const actions = Object.values(AuditActions);
    const validColors = ["default", "primary", "secondary", "success", "warning", "danger"];
    for (const action of actions) {
      expect(ACTION_COLORS[action]).toBeDefined();
      expect(validColors).toContain(ACTION_COLORS[action]);
    }
  });
});

describe("AuditEntityTypes", () => {
  it("should have auth entity types", () => {
    expect(AuditEntityTypes.USER).toBe("User");
    expect(AuditEntityTypes.ROLE).toBe("Role");
    expect(AuditEntityTypes.MODULE).toBe("Module");
  });

  it("should have financial entity types", () => {
    expect(AuditEntityTypes.PROJECT).toBe("Project");
    expect(AuditEntityTypes.CDP).toBe("Cdp");
    expect(AuditEntityTypes.MASTER_CONTRACT).toBe("MasterContract");
  });
});

describe("ENTITY_TYPE_LABELS", () => {
  it("should have a label for every entity type", () => {
    const types = Object.values(AuditEntityTypes);
    for (const type of types) {
      expect(ENTITY_TYPE_LABELS[type]).toBeDefined();
      expect(typeof ENTITY_TYPE_LABELS[type]).toBe("string");
    }
  });
});

describe("FIELD_LABELS", () => {
  it("should have common field labels", () => {
    expect(FIELD_LABELS["email"]).toBe("Correo Electrónico");
    expect(FIELD_LABELS["name"]).toBe("Nombre");
    expect(FIELD_LABELS["code"]).toBe("Código");
  });
});

describe("METADATA_LABELS", () => {
  it("should have role metadata labels", () => {
    expect(METADATA_LABELS["roleName"]).toBe("Nombre del Rol");
    expect(METADATA_LABELS["roleId"]).toBe("ID del Rol");
  });
});

describe("helper functions", () => {
  describe("getActionLabel", () => {
    it("should return label for known action", () => {
      expect(getActionLabel("USER_CREATED")).toBe("Usuario Creado");
    });

    it("should return the action itself for unknown action", () => {
      expect(getActionLabel("UNKNOWN_ACTION")).toBe("UNKNOWN_ACTION");
    });
  });

  describe("getActionColor", () => {
    it("should return color for known action", () => {
      expect(getActionColor("USER_CREATED")).toBe("success");
      expect(getActionColor("USER_DELETED")).toBe("danger");
      expect(getActionColor("USER_UPDATED")).toBe("primary");
    });

    it("should return default for unknown action", () => {
      expect(getActionColor("UNKNOWN_ACTION")).toBe("default");
    });
  });

  describe("getFieldLabel", () => {
    it("should return label for known field", () => {
      expect(getFieldLabel("email")).toBe("Correo Electrónico");
    });

    it("should return the field itself for unknown field", () => {
      expect(getFieldLabel("unknownField")).toBe("unknownField");
    });
  });

  describe("getEntityTypeLabel", () => {
    it("should return label for known entity type", () => {
      expect(getEntityTypeLabel("User")).toBe("Usuario");
    });

    it("should return the type itself for unknown type", () => {
      expect(getEntityTypeLabel("UnknownType")).toBe("UnknownType");
    });
  });

  describe("getMetadataLabel", () => {
    it("should return label for known key", () => {
      expect(getMetadataLabel("roleName")).toBe("Nombre del Rol");
    });

    it("should format camelCase key for unknown key", () => {
      const result = getMetadataLabel("someUnknownKey");
      expect(result).toContain("Some");
      expect(result).toContain("Unknown");
      expect(result).toContain("Key");
    });
  });
});
