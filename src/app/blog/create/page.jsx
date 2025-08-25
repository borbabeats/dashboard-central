"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button, Stack, FormControlLabel, Checkbox, FormGroup, TextField, InputLabel, Select, MenuItem, FormControl } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4} flexWrap="wrap" gap={2}>
                <div>
                    <h1 style={{ margin: '0 0 8px 0', color: '#1a1a1a' }}>Nova Postagem</h1>
                    <p style={{ margin: 0, color: '#666' }}>Preencha os campos abaixo para criar uma nova postagem</p>
                </div>
                <Button 
                    component={Link} 
                    href="/blog" 
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                >
                    Voltar para a lista
                </Button>
            </Stack>

            <form onSubmit={handleSubmit} className={styles.form}>
                <TextField
                    fullWidth
                    label="Título"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Digite o título da postagem"
                    required
                    margin="normal"
                    variant="outlined"
                />

                <TextField
                    fullWidth
                    label="Resumo"
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    placeholder="Um breve resumo da postagem (opcional)"
                    margin="normal"
                    variant="outlined"
                />

                <div className={styles.formGroup}>
                    <label htmlFor="content" className={styles.formLabel} style={{ display: 'block', marginBottom: '0.5rem' }}>Conteúdo</label>
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

                <FormControl fullWidth margin="normal" required>
                    <InputLabel id="author-label">Autor</InputLabel>
                    {isLoadingAuthors ? (
                        <div className={styles.loading}>Carregando autores...</div>
                    ) : (
                        <Select
                            labelId="author-label"
                            id="author"
                            name="author"
                            value={formData.author}
                            label="Autor"
                            onChange={handleChange}
                            disabled={isLoadingAuthors}
                            variant="outlined"
                        >
                            <MenuItem value="">
                                <em>Selecione o autor</em>
                            </MenuItem>
                            {authors.map((author) => (
                                <MenuItem key={author.id} value={author.id}>
                                    {author.name}
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                </FormControl>

                <div className={styles.formRow}>
                    <FormGroup>
                        <FormControlLabel 
                            control={
                                <Checkbox 
                                    name="published"
                                    checked={formData.published}
                                    onChange={handleChange}
                                    color="primary"
                                />
                            } 
                            label="Publicar agora"
                        />
                    </FormGroup>

                    {formData.published && (
                        <TextField
                            fullWidth
                            type="date"
                            id="published_at"
                            name="published_at"
                            label="Data de publicação"
                            value={formData.published_at}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    )}
                </div>

                <Stack 
                    direction="row" 
                    spacing={2} 
                    justifyContent="flex-end"
                    sx={{ 
                        mt: 3, 
                        pt: 2, 
                        borderTop: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={() => router.push('/blog')}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Salvando...' : 'Salvar Postagem'}
                    </Button>
                </Stack>
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
