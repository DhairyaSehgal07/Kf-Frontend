import { BAG_SIZES } from "@/lib/constants"
import type { BookingVarietySummary } from "@/features/booking/types/booking-summary"

const VARIETIES = ["Himalini", "K. Pukhraj", "K. Jyoti"] as const

/** Total stock per variety × bag size (placeholder until API is wired). */
const TOTAL_BY_VARIETY: Record<
  (typeof VARIETIES)[number],
  Record<(typeof BAG_SIZES)[number], number>
> = {
  Himalini: {
    Ration: 1200,
    Seed: 850,
    Goli: 420,
    "Number-8": 310,
    "Number-10": 540,
    "Number-12": 280,
    "Number-6/4": 190,
    Cut: 95,
  },
  "K. Pukhraj": {
    Ration: 980,
    Seed: 720,
    Goli: 360,
    "Number-8": 410,
    "Number-10": 620,
    "Number-12": 340,
    "Number-6/4": 150,
    Cut: 80,
  },
  "K. Jyoti": {
    Ration: 760,
    Seed: 540,
    Goli: 290,
    "Number-8": 220,
    "Number-10": 480,
    "Number-12": 210,
    "Number-6/4": 130,
    Cut: 60,
  },
}

/** Booked quantities per variety × bag size (placeholder until API is wired). */
const BOOKED_BY_VARIETY: Record<
  (typeof VARIETIES)[number],
  Record<(typeof BAG_SIZES)[number], number>
> = {
  Himalini: {
    Ration: 400,
    Seed: 280,
    Goli: 120,
    "Number-8": 90,
    "Number-10": 200,
    "Number-12": 110,
    "Number-6/4": 60,
    Cut: 25,
  },
  "K. Pukhraj": {
    Ration: 320,
    Seed: 210,
    Goli: 140,
    "Number-8": 150,
    "Number-10": 240,
    "Number-12": 100,
    "Number-6/4": 45,
    Cut: 30,
  },
  "K. Jyoti": {
    Ration: 180,
    Seed: 160,
    Goli: 80,
    "Number-8": 70,
    "Number-10": 190,
    "Number-12": 85,
    "Number-6/4": 40,
    Cut: 15,
  },
}

function buildVarietySummary(
  variety: (typeof VARIETIES)[number],
  quantities: Record<(typeof BAG_SIZES)[number], number>,
): BookingVarietySummary {
  const sizes = BAG_SIZES.map((size) => ({
    size,
    quantity: quantities[size],
  }))
  const quantity = sizes.reduce((sum, size) => sum + size.quantity, 0)

  return {
    variety,
    quantity,
    sizes,
  }
}

export const PLACEHOLDER_TOTAL_SUMMARY: BookingVarietySummary[] = VARIETIES.map(
  (variety) => buildVarietySummary(variety, TOTAL_BY_VARIETY[variety]),
)

export const PLACEHOLDER_BOOKED_SUMMARY: BookingVarietySummary[] = VARIETIES.map(
  (variety) => buildVarietySummary(variety, BOOKED_BY_VARIETY[variety]),
)
