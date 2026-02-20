import { VariableGoalsTabBase } from "./VariableGoalsTabBase"

interface Props {
    variableId: string | null
}

export function QuadrenniumGoalsTab({ variableId }: Readonly<Props>) {
    return <VariableGoalsTabBase variableId={variableId} mode="quadrennium" />
}

