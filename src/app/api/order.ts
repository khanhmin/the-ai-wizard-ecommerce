import { apiClientOrder } from "./client"

export const getOrders = async () => {
  const response = await apiClientOrder.get("/")
  return response.data
}

export const getOrderById = async (orderId: number) => {
  const response = await apiClientOrder.get(`/${orderId}`)
  return response.data
}
