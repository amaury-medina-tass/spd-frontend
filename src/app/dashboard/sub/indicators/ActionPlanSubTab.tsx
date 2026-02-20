"use client"

import { ActionPlanIndicator } from "@/types/masters/indicators"
import { getMyActionPlanIndicators } from "@/services/sub/indicators.service"
import { IndicatorSubTab } from "./IndicatorSubTab"
import { actionPlanColumns } from "@/config/indicator-columns"

export function ActionPlanSubTab() {
    return (
        <IndicatorSubTab<ActionPlanIndicator>
            columns={actionPlanColumns}
            fetchFn={getMyActionPlanIndicators}
            type="action"
            ariaLabel="Tabla de indicadores plan de acción"
        />
    )
}

