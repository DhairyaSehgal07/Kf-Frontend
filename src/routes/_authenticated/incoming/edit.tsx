import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/incoming/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/incoming/edit"!</div>
}
