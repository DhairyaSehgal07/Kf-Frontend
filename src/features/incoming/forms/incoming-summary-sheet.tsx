import type { ReactNode } from "react"
import {
  Calendar,
  ClipboardCheck,
  FileText,
  Package,
  Scale,
  Truck,
  User,
  Weight,
  type LucideIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export type IncomingSummaryValues = {
  manualGatePassNumber?: number
  truckNumber: string
  farmerStorageLinkId: string
  variety: string
  category: string
  stage: string
  date: string
  bagsReceived: number
  weightSlip: {
    slipNumber: string
    grossWeightKg: number
    tareWeightKg: number
  }
  remarks: string
}

type IncomingSummarySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: IncomingSummaryValues | null
  farmerLabel: string
  onBack: () => void
  onSubmit: () => void
  canSubmit: boolean
  isSubmitting: boolean
}

function formatReviewDate(iso: string) {
  if (!iso) return "—"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function formatKg(value: number) {
  return `${value.toLocaleString("en-IN")} kg`
}

function SummaryInfoBlock({
  label,
  value,
  icon: Icon,
  valueClassName,
  className,
}: {
  label: string
  value: ReactNode
  icon?: LucideIcon
  valueClassName?: string
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <span className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
        {Icon && <Icon className="size-3.5 shrink-0" />}
        {label}
      </span>
      <p
        className={cn(
          "text-sm font-semibold text-foreground wrap-break-word",
          valueClassName
        )}
      >
        {value ?? "—"}
      </p>
    </div>
  )
}

function SummarySection({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-3.5" />
        </span>
        {title}
      </h3>
      {children}
    </section>
  )
}

function WeightReceipt({
  slipNumber,
  grossWeightKg,
  tareWeightKg,
}: {
  slipNumber: string
  grossWeightKg: number
  tareWeightKg: number
}) {
  const netWeightKg = grossWeightKg - tareWeightKg

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Weighbridge slip
        </span>
        <Badge variant="outline" className="bg-muted/30 font-mono text-xs">
          #{slipNumber}
        </Badge>
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Gross weight</span>
          <span className="font-medium tabular-nums text-foreground">
            {formatKg(grossWeightKg)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Tare weight</span>
          <span className="tabular-nums text-muted-foreground">
            − {tareWeightKg.toLocaleString("en-IN")} kg
          </span>
        </div>
        <Separator className="my-1" />
        <div className="flex items-center justify-between gap-4 pt-0.5">
          <span className="font-medium text-foreground">Net weight</span>
          <span className="text-base font-bold tabular-nums text-primary">
            {formatKg(netWeightKg)}
          </span>
        </div>
      </div>
    </div>
  )
}

function IncomingReviewSummary({
  values,
  farmerLabel,
}: {
  values: IncomingSummaryValues
  farmerLabel: string
}) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-xl border border-border/50 bg-linear-to-br from-muted/50 via-muted/20 to-transparent p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Truck className="size-4" />
              </span>
              <p className="truncate font-heading text-lg font-semibold tracking-tight uppercase">
                {values.truckNumber}
              </p>
            </div>
            <p className="flex items-center gap-1.5 pl-10 text-xs text-muted-foreground">
              <Calendar className="size-3.5 shrink-0" />
              {formatReviewDate(values.date)}
            </p>
          </div>
          {values.manualGatePassNumber != null && (
            <Badge variant="outline" className="shrink-0 bg-background text-[10px] uppercase">
              Manual #{values.manualGatePassNumber}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-background/80 text-[11px]">
            {values.bagsReceived.toLocaleString("en-IN")} bags
          </Badge>
          <Badge variant="secondary" className="text-[11px]">
            {values.variety}
          </Badge>
          <Badge variant="outline" className="text-[11px]">
            Cat. {values.category}
          </Badge>
          <Badge variant="outline" className="text-[11px]">
            {values.stage}
          </Badge>
        </div>
      </div>

      {/* Farmer */}
      <SummarySection title="Farmer link" icon={User}>
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
          <SummaryInfoBlock label="Account" value={farmerLabel} icon={User} />
        </div>
      </SummarySection>

      {/* Crop grid */}
      <SummarySection title="Crop details" icon={Package}>
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/50 bg-muted/20 p-4">
          <SummaryInfoBlock label="Variety" value={values.variety} />
          <SummaryInfoBlock label="Category" value={values.category} />
          <SummaryInfoBlock label="Stage" value={values.stage} />
          <SummaryInfoBlock
            label="Bags received"
            value={values.bagsReceived.toLocaleString("en-IN")}
            valueClassName="text-primary"
          />
        </div>
      </SummarySection>

      {/* Weight */}
      <SummarySection title="Weight slip" icon={Weight}>
        <WeightReceipt
          slipNumber={values.weightSlip.slipNumber}
          grossWeightKg={values.weightSlip.grossWeightKg}
          tareWeightKg={values.weightSlip.tareWeightKg}
        />
      </SummarySection>

      {values.remarks.trim() ? (
        <SummarySection title="Remarks" icon={FileText}>
          <div className="rounded-xl border border-border/50 border-dashed bg-muted/15 px-4 py-3.5">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground italic">
              &ldquo;{values.remarks}&rdquo;
            </p>
          </div>
        </SummarySection>
      ) : null}
    </div>
  )
}

export function IncomingSummarySheet({
  open,
  onOpenChange,
  values,
  farmerLabel,
  onBack,
  onSubmit,
  canSubmit,
  isSubmitting,
}: IncomingSummarySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b border-border/40 bg-muted/20 px-6 py-5">
          <div className="flex items-start gap-3 pr-8">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClipboardCheck className="size-5" />
            </span>
            <div className="min-w-0 space-y-1">
              <SheetTitle className="font-heading text-lg">
                Review gate pass
              </SheetTitle>
              <SheetDescription className="text-sm leading-relaxed">
                Check every field before you submit. You can go back to edit
                anything that looks wrong.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {values ? (
            <IncomingReviewSummary
              values={values}
              farmerLabel={farmerLabel}
            />
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 text-center">
              <Scale className="size-8 text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">
                No summary available
              </p>
              <p className="text-xs text-muted-foreground">
                Complete the form and open review again.
              </p>
            </div>
          )}
        </div>

        <SheetFooter className="flex-row gap-3 border-t border-border/40 bg-muted/10 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={onBack}
          >
            Back to edit
          </Button>
          <Button
            type="button"
            className="flex-1 sm:min-w-32"
            disabled={!canSubmit || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? "Submitting…" : "Confirm & submit"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
