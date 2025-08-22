"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useGetPosts } from "../../store/useGetPosts";
import { BlogTable } from "./BlogTable";
import { LoadingSpinner } from "../components/LoadingSpinner";
import styles from "./page.module.scss";

// Tipos para os dados do post
/** @typedef {{ id: string | number; title: string; excerpt: string; published_at?: string; }} Post */

// Tipos para ordenação
/** @typedef {{ id: string, desc: boolean }} SortingState */

export default function BlogPage() {
    // Estados locais
    const [localError, setLocalError] = useState(null);
    const [sorting, setSorting] = useState({ id: 'published_at', desc: true });
    
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
                header: 'Resumo',
                accessorKey: 'excerpt',
                cell: info => <span className={styles.postExcerpt}>{info.getValue() || 'Sem descrição disponível'}</span>,
                enableSorting: false,
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

    const handleDelete = async (postId) => {
        if (window.confirm('Tem certeza que deseja excluir esta postagem?')) {
            try {
                console.log('Excluindo post ID:', postId);
                // Implementar lógica de exclusão
                // await deletePost(postId);
                // Recarregar a lista de posts
                // await getPosts();
            } catch (error) {
                console.error('Erro ao excluir post:', error);
                setError('Falha ao excluir a postagem. Tente novamente.');
            }
        }
    };

    // Estado de erro
    if (error && !isLoading) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorText}>{error}</p>
                <button 
                    onClick={() => loadPosts(meta.current_page, sorting)}
                    className={styles.retryButton}
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className={styles.blogContainer}>
            <header className={styles.header}>
                <h1>Blog</h1>
                <p className={styles.subtitle}>Total de postagens: {meta?.total || 0}</p>
            </header>
            
            <div className={styles.tableWrapper}>
                <BlogTable 
                    data={posts || []} 
                    columns={columns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={isLoading}
                    onSortChange={handleSortChange}
                />
                
                {/* Paginação pode ser adicionada aqui */}
                {meta?.total > meta?.per_page && (
                    <div className={styles.pagination}>
                        {/* Implementar controles de paginação aqui */}
                    </div>
                )}
            </div>
        </div>
    );
}
