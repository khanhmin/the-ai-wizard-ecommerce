import { apiClientUser, APIResponse } from "./client"

export interface SignupData{
    name: string 
    email: string 
    password: string
}
export interface LoginData{
    email: string 
    password: string
}

export const signup = async(
    data: SignupData
): Promise<APIResponse>=>{
    const response = await apiClientUser.post<APIResponse>('/signup',data)
    return response.data

}

export const login = async(
    data: LoginData
): Promise<APIResponse>=>{
    const response = await apiClientUser.post<APIResponse>('/login',data)
    return response.data
}

