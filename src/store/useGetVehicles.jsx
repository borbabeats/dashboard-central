import { create } from "zustand";
import api from "../api/api";

export const useGetVehicles = create((set) => ({
  vehicles: [],
  isLoading: false,
  error: null,

  getVehicles: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get("/vehicles");
      set({ 
        vehicles: response.data || [],
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erro ao carregar veículos";
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  }
}));