import { ProjectsTab } from "./ProjectsTab"

interface Props {
    indicatorId: string | null
}

export function AssociatedProjectsTab({ indicatorId }: Readonly<Props>) {
    return <ProjectsTab indicatorId={indicatorId} mode="associated" />
}
