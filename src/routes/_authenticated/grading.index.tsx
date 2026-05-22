import { createFileRoute } from '@tanstack/react-router'
import SetupWizardForm from '@/features/grading/forms/multi-step-example'

export const Route = createFileRoute('/_authenticated/grading/')({
  component: SetupWizardForm,
})
