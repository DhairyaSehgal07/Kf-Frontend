import type {
  BookingSummaryTableData,
  BookingVarietySummary,
} from "@/features/booking/types/booking-summary"
import { orderBagSizeNames } from "@/features/booking/lib/order-bag-size-names"

const bagFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
})

export function formatBookingBagCount(value: number): string {
  return bagFormatter.format(value)
}

export function buildBookingSummaryTable(
  data: BookingVarietySummary[],
): BookingSummaryTableData {
  const sizeNames = orderBagSizeNames(
    data.flatMap((variety) => variety.sizes.map((size) => size.size)),
  )

  const rows = data.map((variety) => {
    const bySize = new Map(
      variety.sizes.map((size) => [size.size, size.quantity]),
    )
    const values: Record<string, number> = {}
    for (const sizeName of sizeNames) {
      values[sizeName] = Number(bySize.get(sizeName) ?? 0)
    }
    return {
      variety: variety.variety,
      values,
      total: variety.quantity,
    }
  })

  const totals: Record<string, number> = {}
  for (const sizeName of sizeNames) {
    totals[sizeName] = rows.reduce(
      (sum, row) => sum + Number(row.values[sizeName] ?? 0),
      0,
    )
  }
  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0)

  return { sizeNames, rows, totals, grandTotal }
}

function getQuantityBySize(
  variety: BookingVarietySummary,
  size: string,
): number {
  return variety.sizes.find((entry) => entry.size === size)?.quantity ?? 0
}

export function computeNetAvailable(
  total: BookingVarietySummary[],
  booked: BookingVarietySummary[],
): BookingVarietySummary[] {
  const bookedByVariety = new Map(
    booked.map((variety) => [variety.variety, variety]),
  )

  const allVarieties = new Set([
    ...total.map((variety) => variety.variety),
    ...booked.map((variety) => variety.variety),
  ])

  const allSizes = orderBagSizeNames([
    ...total.flatMap((variety) => variety.sizes.map((size) => size.size)),
    ...booked.flatMap((variety) => variety.sizes.map((size) => size.size)),
  ])

  return [...allVarieties].map((varietyName) => {
    const totalVariety = total.find((entry) => entry.variety === varietyName)
    const bookedVariety = bookedByVariety.get(varietyName)

    const sizes = allSizes.map((size) => ({
      size,
      quantity: Math.max(
        0,
        getQuantityBySize(totalVariety ?? { variety: varietyName, quantity: 0, sizes: [] }, size) -
          getQuantityBySize(bookedVariety ?? { variety: varietyName, quantity: 0, sizes: [] }, size),
      ),
    }))

    const quantity = sizes.reduce((sum, size) => sum + size.quantity, 0)

    return {
      variety: varietyName,
      quantity,
      sizes,
    }
  })
}

export function sumBookingGrandTotal(data: BookingVarietySummary[]): number {
  return data.reduce((sum, variety) => sum + variety.quantity, 0)
}
