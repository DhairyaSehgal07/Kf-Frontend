/** Single chamber reading within a temperature document */
export interface TemperatureReadingItem {
  chamber: string;
  value: number;
}

/** Temperature document from API (one per date, multiple chambers) */
export interface Temperature {
  _id: string;
  coldStorageId?: string;
  date: string;
  temperatureReading: TemperatureReadingItem[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

/** API response for GET /temperature */
export interface GetTemperatureReadingsApiResponse {
  success: boolean;
  data: Temperature[];
  message: string;
}

/** Request body for POST /temperature */
export interface CreateTemperatureReadingInput {
  date: string; // ISO date-time
  temperatureReading: TemperatureReadingItem[];
}

/** API response for POST /temperature (201) */
export interface CreateTemperatureReadingApiResponse {
  success: boolean;
  data: Temperature;
  message: string;
}

/** Request body for PUT /temperature/:id (at least one property required) */
export interface UpdateTemperatureReadingInput {
  date?: string; // ISO date-time
  temperatureReading?: TemperatureReadingItem[];
}

/** API response for PUT /temperature/:id (200) */
export interface UpdateTemperatureReadingApiResponse {
  success: boolean;
  data: Temperature;
  message: string;
}

/**
 * Flattened row for table display: one row per (date, chamber) with value.
 * Includes document reference for edit (so we can send full temperatureReading).
 */
export interface TemperatureTableRow {
  documentId: string;
  document: Temperature;
  date: string;
  chamber: string;
  value: number;
}

/** Flatten temperature documents to one table row per chamber reading */
export function flattenTemperatureToTableRows(
  docs: Temperature[]
): TemperatureTableRow[] {
  const rows: TemperatureTableRow[] = [];
  for (const doc of docs) {
    for (const reading of doc.temperatureReading ?? []) {
      rows.push({
        documentId: doc._id,
        document: doc,
        date: doc.date,
        chamber: reading.chamber,
        value: reading.value,
      });
    }
  }
  return rows;
}
