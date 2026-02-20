jest.unmock("@/lib/endpoints");

import { endpoints } from "@/lib/endpoints";

describe("endpoints", () => {
  describe("auth", () => {
    it("should have all auth endpoints", () => {
      expect(endpoints.auth.login).toBe("/public/auth/login");
      expect(endpoints.auth.register).toBe("/public/auth/register");
      expect(endpoints.auth.verifyEmail).toBe("/public/auth/verify-email");
      expect(endpoints.auth.resendVerification).toBe("/public/auth/resend-verification");
      expect(endpoints.auth.forgotPassword).toBe("/public/auth/forgot-password");
      expect(endpoints.auth.resetPassword).toBe("/public/auth/reset-password");
      expect(endpoints.auth.me).toBe("/public/auth/me");
      expect(endpoints.auth.logout).toBe("/public/auth/logout");
      expect(endpoints.auth.refresh).toBe("/public/auth/refresh");
      expect(endpoints.auth.wsToken).toBe("/public/auth/ws-token");
    });
  });

  describe("accessControl", () => {
    it("should have user and role endpoints", () => {
      expect(endpoints.accessControl.users).toBe("/public/users");
      expect(endpoints.accessControl.roles.base).toBe("/public/access-control/roles");
      expect(endpoints.accessControl.roles.all).toBe("/public/access-control/roles/all");
      expect(endpoints.accessControl.modules).toBe("/public/access-control/modules");
      expect(endpoints.accessControl.actions).toBe("/public/access-control/actions");
    });
  });

  describe("masters dynamic endpoints", () => {
    it("should generate correct URLs for mga activities", () => {
      expect(endpoints.masters.mgaActivityDetailedActivities("abc")).toBe(
        "/spd/masters/mga-activities/abc/detailed-activities",
      );
      expect(endpoints.masters.mgaActivityDetailedRelations("abc")).toBe(
        "/spd/masters/mga-activities/abc/detailed-relations",
      );
      expect(endpoints.masters.mgaActivityDetailedRelationsRemove("abc", "def")).toBe(
        "/spd/masters/mga-activities/abc/detailed-relations/def",
      );
    });

    it("should generate correct URLs for variable locations", () => {
      expect(endpoints.masters.variableLocations("v1")).toBe("/spd/masters/variables/v1/locations");
      expect(endpoints.masters.variableLocationsDissociate("v1", "l1")).toBe(
        "/spd/masters/variables/v1/locations/l1",
      );
    });

    it("should generate correct indicator location URLs", () => {
      expect(endpoints.masters.indicativePlanIndicatorLocations("i1")).toContain("i1/locations");
      expect(endpoints.masters.actionPlanIndicatorLocations("i1")).toContain("i1/locations");
      expect(endpoints.masters.indicativePlanIndicatorLocationsDissociate("i1", "l1")).toContain("i1/locations/l1");
      expect(endpoints.masters.actionPlanIndicatorLocationsDissociate("i1", "l1")).toContain("i1/locations/l1");
    });

    it("should generate correct indicator variable URLs", () => {
      expect(endpoints.masters.indicatorVariables("i1")).toContain("i1/variables");
      expect(endpoints.masters.indicatorVariablesDissociate("i1", "v1")).toContain("i1/variables/v1");
    });

    it("should generate correct action plan indicator project URLs", () => {
      expect(endpoints.masters.actionPlanIndicatorProjects("i1")).toContain("i1/projects");
      expect(endpoints.masters.actionPlanIndicatorProjectsDissociate("i1", "p1")).toContain("i1/projects/p1");
    });

    it("should generate correct indicator user assignment URLs", () => {
      expect(endpoints.masters.indicatorUsers("i1")).toContain("i1/users");
      expect(endpoints.masters.indicatorUsersRemove("i1", "u1")).toContain("i1/users/u1");
      expect(endpoints.masters.actionPlanIndicatorUsers("i1")).toContain("i1/users");
      expect(endpoints.masters.actionPlanIndicatorUsersRemove("i1", "u1")).toContain("i1/users/u1");
    });

    it("should generate correct variable user assignment URLs", () => {
      expect(endpoints.masters.variableUsers("v1")).toContain("v1/users");
      expect(endpoints.masters.variableUsersRemove("v1", "u1")).toContain("v1/users/u1");
    });

    it("should generate location-based indicator query URLs", () => {
      expect(endpoints.masters.indicatorsByLocation("c1")).toContain("commune/c1");
      expect(endpoints.masters.actionPlanIndicatorsByLocation("c1")).toContain("commune/c1");
    });

    it("should generate indicatorLocationVariables for both types", () => {
      expect(endpoints.masters.indicatorLocationVariables("i1", "indicative")).toContain("indicative-plan-indicators/i1/locations/variables");
      expect(endpoints.masters.indicatorLocationVariables("i1", "action")).toContain("action-plan-indicators/i1/locations/variables");
    });

    it("should generate indicativePlanIndicatorQuadrenniumsByIndicator URL", () => {
      expect(endpoints.masters.indicativePlanIndicatorQuadrenniumsByIndicator("i1")).toContain("by-indicator/i1");
    });
  });

  describe("exports endpoints", () => {
    it("should have correct static and dynamic endpoints", () => {
      expect(endpoints.exports.create).toBe("/public/exports/data");
      expect(endpoints.exports.list).toBe("/public/exports/data");
      expect(endpoints.exports.status("j1")).toBe("/public/exports/data/j1");
    });
  });

  describe("notifications endpoints", () => {
    it("should have correct static and dynamic endpoints", () => {
      expect(endpoints.notifications.list).toBe("/public/notifications");
      expect(endpoints.notifications.unreadCount).toBe("/public/notifications/unread-count");
      expect(endpoints.notifications.markRead("n1")).toBe("/public/notifications/n1/read");
      expect(endpoints.notifications.readAll).toBe("/public/notifications/read-all");
    });
  });

  describe("financial endpoints", () => {
    it("should generate dashboard dynamic endpoints", () => {
      expect(endpoints.financial.dashboard.cdpsByNeed("n1")).toContain("needs/n1/cdps");
      expect(endpoints.financial.dashboard.activitiesByCdp("c1")).toContain("cdps/c1/activities");
      expect(endpoints.financial.dashboard.contractsByCdp("c1")).toContain("cdps/c1/contracts");
      expect(endpoints.financial.dashboard.cdpsByContract("mc1")).toContain("contracts/mc1/cdps");
      expect(endpoints.financial.dashboard.budgetRecordsByContract("mc1")).toContain("contracts/mc1/budget-records");
      expect(endpoints.financial.dashboard.mgaActivitiesByProject("p1")).toContain("projects/p1/mga-activities");
      expect(endpoints.financial.dashboard.detailedByMga("m1")).toContain("mga-activities/m1/detailed");
      expect(endpoints.financial.dashboard.modificationsByActivity("a1")).toContain("activities/a1/modifications");
    });

    it("should generate CDP endpoints", () => {
      expect(endpoints.financial.cdpPositionDetail("p1")).toContain("positions/p1");
      expect(endpoints.financial.cdpPositionDetailedActivities("p1")).toContain("p1/detailed-activities");
      expect(endpoints.financial.cdpPositionDetailedActivitiesRemove("p1", "a1")).toContain("p1/detailed-activities/a1");
      expect(endpoints.financial.cdpPositionConsume("p1")).toContain("p1/consume");
      expect(endpoints.financial.masterContractCdpPositions("mc1")).toContain("mc1/cdp-positions");
    });

    it("should generate POAI PPA dynamic endpoints", () => {
      expect(endpoints.financial.poaiPpaProjectYears("p1")).toContain("project/p1/years");
      expect(endpoints.financial.poaiPpaProjectSummary("p1")).toContain("project/p1/summary");
      expect(endpoints.financial.poaiPpaProjectEvolution("p1")).toContain("project/p1/evolution");
    });
  });

  describe("sub endpoints", () => {
    it("should generate variable advance URLs", () => {
      expect(endpoints.sub.variableAdvances.contextual.actionIndicator("ai1")).toContain("action-indicator/ai1");
      expect(endpoints.sub.variableAdvances.contextual.indicativeIndicator("ii1")).toContain("indicative-indicator/ii1");
      expect(endpoints.sub.variableAdvances.locations.variable("v1")).toContain("variable/v1");
      expect(endpoints.sub.variableAdvances.locations.indicator("i1", "action")).toContain("indicator/i1/action");
      expect(endpoints.sub.variableAdvances.withLocations("v1")).toContain("with-locations/variable/v1");
      expect(endpoints.sub.variableAdvances.details("v1")).toContain("v1/details");
    });

    it("should generate indicator advance URLs", () => {
      expect(endpoints.sub.indicatorAdvances.actionDetailed("i1")).toContain("action/i1/detailed");
      expect(endpoints.sub.indicatorAdvances.indicativeDetailed("i1")).toContain("indicative/i1/detailed");
    });

    it("should have my endpoints", () => {
      expect(endpoints.sub.my.indicativeIndicators).toBe("/spd/sub/my/indicative-indicators");
      expect(endpoints.sub.my.actionIndicators).toBe("/spd/sub/my/action-indicators");
      expect(endpoints.sub.my.variables).toBe("/spd/sub/my/variables");
    });
  });
});
