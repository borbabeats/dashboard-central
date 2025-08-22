import { create } from "zustand";
import api from "../api/api";

// Tipos
/** @typedef {{ id: string, desc: boolean }} SortingState */

const initialState = {
    posts: [],
    meta: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    },
    isLoading: false,
    error: null,
    sorting: {
        id: 'published_at',
        desc: true
    },
};

/**
 * Hook para gerenciar o estado e as operações dos posts
 * @returns {Object} Estado e funções para manipulação dos posts
 */
export const useGetPosts = create((set, get) => ({
    ...initialState,
    
    /**
     * Atualiza os posts manualmente
     * @param {Array} posts - Lista de posts
     */
    setPosts: (posts) => set({ posts }),
    
    /**
     * Busca os posts da API com paginação e ordenação
     * @param {number} [page=1] - Página atual
     * @param {number} [perPage=10] - Itens por página
     * @param {SortingState} [sort] - Configuração de ordenação
     * @returns {Promise<Object>} Dados da resposta da API
     */
    getPosts: async (page = 1, perPage = 10, sort) => {
        const currentState = get();
        const sorting = sort || currentState.sorting;
        
        set({ 
            isLoading: true, 
            error: null,
            ...(sort && { sorting }), // Atualiza a ordenação se fornecida
        });
        
        try {
            const response = await api.get("/posts", {
                params: {
                    page,
                    per_page: perPage,
                    sort_by: sorting.id,
                    sort_order: sorting.desc ? 'desc' : 'asc',
                },
            });
            
            const newState = { 
                posts: response.data.data || [],
                meta: {
                    current_page: response.data.meta?.current_page || page,
                    last_page: response.data.meta?.last_page || 1,
                    per_page: response.data.meta?.per_page || perPage,
                    total: response.data.meta?.total || 0,
                },
                isLoading: false,
                error: null,
            };
            
            set(newState);
            return response.data;
        } catch (error) {
            console.error("Erro ao buscar posts:", error);
            
            // Mensagem de erro amigável
            let errorMessage = "Erro ao carregar as postagens";
            
            if (error.response) {
                // Erro da API
                errorMessage = error.response.data?.message || 
                              `Erro ${error.response.status}: ${error.response.statusText}`;
            } else if (error.request) {
                // Erro de conexão
                errorMessage = "Não foi possível conectar ao servidor. Verifique sua conexão.";
            }
            
            set({
                posts: [],
                meta: initialState.meta,
                isLoading: false,
                error: errorMessage,
            });
            
            // Propaga o erro para tratamento no componente
            throw new Error(errorMessage);
        }
    },
    
    /**
     * Define a ordenação atual
     * @param {SortingState} sort - Configuração de ordenação
     */
    setSorting: (sort) => set({ sorting: sort }),
    
    /**
     * Limpa o estado para os valores iniciais
     */
    reset: () => set(initialState),
}));
