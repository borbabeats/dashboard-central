"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from 'next/link';
import { Box, Button, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Notification from '../components/Notification';
import api from "../../api/api";
import { useGetPosts } from "../../store/useGetPosts";
import ConfirmModal from "../components/ConfirmModal";
import { BlogTable } from "./BlogTable";
//import { LoadingSpinner } from "../components/LoadingSpinner";
import styles from "./page.module.scss";

// Tipos para os dados do post
/** @typedef {{ id: string | number; title: string; excerpt: string; published_at?: string; }} Post */

// Tipos para ordenação
/** @typedef {{ id: string, desc: boolean }} SortingState */

export default function BlogPage() {
    // Estados locais
    const [localError, setLocalError] = useState(null);
    const [sorting, setSorting] = useState({ id: 'published_at', desc: true });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success'
    });
    const postToDelete = useRef(null);
    
    const { 
        posts, 
        meta = { current_page: 1, per_page: 10, total: 0 },
        isLoading, 
        error: postsError, 
        getPosts 
    } = useGetPosts();
    
    // Função para carregar posts com ordenação
    const loadPosts = useCallback(async (page = 1, sort = sorting) => {
        try {
            await getPosts(page, meta.per_page, sort);
            setLocalError(null);
        } catch (err) {
            console.error('Erro ao carregar posts:', err);
            setLocalError('Falha ao carregar as postagens. Tente novamente mais tarde.');
        }
    }, [getPosts, meta.per_page, sorting]);
    
    // Carrega os posts quando o componente é montado ou quando a ordenação muda
    useEffect(() => {
        loadPosts(meta.current_page, sorting);
    }, [loadPosts, meta.current_page, sorting]);
    
    // Combina erros do hook e local
    const error = postsError || localError;
    
    // Manipula mudança de ordenação
    const handleSortChange = useCallback((sort) => {
        setSorting(sort);
    }, []);

    // Define as colunas da tabela
    const columns = useMemo(
        () => [
            {
                header: 'Título',
                accessorKey: 'title',
                cell: info => <span className={styles.postTitle}>{info.getValue()}</span>,
                enableSorting: true,
            },
            {
                header: 'Publicação',
                accessorKey: 'published_at',
                cell: info => {
                    const date = info.getValue();
                    return (
                        <span className={styles.dateCell}>
                            {date 
                                ? new Date(date).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })
                                : 'Não publicado'}
                        </span>
                    );
                },
                enableSorting: true,
            },
        ],
        []
    );

    // Manipuladores de eventos
    const handleEdit = (post) => {
        console.log('Editar post:', post);
        // Implementar navegação para edição
    };

    const handleDeleteClick = (postId) => {
        if (!postId || isNaN(parseInt(postId, 10))) {
            console.error('ID de post inválido');
            return;
        }
        postToDelete.current = postId;
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const response = await api.delete(`/posts/${postToDelete.current}`);
            
            if (response.status === 204) {
                showNotification('Post excluído com sucesso!', 'success');
                // Recarregar a lista de posts mantendo a paginação atual
                await loadPosts(meta.current_page, sorting);
            } else {
                throw new Error(`Erro inesperado: ${response.status}`);
            }
        } catch (error) {
            console.error('Erro ao excluir post:', error);
            showNotification('Falha ao excluir a postagem. Tente novamente.', 'error');
        } finally {
            setShowDeleteConfirm(false);
            postToDelete.current = null;
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
        postToDelete.current = null;
    };

    const showNotification = useCallback((message, type = 'success') => {
        setNotification({
            show: true,
            message,
            type
        });

        const timer = setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    // Estado de erro
    if (error && !isLoading) {
        return (
            <Stack spacing={2} alignItems="center" justifyContent="center" minHeight="200px">
                <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
                <Button 
                    variant="contained"
                    onClick={() => loadPosts(meta.current_page, sorting)}
                >
                    Tentar novamente
                </Button>
            </Stack>
        );
    }

    return (
        <Box className={styles.blogContainer}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4} flexWrap="wrap" gap={2}>
                <div>
                    <h1 style={{ margin: '0 0 8px 0', color: '#1a1a1a' }}>Blog</h1>
                    <p style={{ margin: 0, color: '#666' }}>Total de postagens: {meta?.total || 0}</p>
                </div>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    component={Link}
                    href="/blog/create"
                >
                    Nova Postagem
                </Button>
            </Stack>
            
            <div className={styles.tableWrapper}>
                <BlogTable 
                    data={posts} 
                    columns={columns} 
                    onSortChange={handleSortChange}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    isLoading={isLoading}
                />
                <ConfirmModal
                    isOpen={showDeleteConfirm}
                    onClose={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                    title="Excluir Postagem"
                    message="Tem certeza que deseja excluir esta postagem? Esta ação não pode ser desfeita."
                    confirmText="Excluir"
                />
                
                {/* Paginação pode ser adicionada aqui */}
                {meta?.total > meta?.per_page && (
                    <div className={styles.pagination}>
                        {/* Implementar controles de paginação aqui */}
                    </div>
                )}
            </div>
            {notification.show && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(prev => ({ ...prev, show: false }))}
                />
            )}
        </Box>
    );
}
