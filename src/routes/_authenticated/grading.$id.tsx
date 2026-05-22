import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/grading/$id')({
  component: RouteComponent,
})

function RouteComponent() {
    const { id } = Route.useParams()
  return (<div>
      <div className='text-2xl'>Incoming ID: {id}</div>
  </div>)
}
