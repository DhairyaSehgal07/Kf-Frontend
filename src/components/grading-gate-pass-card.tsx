import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileText,
  Package,
  Pencil,
  Printer,
  Scale,
  Sprout,
  Truck,
  User,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import type {
  GradingGatePass,
  GradingGatePassFarmerStorageLink,
  GradingOrderDetail,
} from "@/features/grading/api/types"

interface InfoBlockProps {
  label: string
  value: string | number
  icon?: LucideIcon
  valueClassName?: string
}

const InfoBlock = ({
  label,
  value,
  icon: Icon,
  valueClassName,
}: InfoBlockProps) => (
  <div className="space-y-1.5">
    <span className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
    <p className={cn("text-sm font-semibold text-foreground", valueClassName)}>
      {value}
    </p>
  </div>
)

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function formatKg(value: number) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value)
}

export function gradingTotalBags(orderDetails: readonly GradingOrderDetail[]) {
  return orderDetails.reduce((sum, row) => sum + row.quantity, 0)
}

export function gradingTotalWeightKg(orderDetails: readonly GradingOrderDetail[]) {
  return orderDetails.reduce(
    (sum, row) => sum + row.quantity * row.weightPerBagKg,
    0,
  )
}

function isPopulatedFarmerStorageLink(
  value: GradingGatePass["farmerStorageLinkId"],
): value is GradingGatePassFarmerStorageLink {
  return typeof value !== "string"
}

interface GradingGatePassCardProps {
  data: GradingGatePass
  canUpdate?: boolean
}

export function GradingGatePassCard({
  data: gatePass,
  canUpdate = true,
}: GradingGatePassCardProps) {
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(false)

  const farmerStorageLink = isPopulatedFarmerStorageLink(
    gatePass.farmerStorageLinkId,
  )
    ? gatePass.farmerStorageLinkId
    : undefined
  const farmer = farmerStorageLink?.farmerId
  const totalBags = gradingTotalBags(gatePass.orderDetails)
  const totalWeightKg = gradingTotalWeightKg(gatePass.orderDetails)
  const incomingCount = gatePass.incomingGatePassIds.length

  const handleEditClick = () => {
    if (!canUpdate) return
    navigate({
      to: "/grading/$id",
      params: { id: gatePass._id },
    })
  }

  return (
    <Card className="card-hover overflow-hidden border-border/60">
      <CardHeader className="flex flex-col gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="h-2 w-2 rounded-full bg-primary" />
              GGP{" "}
              <span className="font-mono tabular-nums text-primary">
                #{gatePass.gatePassNo}
              </span>
            </CardTitle>
            {gatePass.manualGatePassNumber != null && (
              <Badge
                variant="outline"
                className="bg-background font-mono text-[10px] tabular-nums uppercase"
              >
                Manual: {gatePass.manualGatePassNumber}
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            {formatDateTime(gatePass.date)}
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge
            variant="outline"
            className="max-w-36 truncate bg-background text-[11px]"
            title={gatePass.variety}
          >
            {gatePass.variety}
          </Badge>
          <Badge
            variant="outline"
            className="bg-background text-[11px] tabular-nums"
          >
            {totalBags.toLocaleString("en-IN")} Bags
          </Badge>
          <Badge variant="secondary" className="text-[11px] tabular-nums">
            {incomingCount} incoming
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <InfoBlock label="Farmer" value={farmer?.name ?? "—"} icon={User} />
          <InfoBlock
            label="Account"
            value={farmerStorageLink?.accountNumber ?? "—"}
            valueClassName="tabular-nums"
          />
          <InfoBlock label="Variety" value={gatePass.variety} icon={Sprout} />
          <InfoBlock
            label="Graded weight"
            value={`${formatKg(totalWeightKg)} kg`}
            icon={Scale}
            valueClassName="tabular-nums"
          />
        </div>

        {isExpanded && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <Separator className="mb-6" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Truck className="h-4 w-4 text-primary" />
                    Incoming gate passes
                  </h4>
                  <div className="overflow-hidden rounded-xl border border-border/50">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="border-b border-border/50 bg-muted/50">
                        <tr>
                          <th className="h-9 px-3 text-left text-xs font-medium text-muted-foreground">
                            IGP #
                          </th>
                          <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                            Bags
                          </th>
                          <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                            Net kg
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {gatePass.incomingGatePassIds.map((incoming) => {
                          const netKg =
                            incoming.grossWeightKg - incoming.tareWeightKg
                          return (
                            <tr
                              key={incoming.gatePassNo}
                              className="border-b border-border/40 last:border-0"
                            >
                              <td className="px-3 py-2.5 font-mono text-sm font-medium tabular-nums">
                                #{incoming.gatePassNo}
                                {incoming.manualGatePassNumber != null && (
                                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                                    (M: {incoming.manualGatePassNumber})
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                                {incoming.bagsReceived.toLocaleString("en-IN")}
                              </td>
                              <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                                {formatKg(netKg)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    Remarks
                  </h4>
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                    <p className="text-sm italic text-muted-foreground">
                      {gatePass.remarks
                        ? `"${gatePass.remarks}"`
                        : "No remarks provided."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Package className="h-4 w-4 text-primary" />
                    Graded quantities
                  </h4>
                  <div className="overflow-hidden rounded-xl border border-border/50">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="border-b border-border/50 bg-muted/50">
                        <tr>
                          <th className="h-9 px-3 text-left text-xs font-medium text-muted-foreground">
                            Size
                          </th>
                          <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                            Qty
                          </th>
                          <th className="h-9 px-3 text-left text-xs font-medium text-muted-foreground">
                            Type
                          </th>
                          <th className="h-9 px-3 text-right text-xs font-medium text-muted-foreground">
                            kg/bag
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {gatePass.orderDetails.map((row, index) => (
                          <tr
                            key={`${row.size}-${index}`}
                            className="border-b border-border/40 last:border-0"
                          >
                            <td className="px-3 py-2.5 font-medium">{row.size}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums">
                              {row.quantity.toLocaleString("en-IN")}
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground">
                              {row.bagType}
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums">
                              {formatKg(row.weightPerBagKg)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center gap-6 rounded-xl border border-border/50 bg-muted/20 p-4">
                  <InfoBlock
                    label="Created by"
                    value={gatePass.createdBy.name}
                    icon={ClipboardList}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/40 bg-muted/10 px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" /> View less
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" /> View full details
            </>
          )}
        </Button>

        <div className="flex items-center gap-2">
          {canUpdate && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="h-8 bg-background"
            >
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </Button>
          )}
          <Button variant="secondary" size="sm" className="h-8">
            <Printer className="mr-2 h-3.5 w-3.5" />
            Print
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export function GradingGatePassCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/60">
      <CardHeader className="flex flex-col gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-5 w-full max-w-28" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border/40 bg-muted/10 px-4 py-3">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  )
}
