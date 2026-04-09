import { apiClientCourse, APIResponse, PaginatedPayload } from "./client"

export interface PromptParams {
  page: number
  size: number
  category: string | null
  sort_field: string | null
  sort_order: "asc" | "desc" |null
  min_vote: number
}

export interface PromptProps {
  courseId: number
  title: string
  description: string
  ownedBy: string
  coverUrl: string
  category: string
  price: number
  vote: number
  purchasedCount: number
  duration: number
}

export const getPrompts = async (
  params: PromptParams,
): Promise<APIResponse<PaginatedPayload<PromptProps>>> => {
  const response = await apiClientCourse.get("/", {
    params: params,
  })
  return response.data
}

export const getPromptById = async (
  courseId: number,
): Promise<APIResponse<PromptProps>> => {
  const response = await apiClientCourse.get(`/${courseId}`)
  return response.data
}

export const getPromptCategories = async():Promise<APIResponse>=>{
    const response = await apiClientCourse.get('/categories')
    return response.data
}