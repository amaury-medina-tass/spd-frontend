import { ProjectsTab } from "./ProjectsTab"

interface Props {
    indicatorId: string | null
}

export function AvailableProjectsTab({ indicatorId }: Readonly<Props>) {
    return <ProjectsTab indicatorId={indicatorId} mode="available" />
}
