"use client"

import { Indicator } from "@/types/masters/indicators"
import { getMyIndicativeIndicators } from "@/services/sub/indicators.service"
import { IndicatorSubTab } from "./IndicatorSubTab"
import { indicativePlanColumns } from "@/config/indicator-columns"

export function IndicativePlanSubTab() {
    return (
        <IndicatorSubTab<Indicator>
            columns={indicativePlanColumns}
            fetchFn={getMyIndicativeIndicators}
            type="indicative"
            ariaLabel="Tabla de indicadores plan indicativo"
        />
    )
}

