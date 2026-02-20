import { ActionPlanIndicatorQuadrenniumGoal } from "@/types/masters/indicators"
import {
    getActionPlanIndicatorQuadrenniumGoals,
    createActionPlanIndicatorQuadrenniumGoal,
    updateActionPlanIndicatorQuadrenniumGoal,
    deleteActionPlanIndicatorQuadrenniumGoal
} from "@/services/masters/indicators.service"
import { QuadrenniumGoalsTab } from "@/components/modals/masters/indicators/shared/QuadrenniumGoalsTab"

interface Props {
    indicatorId: string | null
}

export function ActionPlanQuadrenniumGoalsTab({ indicatorId }: Readonly<Props>) {
    return (
        <QuadrenniumGoalsTab<ActionPlanIndicatorQuadrenniumGoal>
            indicatorId={indicatorId}
            fetchGoals={getActionPlanIndicatorQuadrenniumGoals}
            createGoal={createActionPlanIndicatorQuadrenniumGoal}
            updateGoal={updateActionPlanIndicatorQuadrenniumGoal}
            deleteGoal={deleteActionPlanIndicatorQuadrenniumGoal}
        />
    )
}

