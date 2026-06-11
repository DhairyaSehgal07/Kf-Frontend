import apiClient, { getApiErrorMessage } from "@/lib/api-client"

import type {
  DaybookListResult,
  DaybookQueryParams,
  DaybookResponse,
} from "./types"

const EMPTY_PAGINATION: DaybookListResult["pagination"] = {
  currentPage: 1,
  totalPages: 0,
  totalItems: 0,
  itemsPerPage: 10,
  hasNextPage: false,
  hasPreviousPage: false,
  nextPage: null,
  previousPage: null,
}

export function buildDaybookQueryParams(
  params: DaybookQueryParams,
): Record<string, string | number> {
  const query: Record<string, string | number> = {}

  if (params.type) query.type = params.type
  if (params.sortBy) query.sortBy = params.sortBy
  if (params.page != null) query.page = params.page
  if (params.limit != null) query.limit = params.limit

  return query
}

export async function getDaybook(
  params: DaybookQueryParams = {},
): Promise<DaybookListResult> {
  try {
    const { data } = await apiClient.get<DaybookResponse>(
      "/store-admin/daybook",
      { params: buildDaybookQueryParams(params) },
    )

    if (!data.success) {
      throw new Error("Failed to load daybook")
    }

    return {
      entries: data.data,
      pagination: data.pagination,
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to load daybook"), {
      cause: error,
    })
  }
}

export function emptyDaybookResult(
  limit = EMPTY_PAGINATION.itemsPerPage,
): DaybookListResult {
  return {
    entries: [],
    pagination: {
      ...EMPTY_PAGINATION,
      itemsPerPage: limit,
    },
  }
}
