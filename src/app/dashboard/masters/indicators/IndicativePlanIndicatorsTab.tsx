"use client"

import { Indicator } from "@/types/masters/indicators"
import { getIndicators, deleteIndicator, getIndicatorUsers, assignIndicatorUser, unassignIndicatorUser } from "@/services/masters/indicators.service"
import { CreateIndicatorModal } from "@/components/modals/masters/indicators/indicative-plan/CreateIndicatorModal"
import { EditIndicatorModal } from "@/components/modals/masters/indicators/indicative-plan/EditIndicatorModal"
import { IndicatorDetailModal } from "@/components/modals/masters/indicators/indicative-plan/IndicatorDetailModal"
import { IndicativePlanIndicatorGoalsModal } from "@/components/modals/masters/indicators/indicative-plan/IndicativePlanIndicatorGoalsModal"
import { IndicatorsTabBase } from "./IndicatorsTabBase"
import { indicativePlanColumns } from "@/config/indicator-columns"

export function IndicativePlanIndicatorsTab() {
    return (
        <IndicatorsTabBase<Indicator>
            columns={indicativePlanColumns}
            fetchFn={getIndicators}
            deleteFn={deleteIndicator}
            ariaLabel="Tabla de indicadores plan indicativo"
            formulaIdKey="indicativeIndicatorId"
            formulaType="indicative"
            locationType="indicative"
            variablesType="indicative"
            showErrorView
            usersFns={{
                getUsers: getIndicatorUsers,
                assignUser: assignIndicatorUser,
                unassignUser: unassignIndicatorUser,
            }}
            renderCreateModal={(props) => <CreateIndicatorModal {...props} />}
            renderEditModal={(props) => <EditIndicatorModal {...props} />}
            renderDetailModal={(props) => <IndicatorDetailModal {...props} />}
            renderGoalsModal={(props) => <IndicativePlanIndicatorGoalsModal {...props} />}
        />
    )
}
