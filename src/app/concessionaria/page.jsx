"use client";

import { useEffect, useState, useRef } from 'react';
import { useGetVehicles } from '../../store/useGetVehicles';
import { VehiclesTable } from './VehiclesTable';
import ConfirmModal from '../components/ConfirmModal';
import api from '../../api/api';
import styles from './page.module.scss';

export default function ConcessionariaPage() {
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
    console.log('Edit vehicle:', vehicle);
    // TODO: Implement edit functionality
    // Example: router.push(`/concessionaria/editar/${vehicle.id}`);
  };

  const handleDelete = async (vehicleId) => {
    try {
      const response = await api.delete(`/vehicles/${vehicleId}`);
      
      if (response.status === 204) {
        // Recarrega a lista de veículos após a exclusão
        await getVehicles();
        return true;
      } else {
        throw new Error(`Erro inesperado: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      // A notificação de erro será tratada pelo componente VehiclesTable
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
    <main className={styles.concessionariaContainer}>
      <div className={styles.header}>
        <h1>Concessionária</h1>
        <p className={styles.subtitle}>Lista de veículos disponíveis</p>
      </div>

      {error ? (
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>
            Erro ao carregar veículos: {error.message}
            <button 
              className={styles.retryButton} 
              onClick={getVehicles}
              aria-label="Tentar novamente"
            >
              Tentar novamente
            </button>
          </p>
        </div>
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
          message={`Tem certeza que deseja excluir o veículo ${vehicleToDelete.current.name}?`}
          confirmText="Excluir"
          cancelText="Cancelar"
        />
      )}
    </main>
  );
}