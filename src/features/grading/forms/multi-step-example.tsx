import * as z from "zod";
import { Fragment, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";

// 1. Break down the schemas per step
const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
});

const workspaceSchema = z.object({
  workspaceName: z.string().min(2, "Workspace name is required."),
  role: z.string().min(1, "Please select a role."),
});

const securitySchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  twoFactor: z.boolean().default(false),
});

// 2. Merge them for the final form submission
const wizardSchema = profileSchema.merge(workspaceSchema).merge(securitySchema);

// Define step metadata
const STEPS = [
  { id: 0, title: "Profile", schema: profileSchema },
  { id: 1, title: "Workspace", schema: workspaceSchema },
  { id: 2, title: "Security", schema: securitySchema },
] as const;

type StepMeta = (typeof STEPS)[number];

function WizardStepper({
  steps,
  currentStep,
}: {
  steps: readonly StepMeta[];
  currentStep: number;
}) {
  return (
    <nav aria-label="Setup progress" className="mt-8 overflow-x-clip">
      <ol className="flex w-full items-start">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isActive = currentStep === index;

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
                        currentStep >= index ? "w-full" : "w-0",
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
                      "border-border bg-background text-muted-foreground",
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
                    !isActive && !isCompleted && "text-muted-foreground",
                  )}
                >
                  {step.title}
                </span>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export default function SetupWizardForm() {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      workspaceName: "",
      role: "",
      password: "",
      twoFactor: false,
    },
    validators: {
      onChange: wizardSchema, // Real-time validation against full schema
    },
    onSubmit: async ({ value }) => {
      toast.success("Account created successfully!", {
        description: `Welcome aboard, ${value.fullName}.`,
      });
      console.log("Submitted Data:", value);
    },
  });

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm">
      <CardHeader className="space-y-1 border-b bg-muted/30 pb-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              Account Setup
            </CardTitle>
            <CardDescription>
              Let&apos;s get your new environment configured in a few quick steps.
            </CardDescription>
          </div>
          <p className="shrink-0 text-sm text-muted-foreground tabular-nums">
            Step{" "}
            <span className="font-medium text-foreground">{currentStep + 1}</span> of{" "}
            {STEPS.length}
          </p>
        </div>

        <WizardStepper steps={STEPS} currentStep={currentStep} />
      </CardHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CardContent className="pt-8 min-h-[320px]">
          {/* STEP 0: PROFILE */}
          {currentStep === 0 && (
            <FieldSet className="animate-in fade-in slide-in-from-right-4 duration-500">
              <FieldLegend className="text-lg font-semibold">Personal Details</FieldLegend>
              <FieldDescription>Tell us who you are.</FieldDescription>
              <FieldGroup className="mt-6 gap-6">
                <form.Field name="fullName">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Jane Doe"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="email">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
                        <Input
                          id={field.name}
                          type="email"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="jane@example.com"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>
          )}

          {/* STEP 1: WORKSPACE */}
          {currentStep === 1 && (
            <FieldSet className="animate-in fade-in slide-in-from-right-4 duration-500">
              <FieldLegend className="text-lg font-semibold">Workspace Configuration</FieldLegend>
              <FieldDescription>Set up your primary workspace and role.</FieldDescription>
              <FieldGroup className="mt-6 gap-6">
                <form.Field name="workspaceName">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Workspace Name</FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Acme Corp"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="role">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Your Role</FieldLabel>
                        <Select
                          value={field.state.value}
                          onValueChange={field.handleChange}
                        >
                          <SelectTrigger id={field.name} aria-invalid={isInvalid} onBlur={field.handleBlur}>
                            <SelectValue placeholder="Select a role..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="developer">Developer</SelectItem>
                            <SelectItem value="manager">Product Manager</SelectItem>
                            <SelectItem value="designer">Designer</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>
          )}

          {/* STEP 2: SECURITY */}
          {currentStep === 2 && (
            <FieldSet className="animate-in fade-in slide-in-from-right-4 duration-500">
              <FieldLegend className="text-lg font-semibold">Security Settings</FieldLegend>
              <FieldDescription>Secure your new account.</FieldDescription>
              <FieldGroup className="mt-6 gap-6">
                <form.Field name="password">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Master Password</FieldLabel>
                        <Input
                          id={field.name}
                          type="password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="••••••••"
                        />
                        <FieldDescription>Must be at least 8 characters long.</FieldDescription>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="twoFactor">
                  {(field) => {
                    return (
                      <Field orientation="horizontal" className="mt-4 p-4 border rounded-lg bg-card shadow-sm">
                        <FieldContent className="flex-1">
                          <FieldLabel htmlFor={field.name} className="text-base">
                            Two-Factor Authentication
                          </FieldLabel>
                          <FieldDescription>
                            Add an extra layer of security to your account.
                          </FieldDescription>
                        </FieldContent>
                        <Switch
                          id={field.name}
                          checked={field.state.value}
                          onCheckedChange={field.handleChange}
                        />
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t bg-muted/30 py-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="w-24"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* We use form.Subscribe to reactively check if the CURRENT step is valid.
            If the sub-schema fails parsing, we disable the Next/Submit button.
          */}
          <form.Subscribe
            selector={(state) => ({ values: state.values, isSubmitting: state.isSubmitting })}
            children={({ values, isSubmitting }) => {
              // Validate ONLY the current step's schema
              const isCurrentStepValid = STEPS[currentStep].schema.safeParse(values).success;

              return currentStep === STEPS.length - 1 ? (
                <Button type="submit" disabled={!isCurrentStepValid || isSubmitting} className="w-32">
                  {isSubmitting ? "Finishing..." : "Complete Setup"}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={!isCurrentStepValid}
                  onClick={nextStep}
                  className="w-24"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              );
            }}
          />
        </CardFooter>
      </form>
    </Card>
  );
}