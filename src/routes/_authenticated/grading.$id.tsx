import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/grading/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/grading/$id"!</div>
}
