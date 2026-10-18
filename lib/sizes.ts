export type SizeRow = { label: string; bust: number; waist: number; hips: number }

export const SIZES: SizeRow[] = [
  { label: "XS",  bust: 32, waist: 24, hips: 34 },
  { label: "S",   bust: 34, waist: 26, hips: 36 },
  { label: "M",   bust: 36, waist: 28, hips: 38 },
  { label: "L",   bust: 38, waist: 30, hips: 40 },
  { label: "XL",  bust: 40, waist: 32, hips: 42 },
  { label: "2XL", bust: 42, waist: 34, hips: 44 },
  { label: "3XL", bust: 44, waist: 36, hips: 46 },
  { label: "4XL", bust: 46, waist: 38, hips: 48 },
]

type MeasureField = "bust" | "waist" | "hips"

export interface Driver {
  field: MeasureField
  value: number
  fits: string
}

export type SizeResult =
  | { status: "error" }
  | { status: "off-chart" }
  | { status: "size"; size: SizeRow; drivers: Driver[]; deadOn: boolean }

export function recommendSize(input: {
  bust?: number
  waist?: number
  hips?: number
}): SizeResult {
  const fields: MeasureField[] = ["bust", "waist", "hips"]
  const provided: { field: MeasureField; value: number }[] = []

  for (const f of fields) {
    const v = input[f]
    if (v !== undefined && v > 0 && Number.isFinite(v)) {
      provided.push({ field: f, value: v })
    }
  }

  if (provided.length === 0) return { status: "error" }

  const drivers: Driver[] = []
  let maxIndex = 0

  for (const { field, value } of provided) {
    const idx = SIZES.findIndex((row) => value <= row[field])
    if (idx === -1) return { status: "off-chart" }
    drivers.push({ field, value, fits: SIZES[idx].label })
    if (idx > maxIndex) maxIndex = idx
  }

  const size = SIZES[maxIndex]
  const deadOn = drivers.every((d) => {
    const matchedRow = SIZES.find((r) => r.label === d.fits)!
    return d.value === matchedRow[d.field]
  })

  return { status: "size", size, drivers, deadOn }
}
