import { VariableGoalsTabBase } from "./VariableGoalsTabBase"

interface Props {
    variableId: string | null
}

export function AnnualGoalsTab({ variableId }: Readonly<Props>) {
    return <VariableGoalsTabBase variableId={variableId} mode="annual" />
}
