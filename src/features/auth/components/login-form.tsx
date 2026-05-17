import { useForm } from "@tanstack/react-form"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useLogin } from "../api/use-login"

const formSchema = z.object({
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
})

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { mutateAsync: login, isPending } = useLogin()

  const form = useForm({
    defaultValues: {
      mobileNumber: "",
      password: "",
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { message } = await login(value)
        toast.success(message, { position: "bottom-right" })
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Login failed",
          { position: "bottom-right" },
        )
      }
    },
  })

  return (
    // ✅ Full-screen centering wrapper
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-8">
      {/* ✅ Card is full-width on mobile, capped at sm on larger screens */}
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Enter your credentials to sign in.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <FieldGroup className="space-y-4">
              {/* Mobile Number Field */}
              <form.Field name="mobileNumber">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Mobile Number</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="9876543210"
                      type="tel"
                      maxLength={10}
                      inputMode="numeric" // ✅ opens numeric keyboard on mobile
                      className="h-11 text-base" // ✅ prevents iOS zoom on focus (font-size >= 16px)
                    />
                    <FieldDescription className="text-xs">
                      Enter your 10-digit Indian mobile number.
                    </FieldDescription>
                    {field.state.meta.errors.length > 0 && (
                      <FieldError>{field.state.meta.errors[0]?.message}</FieldError>
                    )}
                  </Field>
                )}
              </form.Field>

              {/* Password Field */}
              <form.Field name="password">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        className="h-11 pr-10 text-base" // ✅ prevents iOS zoom on focus
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </Button>
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <FieldError>{field.state.meta.errors[0]?.message}</FieldError>
                    )}
                  </Field>
                )}
              </form.Field>
            </FieldGroup>

            {/* ✅ Footer inside the form, not nested inside CardContent causing layout issues */}
            <div className="mt-6">
              <form.Subscribe selector={(state) => state.canSubmit}>
                {(canSubmit) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isPending}
                    className="w-full h-11 text-base font-medium"
                  >
                    {isPending ? "Signing in…" : "Sign In"}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center pt-0 pb-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="/register" className="text-primary font-medium hover:underline">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}