import { ActionPlanIndicatorGoal } from "@/types/masters/indicators"
import {
    getActionPlanIndicatorGoals,
    createActionPlanIndicatorGoal,
    updateActionPlanIndicatorGoal,
    deleteActionPlanIndicatorGoal
} from "@/services/masters/indicators.service"
import { AnnualGoalsTab } from "@/components/modals/masters/indicators/shared/AnnualGoalsTab"

interface Props {
    indicatorId: string | null
}

export function ActionPlanAnnualGoalsTab({ indicatorId }: Readonly<Props>) {
    return (
        <AnnualGoalsTab<ActionPlanIndicatorGoal>
            indicatorId={indicatorId}
            fetchGoals={getActionPlanIndicatorGoals}
            createGoal={createActionPlanIndicatorGoal}
            updateGoal={updateActionPlanIndicatorGoal}
            deleteGoal={deleteActionPlanIndicatorGoal}
        />
    )
}
