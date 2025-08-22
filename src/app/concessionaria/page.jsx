"use client";

import { useEffect } from 'react';
import { useGetVehicles } from '@/store/useGetVehicles';
import { VehiclesTable } from './VehiclesTable';
import styles from './page.module.scss';

export default function ConcessionariaPage() {
  const { vehicles, isLoading, error, getVehicles } = useGetVehicles();

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
      console.log('Delete vehicle:', vehicleId);
      // TODO: Implement delete functionality
      // Example: await deleteVehicle(vehicleId);
      // getVehicles(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting vehicle:', error);
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
        />
      )}
    </main>
  );
}