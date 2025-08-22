"use client";

import { useMemo, useCallback, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { LoadingSpinner } from '../components/LoadingSpinner';
import styles from './page.module.scss';

/**
 * Componente de tabela para exibição de veículos
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.data - Dados dos veículos
 * @param {boolean} [props.isLoading=false] - Indica se os dados estão sendo carregados
 * @param {Function} [props.onSortChange=() => {}] - Função chamada quando a ordenação é alterada
 * @param {Function} [props.onEdit=() => {}] - Função chamada ao editar um veículo
 * @param {Function} [props.onDelete=() => {}] - Função chamada ao excluir um veículo
 * @returns {JSX.Element} Tabela de veículos
 */
export function VehiclesTable({ 
  data = [], 
  isLoading = false, 
  onSortChange = () => {},
  onEdit = (vehicle) => console.log('Edit vehicle:', vehicle),
  onDelete = (vehicleId) => console.log('Delete vehicle:', vehicleId)
}) {
  const tableRef = useRef(null);
  const firstRender = useRef(true);
  const columns = useMemo(
    () => [
      {
        header: 'ID',
        accessorKey: 'id',
        size: 80,
      },
      {
        header: 'Modelo',
        accessorKey: 'modelo',
      },
      {
        header: 'Preço',
        accessorKey: 'preco',
        cell: (info) => {
          const value = parseFloat(info.getValue());
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(value);
        },
      },
      {
        header: 'Quilometragem',
        accessorKey: 'quilometragem',
        cell: (info) => `${info.getValue().toLocaleString('pt-BR')} km`,
      },
      {
        header: 'Descrição',
        accessorKey: 'descricao',
      },
      {
        header: 'Ações',
        id: 'actions',
        cell: ({ row }) => (
          <div className={styles.actions}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row.original);
              }}
              className={styles.actionButton}
              aria-label={`Editar veículo ${row.original.modelo}`}
            >
              <FaEdit />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Tem certeza que deseja excluir o veículo ${row.original.modelo}?`)) {
                  onDelete(row.original.id);
                }
              }}
              className={`${styles.actionButton} ${styles.deleteButton}`}
              aria-label={`Excluir veículo ${row.original.modelo}`}
            >
              <FaTrash />
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: true,
    autoResetPageIndex: false,
    initialState: {
      sorting: [{ id: 'id', desc: false }],
    },
    state: {
      sorting: [{ id: 'id', desc: false }],
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' 
        ? updater(table.getState().sorting) 
        : updater;
      
      if (newSorting.length > 0) {
        onSortChange(newSorting[0]);
      }
    },
  });
  
  const { rows } = table.getRowModel();
  
  // Foco no cabeçalho da tabela quando os dados são carregados
  useEffect(() => {
    if (!firstRender.current && !isLoading && tableRef.current) {
      const firstHeaderCell = tableRef.current.querySelector('th button, th [tabindex]');
      if (firstHeaderCell) {
        firstHeaderCell.focus();
      }
    }
    firstRender.current = false;
  }, [isLoading]);
  
  // Função para lidar com a ordenação por teclado
  const handleSortKeyDown = useCallback((e, header) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      header.column.getToggleSortingHandler()(e);
    }
  }, []);

  if (!isLoading && rows.length === 0) {
    return (
      <div className={styles.emptyState} role="status" aria-live="polite">
        <p>Nenhum veículo encontrado</p>
      </div>
    );
  }

  return (
    <div 
      className={styles.tableContainer}
      ref={tableRef}
      role="region" 
      aria-labelledby="tabela-veiculos"
      tabIndex="-1"
    >
      <div className={styles.tableWrapper}>
        <table 
          className={styles.table} 
          aria-label="Lista de veículos"
          aria-describedby="tabela-descricao"
        >
          <caption className="sr-only" id="tabela-descricao">
            Lista de veículos disponíveis na concessionária
          </caption>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();
                  const sortLabel = sortDirection === 'asc' 
                    ? ' (ordem crescente)' 
                    : sortDirection === 'desc' 
                      ? ' (ordem decrescente)' 
                      : '';
                  
                  return (
                    <th 
                      key={header.id} 
                      className={`${styles.th} ${canSort ? styles.sortableHeader : ''}`}
                      scope="col"
                      aria-sort={
                        sortDirection
                          ? sortDirection === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      {canSort ? (
                        <button
                          type="button"
                          className={styles.sortButton}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => handleSortKeyDown(e, header)}
                          aria-label={`Ordenar por ${header.column.columnDef.header}${sortLabel}`}
                          aria-pressed={!!sortDirection}
                          tabIndex={0}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <span className={styles.sortIcon} aria-hidden="true">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        </button>
                      ) : (
                        <div className={styles.headerContent}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <tr 
                key={row.id} 
                className={styles.tr}
                role="row"
                aria-rowindex={rowIndex + 2}
              >
                {row.getVisibleCells().map((cell, cellIndex) => (
                  <td 
                    key={cell.id} 
                    className={styles.td}
                    data-label={cell.column.columnDef.header}
                    role="gridcell"
                    aria-colindex={cellIndex + 1}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {isLoading && (
          <div 
            className={styles.loadingOverlay}
            role="status"
            aria-live="polite"
            aria-busy={isLoading}
          >
            <LoadingSpinner size="medium" />
            <span className="sr-only">Carregando veículos...</span>
          </div>
        )}
      </div>
    </div>
  );
}
