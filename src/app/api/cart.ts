import { apiClientCart,  APIResponse } from "./client"

export interface CartProps {
  itemId: number
  type: string
  title: string
  category: string
  price: number
  coverUrl: string
  quantity: number
}

export const getCart = async (): Promise<APIResponse<CartProps[]>>=>{
    const response = await apiClientCart.get("/")
    return response.data
}

export const removeItem = async(courseId:number):Promise<APIResponse>=>{
    const response = await apiClientCart.delete(`/${courseId}`)
    return response.data
}

export const addItem = async(courseId: number): Promise<APIResponse>=>{
    const response = await apiClientCart.post(`/`,{courseId})
    return response.data
}


