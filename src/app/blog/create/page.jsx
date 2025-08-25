"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import api from '../../../api/api';
import Notification from '../../components/Notification';
import styles from '../page.module.scss';

// Dynamically import RichTextEditor with no SSR
const RichTextEditor = dynamic(
  () => import('../../../components/RichTextEditor'),
  { ssr: false }
);

export default function BlogCreate() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        author: '',
        published: false,
        published_at: new Date().toISOString().split('T')[0]
    });
    const [authors, setAuthors] = useState([]);
    const [isLoadingAuthors, setIsLoadingAuthors] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    // Fetch authors on component mount
    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                const response = await api.get('/authors');
                setAuthors(response.data);
            } catch (error) {
                console.error('Error fetching authors:', error);
                showNotification('Erro ao carregar autores', 'error');
            } finally {
                setIsLoadingAuthors(false);
            }
        };

        fetchAuthors();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.title.trim() || !formData.content.trim()) {
            showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await api.post('/posts', {
                ...formData,
                // Convert author ID to integer
                author_id: parseInt(formData.author, 10),
                // Remove the author field as we're using author_id
                author: undefined,
                // Ensure we only send the date part for published_at
                published_at: formData.published ? formData.published_at : null
            });

            if (response.status === 201) {
                showNotification('Post criado com sucesso!', 'success');
                // Redirect to blog list after a short delay
                setTimeout(() => {
                    router.push('/blog');
                }, 1500);
            } else {
                throw new Error('Erro ao criar post');
            }
        } catch (error) {
            console.error('Erro ao criar post:', error);
            const errorMessage = error.response?.data?.message || 'Erro ao criar post. Tente novamente.';
            showNotification(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 5000);
    };

    return (
        <div className={styles.blogContainer}>
            <header className={styles.header}>
                <div>
                    <h1>Nova Postagem</h1>
                    <p className={styles.subtitle}>Preencha os campos abaixo para criar uma nova postagem</p>
                </div>
                <Link href="/blog" className={styles.createButton}>
                    Voltar para a lista
                </Link>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="title" className={styles.formLabel}>Título *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Digite o título da postagem"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="excerpt" className={styles.formLabel}>Resumo</label>
                    <input
                        type="text"
                        id="excerpt"
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Um breve resumo da postagem (opcional)"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="content" className={styles.formLabel} style={{ display: 'block', marginBottom: '0.5rem' }}>Conteúdo *</label>
                    <RichTextEditor
                        value={formData.content}
                        onChange={(value) => {
                            setFormData(prev => ({
                                ...prev,
                                content: value
                            }));
                        }}
                        placeholder="Digite o conteúdo da postagem"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="author" className={styles.formLabel}>Autor *</label>
                    {isLoadingAuthors ? (
                        <div className={styles.loading}>Carregando autores...</div>
                    ) : (
                        <select
                            id="author"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            className={styles.input}
                            required
                            disabled={isLoadingAuthors}
                        >
                            <option value="">Selecione o autor</option>
                            {authors.map((author) => (
                                <option key={author.id} value={author.id}>
                                    {author.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="published"
                                checked={formData.published}
                                onChange={handleChange}
                                className={styles.checkbox}
                            />
                            <span>Publicar agora</span>
                        </label>
                    </div>

                    {formData.published && (
                        <div className={styles.formGroup}>
                            <label htmlFor="published_at" className={styles.formLabel}>Data de publicação</label>
                            <input
                                type="date"
                                id="published_at"
                                name="published_at"
                                value={formData.published_at}
                                onChange={handleChange}
                                className={styles.input}
                            />
                        </div>
                    )}
                </div>

                <div className={styles.formActions}>
                    <button
                        type="button"
                        onClick={() => router.push('/blog')}
                        className={`${styles.button} ${styles.secondaryButton}`}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className={`${styles.button} ${styles.primaryButton}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Salvando...' : 'Salvar Postagem'}
                    </button>
                </div>
            </form>

            {notification.show && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(prev => ({ ...prev, show: false }))}
                />
            )}
        </div>
    );
}
