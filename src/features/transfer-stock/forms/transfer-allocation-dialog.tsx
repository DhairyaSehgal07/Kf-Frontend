import { useEffect, useState } from "react"
import { MapPin, Package2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { StorageGatePass } from "@/features/transfer-stock/types/storage-gate-pass"
import type { BagSlotDetail } from "@/features/transfer-stock/utils/gate-pass-matrix-utils"
import { formatLocationShort } from "@/features/transfer-stock/utils/gate-pass-matrix-utils"

export type AllocationDialogTarget = {
  pass: StorageGatePass
  sizeName: string
  slot: BagSlotDetail
  allocationKey: string
  currentQuantity: number
}

type TransferAllocationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: AllocationDialogTarget | null
  initialQuantity: number
  onApply: (key: string, quantity: number) => void
  onClear: (key: string) => void
}

export function TransferAllocationDialog({
  open,
  onOpenChange,
  target,
  initialQuantity,
  onApply,
  onClear,
}: TransferAllocationDialogProps) {
  const [quantityInput, setQuantityInput] = useState("")

  useEffect(() => {
    if (open && target) {
      setQuantityInput(
        initialQuantity > 0 ? String(initialQuantity) : String(target.slot.currentQuantity)
      )
    }
  }, [open, target, initialQuantity])

  const handleApply = () => {
    if (!target) return
    const parsed = Number.parseInt(quantityInput, 10)
    if (Number.isNaN(parsed) || parsed < 1) {
      toast.error("Enter a valid quantity", {
        description: "Quantity must be at least 1.",
      })
      return
    }
    if (parsed > target.slot.currentQuantity) {
      toast.error("Quantity too high", {
        description: `Maximum available is ${target.slot.currentQuantity.toLocaleString("en-IN")} bags.`,
      })
      return
    }
    onApply(target.allocationKey, parsed)
    onOpenChange(false)
  }

  const handleClear = () => {
    if (!target) return
    onClear(target.allocationKey)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[90dvh] flex-col gap-0 p-0 sm:mx-auto sm:max-w-md sm:rounded-t-xl"
      >
        <SheetHeader className="border-b border-border/40 px-5 py-4 text-left">
          <SheetTitle className="font-heading text-base font-semibold">
            Transfer quantity
          </SheetTitle>
          <SheetDescription className="text-xs">
            Set how many bags to transfer from this slot.
          </SheetDescription>
        </SheetHeader>

        {target ? (
          <div className="space-y-5 overflow-y-auto px-5 py-5">
            <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Package2 className="size-4 text-primary shrink-0" />
                <span>
                  Gate pass{" "}
                  <span className="font-mono tabular-nums">
                    #{target.pass.gatePassNo}
                  </span>
                </span>
              </div>
              <p className="text-sm text-foreground">{target.pass.variety}</p>
              <p className="text-sm text-muted-foreground">
                Size: <span className="font-medium text-foreground">{target.sizeName}</span>
              </p>
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0 mt-0.5" />
                {formatLocationShort(target.slot)}
              </p>
              <p className="text-sm tabular-nums">
                Available:{" "}
                <span className="font-medium text-foreground">
                  {target.slot.currentQuantity.toLocaleString("en-IN")} bags
                </span>
              </p>
            </div>

            <Field>
              <FieldLabel htmlFor="transfer-allocation-qty">Quantity to transfer</FieldLabel>
              <Input
                id="transfer-allocation-qty"
                type="number"
                inputMode="numeric"
                min={1}
                max={target.slot.currentQuantity}
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                className="h-11 text-base tabular-nums"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleApply()
                  }
                }}
              />
              <FieldDescription>
                Enter a value from 1 to{" "}
                {target.slot.currentQuantity.toLocaleString("en-IN")}.
              </FieldDescription>
            </Field>
          </div>
        ) : null}

        <SheetFooter className="flex-row gap-2 border-t border-border/40 px-5 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          {target && initialQuantity > 0 ? (
            <Button
              type="button"
              variant="destructive"
              className="h-11"
              onClick={handleClear}
            >
              Clear
            </Button>
          ) : null}
          <Button
            type="button"
            className="h-11 flex-1"
            disabled={!target}
            onClick={handleApply}
          >
            Apply
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
