"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGetVehicles } from '../../store/useGetVehicles';
import { VehiclesTable } from './VehiclesTable';
import ConfirmModal from '../components/ConfirmModal';
import api from '../../api/api';
import { Button, Stack, Typography, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Link from 'next/link';

export default function ConcessionariaPage() {
  const router = useRouter();
  const { vehicles, isLoading, error, getVehicles } = useGetVehicles();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const vehicleToDelete = useRef(null);

  useEffect(() => {
    getVehicles();
  }, [getVehicles]);

  const handleSortChange = (sorting) => {
    console.log('Sorting changed:', sorting);
  };

  const handleEdit = (vehicle) => {
    router.push(`/concessionaria/edit/${vehicle.id}`);
  };

  const handleDelete = async (vehicleId) => {
    try {
      const response = await api.delete(`/vehicles/${vehicleId}`);
      
      if (response.status === 204 || response.status === 200) {
        // Recarrega a lista de veículos após a exclusão
        await getVehicles();
        return true;
      } else {
        throw new Error(`Erro inesperado: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      
      // Mostrar erro mais detalhado
      let errorMessage = 'Erro ao excluir veículo';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      throw error;
    } finally {
      setShowDeleteConfirm(false);
      vehicleToDelete.current = null;
    }
  };

  const handleDeleteClick = (vehicleId) => {
    if (!vehicleId || isNaN(parseInt(vehicleId, 10))) {
      console.error('ID de veículo inválido');
      return;
    }
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      vehicleToDelete.current = {
        id: vehicle.id,
        name: vehicle.modelo || 'Veículo sem nome'
      };
      setShowDeleteConfirm(true);
    }
  };


  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4} flexWrap="wrap" gap={2}>
        <div>
          <Typography variant="h4" component="h1" sx={{ mb: 1, color: 'text.primary' }}>
            Concessionária
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Lista de veículos disponíveis
          </Typography>
        </div>
        <Button
          component={Link}
          href="/concessionaria/create"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Novo Veículo
        </Button>
      </Stack>

      {error ? (
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: 'error.light', 
            color: 'error.contrastText',
            borderRadius: 1,
            mb: 3
          }}
        >
          <Typography variant="body1" sx={{ mb: 2 }}>
            Erro ao carregar veículos: {error.message}
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={getVehicles}
            aria-label="Tentar novamente"
          >
            Tentar novamente
          </Button>
        </Box>
      ) : (
        <VehiclesTable 
          data={vehicles} 
          isLoading={isLoading} 
          onSortChange={handleSortChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteClick={handleDeleteClick}
        />
      )}
      {showDeleteConfirm && vehicleToDelete.current && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={async () => {
            try {
              await handleDelete(vehicleToDelete.current.id);
            } catch (error) {
              // O erro já foi tratado no handleDelete
              // O modal será fechado pelo finally do handleDelete
            }
          }}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir o veículo ${vehicleToDelete.current?.name}?`}
          confirmText="Excluir"
          cancelText="Cancelar"
        />
      )}
    </Box>
  );
}