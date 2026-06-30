import apiClient from './api'
import type { Asset, ApiResponse, PaginatedResponse } from '../types'

export const assetService = {
  async getAssets(params?: {
    type?: string
    status?: string
    locationId?: string
    departmentId?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Asset>> {
    const { data } = await apiClient.get<ApiResponse<{ 
      assets: Asset[]
      pagination: PaginatedResponse<Asset>['pagination'] 
    }>>('/assets', { params })
    return {
      data: data.data!.assets,
      pagination: data.data!.pagination,
    }
  },

  async getAssetById(id: string): Promise<Asset> {
    const { data } = await apiClient.get<ApiResponse<{ asset: Asset }>>(`/assets/${id}`)
    return data.data!.asset
  },

  async createAsset(assetData: Partial<Asset>): Promise<Asset> {
    const { data } = await apiClient.post<ApiResponse<{ asset: Asset }>>('/assets', assetData)
    return data.data!.asset
  },

  async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset> {
    const { data } = await apiClient.put<ApiResponse<{ asset: Asset }>>(`/assets/${id}`, updates)
    return data.data!.asset
  },

  async deleteAsset(id: string): Promise<void> {
    await apiClient.delete(`/assets/${id}`)
  },
}
