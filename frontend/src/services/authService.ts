import apiClient from './api'
import type { 
  LoginCredentials, 
  RegisterData, 
  User, 
  ApiResponse 
} from '../types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const { data } = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/login',
      credentials
    )
    return data.data!
  },

  async register(userData: RegisterData): Promise<{ user: User; token: string }> {
    const { data } = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/register',
      userData
    )
    return data.data!
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me')
    return data.data!.user
  },

  async refreshToken(token: string): Promise<string> {
    const { data } = await apiClient.post<ApiResponse<{ token: string }>>(
      '/auth/refresh',
      { token }
    )
    return data.data!.token
  },
}
