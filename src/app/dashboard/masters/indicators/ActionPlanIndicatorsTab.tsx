"use client"

import { ActionPlanIndicator } from "@/types/masters/indicators"
import { getActionPlanIndicators, deleteActionPlanIndicator, getActionPlanIndicatorUsers, assignActionPlanIndicatorUser, unassignActionPlanIndicatorUser } from "@/services/masters/indicators.service"
import { CreateActionPlanIndicatorModal } from "@/components/modals/masters/indicators/action-plan/CreateActionPlanIndicatorModal"
import { EditActionPlanIndicatorModal } from "@/components/modals/masters/indicators/action-plan/EditActionPlanIndicatorModal"
import { ActionPlanIndicatorDetailModal } from "@/components/modals/masters/indicators/action-plan/ActionPlanIndicatorDetailModal"
import { ActionPlanIndicatorGoalsModal } from "@/components/modals/masters/indicators/action-plan/ActionPlanIndicatorGoalsModal"
import { ManageActionPlanProjectsModal } from "@/components/modals/masters/indicators/action-plan/ManageActionPlanProjectsModal"
import { IndicatorsTabBase } from "./IndicatorsTabBase"
import { actionPlanColumns } from "@/config/indicator-columns"

export function ActionPlanIndicatorsTab() {
    return (
        <IndicatorsTabBase<ActionPlanIndicator>
            columns={actionPlanColumns}
            fetchFn={getActionPlanIndicators}
            deleteFn={deleteActionPlanIndicator}
            ariaLabel="Tabla de indicadores plan de acción"
            formulaIdKey="actionIndicatorId"
            locationType="action"
            variablesType="action-plan"
            showProjects
            usersFns={{
                getUsers: getActionPlanIndicatorUsers,
                assignUser: assignActionPlanIndicatorUser,
                unassignUser: unassignActionPlanIndicatorUser,
            }}
            renderCreateModal={(props) => <CreateActionPlanIndicatorModal {...props} />}
            renderEditModal={(props) => <EditActionPlanIndicatorModal {...props} />}
            renderDetailModal={(props) => <ActionPlanIndicatorDetailModal {...props} />}
            renderGoalsModal={(props) => <ActionPlanIndicatorGoalsModal {...props} />}
            renderProjectsModal={(props) => <ManageActionPlanProjectsModal {...props} />}
        />
    )
}
