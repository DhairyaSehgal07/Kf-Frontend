import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/additional')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/additional"!</div>
}
