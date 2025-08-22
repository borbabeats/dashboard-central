import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

export const tableConfig = {
  // Configurações padrão para todas as tabelas
  default: {
    pageSize: 10,
    pageIndex: 0,
  },
  // Estilos padrão para as células
  styles: {
    header: 'font-semibold text-left py-3 px-4',
    cell: 'py-3 px-4 border-b border-gray-100',
  },
};
