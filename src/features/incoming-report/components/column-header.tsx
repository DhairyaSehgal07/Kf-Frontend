import { cn } from "@/lib/utils"

export type ReportColumnHeaderAlign = "left" | "right"

export interface ReportColumnHeaderProps {
  title: string
  /** Muted unit line under the label (e.g. kg for weight columns) */
  unit?: string
  align?: ReportColumnHeaderAlign
  numeric?: boolean
}

export function ReportColumnHeader({
  title,
  unit,
  align = "left",
  numeric = false,
}: ReportColumnHeaderProps) {
  if (unit) {
    return (
      <span
        className={cn(
          "flex w-full min-w-0 flex-col gap-0.5",
          align === "right" && "items-end text-right",
        )}
      >
        <span
          className={cn(
            "text-sm font-medium leading-tight text-inherit",
            numeric && "tabular-nums",
          )}
        >
          {title}
        </span>
        <span className="text-xs font-normal text-inherit opacity-70">{unit}</span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        "block w-full min-w-0 text-sm font-medium leading-tight text-inherit",
        align === "right" && "text-right",
        numeric && "tabular-nums",
      )}
    >
      {title}
    </span>
  )
}

type HeaderOptions = Omit<ReportColumnHeaderProps, "title">

/** ColumnDef header factory for consistent report table headers */
export function reportColumnHeader(title: string, options?: HeaderOptions) {
  return () => <ReportColumnHeader title={title} {...options} />
}
