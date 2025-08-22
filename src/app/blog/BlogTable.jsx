"use client";

import { useMemo, useCallback, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { LoadingSpinner } from '../components/LoadingSpinner';
import styles from './page.module.scss';
import { FaEdit, FaTrash } from 'react-icons/fa';

// Tipos para as props do componente
/**
 * @typedef {Object} ColumnDef
 * @property {string} header
 * @property {string} accessorKey
 * @property {function} [cell]
 */

/**
 * @typedef {Object} BlogTableProps
 * @property {Array<Object>} data - Dados da tabela
 * @property {ColumnDef[]} columns - Definição das colunas
 * @property {function} onEdit - Função chamada ao editar um post
 * @property {function} onDelete - Função chamada ao excluir um post
 */

/**
 * Componente de tabela para exibição de posts do blog
 * @param {BlogTableProps} props - Propriedades do componente
 */
/**
 * Componente de tabela para exibição de posts do blog com ordenação e acessibilidade
 * @param {Object} props - Propriedades do componente
 * @param {Array} [props.data=[]] - Dados a serem exibidos na tabela
 * @param {Array} [props.columns=[]] - Definição das colunas da tabela
 * @param {Function} [props.onEdit=() => {}] - Função chamada ao editar um post
 * @param {Function} [props.onDelete=() => {}] - Função chamada ao excluir um post
 * @param {boolean} [props.isLoading=false] - Indica se os dados estão sendo carregados
 * @param {Function} [props.onSortChange=() => {}] - Função chamada quando a ordenação é alterada
 * @returns {JSX.Element} Componente de tabela estilizado
 */
export function BlogTable({ 
  data = [], 
  columns = [], 
  onEdit = () => {}, 
  onDelete = () => {},
  isLoading = false,
  onSortChange = () => {},
}) {
  const tableRef = useRef(null);
  const firstRender = useRef(true);
  
  // Configuração da tabela
  const tableColumns = useMemo(() => [
    {
      header: 'ID',
      accessorKey: 'id',
      size: 80, // Tamanho fixo para a coluna de ID
    },
    ...columns
  ], [columns]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: true,
    autoResetPageIndex: false,
    initialState: {
      sorting: [{ id: 'published_at', desc: true }],
    },
    state: {
      sorting: [{ id: 'published_at', desc: true }],
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
  
  // Manipulador de teclado para acessibilidade
  const handleKeyDown = useCallback((e, row, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (action === 'edit') {
        onEdit(row.original);
      } else if (action === 'delete') {
        onDelete(row.original.id);
      }
    }
  }, [onEdit, onDelete]);
  
  // Função para lidar com a ordenação por teclado
  const handleSortKeyDown = useCallback((e, header) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      header.column.getToggleSortingHandler()(e);
    }
  }, []);

  // Se não houver dados e não estiver carregando, exibe mensagem
  if (!isLoading && rows.length === 0) {
    return (
      <div className={styles.emptyState} role="status" aria-live="polite">
        <p>Nenhuma postagem encontrada</p>
      </div>
    );
  }

  return (
    <div 
      className={styles.tableContainer}
      ref={tableRef}
      role="region" 
      aria-labelledby="tabela-posts"
      tabIndex="-1"
    >
      <div className={styles.tableWrapper}>
        <table 
          className={styles.table} 
          aria-label="Lista de posts do blog"
          aria-describedby="tabela-descricao"
        >
          <caption className="sr-only" id="tabela-descricao">
            Lista de posts do blog com opções para ordenar, editar e excluir
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
                <th className={styles.th} scope="col">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr 
                key={row.id} 
                className={styles.tr}
                aria-label={`Post: ${row.original.title}`}
                role="row"
                aria-rowindex={rowIndex + 2} // +2 para considerar o cabeçalho
              >
                {row.getVisibleCells().map((cell, cellIndex) => (
                  <td 
                    key={cell.id} 
                    className={styles.td}
                    data-label={cell.column.columnDef.header}
                    role="gridcell"
                    aria-colindex={cellIndex + 1}
                  >
                    {flexRender(cell.column.columnDef.cell, {
                      ...cell.getContext(),
                      // Adiciona informações adicionais ao contexto se necessário
                    })}
                  </td>
                ))}
                <td className={`${styles.td} ${styles.actions}`}>
                  <div className={styles.actionsContainer}>
                    <button 
                      onClick={() => onEdit(row.original)}
                      onKeyDown={(e) => handleKeyDown(e, row, 'edit')}
                      className={styles.actionButton}
                      aria-label={`Editar post: ${row.original.title}`}
                      tabIndex={0}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => onDelete(row.original.id)}
                      onKeyDown={(e) => handleKeyDown(e, row, 'delete')}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      aria-label={`Excluir post: ${row.original.title}`}
                      tabIndex={0}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
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
            <span className="sr-only">Carregando posts...</span>
          </div>
        )}
      </div>
      
      {/* Paginação pode ser adicionada aqui */}
      {table.getPageCount() > 1 && (
        <div className={styles.pagination}>
          {/* Implementação da paginação aqui */}
        </div>
      )}
      
      {/* Mensagem de status para leitores de tela */}
      <div 
        className="sr-only" 
        aria-live="polite"
        aria-atomic="true"
      >
        {isLoading 
          ? 'Carregando posts...' 
          : `${rows.length} posts carregados`}
      </div>
    </div>
  );
}
