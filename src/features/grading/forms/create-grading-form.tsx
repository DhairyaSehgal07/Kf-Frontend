import { useState } from "react"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { useCreateGradingForm } from "@/features/grading/forms/use-create-grading-form"

import { Stepper } from "@/components/stepper"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FillDetailsStep } from "@/features/grading/forms/steps/fill-details-step"
import { SelectGatePassesStep } from "@/features/grading/forms/steps/select-gate-passes-step"

type StepMeta = {
  id: string
  title: string
  description: string
}

const STEPS: readonly StepMeta[] = [
  {
    id: "select-gate-passes",
    title: "Select Gate Passes",
    description: "Choose incoming gate passes",
  },
  {
    id: "fill-details",
    title: "Fill Details",
    description: "Enter graded bag counts",
  },
]

const CreateGradingForm = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const isFirst = currentStep === 0
  const isLast = currentStep === STEPS.length - 1
  const form = useCreateGradingForm()

  return (
    <Card className="mx-auto w-full max-w-4xl shadow-sm">
      <CardHeader className="border-b bg-muted/30 pb-6">
        <CardTitle className="text-2xl">
          Grading Gate Pass{" "}
          <span className="text-2xl text-primary">#24</span>
        </CardTitle>
        <CardDescription className="text-base">
          Enter how many bags were created after grading a truck
        </CardDescription>
        <Stepper
          className="mt-6"
          steps={STEPS}
          currentStep={currentStep + 1}
          aria-label="Grading progress"
        />
      </CardHeader>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (isLast) {
            void form.handleSubmit()
          }
        }}
      >
        <CardContent className="pt-8 pb-8">
          {currentStep === 0 && <SelectGatePassesStep />}
          {currentStep === 1 && <FillDetailsStep form={form} />}
        </CardContent>

        <CardFooter className="flex justify-between border-t bg-muted/30 py-6">
          <Button
            type="button"
            variant="outline"
            disabled={isFirst}
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>

          {isLast ? (
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
              children={({ canSubmit, isSubmitting }) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  <Check className="mr-2 size-4" />
                  {isSubmitting ? "Submitting…" : "Submit"}
                </Button>
              )}
            />
          ) : (
            <Button
              type="button"
              onClick={() =>
                setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1))
              }
            >
              Next
              <ArrowRight className="ml-2 size-4" />
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}

export default CreateGradingForm
