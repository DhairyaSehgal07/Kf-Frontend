import { createFileRoute } from '@tanstack/react-router'
import FarmerProfileScreen from '@/features/people/[id]'

export const Route = createFileRoute('/_authenticated/people/$id')({
  component: FarmerProfileScreen,
})
