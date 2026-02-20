/** Single temperature reading from GET /temperature */
export interface TemperatureReading {
  _id: string;
  coldStorageId: string;
  chamber: string;
  runningTemperature: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/** API response for GET /temperature */
export interface GetTemperatureReadingsApiResponse {
  success: boolean;
  data: TemperatureReading[];
  message: string;
}

/** Request body for POST /temperature */
export interface CreateTemperatureReadingInput {
  chamber: string;
  runningTemperature: number;
  date: string; // ISO date-time
}

/** API response for POST /temperature (201) */
export interface CreateTemperatureReadingApiResponse {
  success: boolean;
  data: TemperatureReading;
  message: string;
}

/** Request body for PUT /temperature/:id (at least one property required) */
export interface UpdateTemperatureReadingInput {
  chamber?: string;
  runningTemperature?: number;
  date?: string; // ISO date-time
}

/** API response for PUT /temperature/:id (200) */
export interface UpdateTemperatureReadingApiResponse {
  success: boolean;
  data: TemperatureReading;
  message: string;
}
