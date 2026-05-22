import { Fragment, useState } from "react"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

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
}

const STEPS: readonly StepMeta[] = [
  {
    id: "select-gate-passes",
    title: "Select Gate Passes",
  },
  {
    id: "fill-details",
    title: "Fill Details",
  },
] as const

function GradingStepper({
  steps,
  currentStep,
}: {
  steps: readonly StepMeta[]
  currentStep: number
}) {
  return (
    <nav aria-label="Grading progress" className="mt-6 overflow-x-clip">
      <ol className="flex w-full items-start">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index
          const isActive = currentStep === index

          return (
            <Fragment key={step.id}>
              {index > 0 && (
                <li
                  aria-hidden
                  className="mt-4 flex min-w-6 flex-1 items-center self-stretch px-2 sm:px-4"
                >
                  <div className="h-0.5 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className={cn(
                        "h-full rounded-full bg-primary transition-[width] duration-500 ease-out",
                        currentStep >= index ? "w-full" : "w-0"
                      )}
                    />
                  </div>
                </li>
              )}
              <li
                className="flex shrink-0 flex-col items-center gap-2"
                aria-current={isActive ? "step" : undefined}
              >
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border-2 text-sm font-semibold tabular-nums transition-all duration-300",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground shadow-sm",
                    isActive &&
                      "border-primary bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/25",
                    !isCompleted &&
                      !isActive &&
                      "border-border bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-3.5 stroke-[2.5]" aria-hidden />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm transition-colors duration-300",
                    isActive && "font-semibold text-foreground",
                    isCompleted && "font-medium text-foreground",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

const CreateGradingForm = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const isFirst = currentStep === 0
  const isLast = currentStep === STEPS.length - 1

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
        <GradingStepper steps={STEPS} currentStep={currentStep} />
      </CardHeader>

      <form noValidate onSubmit={(e) => e.preventDefault()}>
        <CardContent className="pt-8 pb-8">
          {currentStep === 0 && <SelectGatePassesStep />}
          {currentStep === 1 && <FillDetailsStep />}
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

          <Button
            type="button"
            onClick={() =>
              isLast
                ? undefined
                : setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1))
            }
          >
            {isLast ? (
              <>
                <Check className="mr-2 size-4" />
                Submit
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default CreateGradingForm
