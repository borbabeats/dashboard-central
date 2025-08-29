"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Switch
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import api from '../../../../api/api';

export default function ConcessionariaEdit() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [options, setOptions] = useState({
    combustiveis: [],
    transmissoes: [],
    marcas: [],
    anos: [],
    cores: [],
    categorias: [],
    opcionais: [],
  });

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      modelo: '',
      preco: 0,
      descricao: '',
      quilometragem: 0,
      tipo_combustivel_id: 0,
      transmissao_id: 0,
      imagem_url: '',
      disponivel: true,
      marca_id: 0,
      ano_id: 0,
      cor_id: 0,
      categoria_id: 0,
      opcionais: [],
    },
  });

  // Carregar dados do veículo e opções
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        
        const [vehicleResponse, ...optionsResponses] = await Promise.all([
          api.get(`/vehicles/${vehicleId}`),
          api.get('/vehicle-combustivel').catch(() => ({ data: [] })),
          api.get('/vehicle-transmissao').catch(() => ({ data: [] })),
          api.get('/vehicle-marca').catch(() => ({ data: [] })),
          api.get('/vehicle-ano').catch(() => ({ data: [] })),
          api.get('/vehicle-cor').catch(() => ({ data: [] })),
          api.get('/vehicle-categories').catch(() => ({ data: [] })),
          api.get('/vehicle-optionals').catch(() => ({ data: [] })),
        ]);

        const vehicleData = vehicleResponse.data;
        
        setOptions({
          combustiveis: optionsResponses[0].data,
          transmissoes: optionsResponses[1].data,
          marcas: optionsResponses[2].data,
          anos: optionsResponses[3].data,
          cores: optionsResponses[4].data,
          categorias: optionsResponses[5].data,
          opcionais: optionsResponses[6].data,
        });

        // Preencher formulário com dados existentes
        reset({
          modelo: vehicleData.modelo || '',
          preco: Number(vehicleData.preco) || 0,
          descricao: vehicleData.descricao || '',
          quilometragem: Number(vehicleData.quilometragem) || 0,
          tipo_combustivel_id: vehicleData.tipo_combustivel_id || 0,
          transmissao_id: vehicleData.transmissao_id || 0,
          imagem_url: vehicleData.imagem_url || '',
          disponivel: vehicleData.disponivel !== false,
          marca_id: vehicleData.marca_id || 0,
          ano_id: vehicleData.ano_id || 0,
          cor_id: vehicleData.cor_id || 0,
          categoria_id: vehicleData.categoria_id || 0,
          opcionais: vehicleData.optionals?.map(opt => opt.id) || [],
        });

        // Definir imagens existentes
        setExistingImages(vehicleData.images || []);
        
      } catch (err) {
        setError('Erro ao carregar dados do veículo.');
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoadingData(false);
      }
    };

    if (vehicleId) {
      fetchData();
    }
  }, [vehicleId, reset]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSelectedImages((prev) => [...prev, ...files]);
    setCurrentPreviewIndex(0);
  };

  const handleRemoveSelectedImage = (indexToRemove) => {
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setCurrentPreviewIndex((prevIndex) => {
      if (indexToRemove < prevIndex) return prevIndex - 1;
      if (prevIndex >= Math.max(0, selectedImages.length - 2)) return Math.max(0, prevIndex - 1);
      return prevIndex;
    });
  };

  const goPrev = () => setCurrentPreviewIndex((prev) => (prev - 1 + selectedImages.length) % selectedImages.length);
  const goNext = () => setCurrentPreviewIndex((prev) => (prev + 1) % selectedImages.length);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newImages = [...existingImages];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    // Atualizar ordem
    const updatedImages = newImages.map((img, idx) => ({
      ...img,
      ordem: idx + 1
    }));
    
    setExistingImages(updatedImages);
    setDraggedIndex(null);
  };

  const uploadImageToImgBB = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
    });
    
    const data = await response.json();
    if (data.success) {
        return data.data.url;
    }
    throw new Error('Erro ao fazer upload da imagem');
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      let imageUrl = data.imagem_url;
      let imageUrls = [...existingImages.map(img => img.url)];
      
      // Upload novas imagens se selecionadas
      if (selectedImages && selectedImages.length > 0) {
        const newImageUrls = await Promise.all(selectedImages.map((file) => uploadImageToImgBB(file)));
        imageUrls = [...imageUrls, ...newImageUrls];
        if (!imageUrl && newImageUrls.length > 0) {
          imageUrl = newImageUrls[0];
        }
      }
      
      // Preparar dados das imagens com ordem
      const imagesWithOrder = [
        ...existingImages.map((img, idx) => ({ url: img.url, ordem: idx + 1 })),
        ...selectedImages.map((_, idx) => ({ url: imageUrls[existingImages.length + idx], ordem: existingImages.length + idx + 1 }))
      ];
      
      // Formatar dados para a API
      const vehicleData = {
        ...data,
        preco: Number(data.preco),
        quilometragem: Number(data.quilometragem),
        imagem_url: imageUrl,
        images: imagesWithOrder,
        optionals: data.opcionais,
      };
      delete vehicleData.opcionais;

      console.log('Dados sendo enviados:', vehicleData);
      await api.put(`/vehicles/${vehicleId}`, vehicleData);

      setSuccess(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/concessionaria');
      }, 2000);
    } catch (err) {
      setError('Erro ao atualizar veículo. Verifique os dados e tente novamente.');
      console.error('Erro ao atualizar veículo:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ mb: 3 }}
      >
        Voltar
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        Editar Veículo
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Modelo */}
            <Grid item xs={4}>
              <Controller
                name="modelo"
                control={control}
                rules={{ required: 'Modelo é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Modelo"
                    fullWidth
                    error={!!errors.modelo}
                    helperText={errors.modelo?.message}
                  />
                )}
              />
            </Grid>

            {/* Preço */}
            <Grid item xs={4}>
              <Controller
                name="preco"
                control={control}
                rules={{ required: 'Preço é obrigatório', min: 0 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Preço"
                    fullWidth
                    inputProps={{ min: 0, step: '0.01' }}
                    error={!!errors.preco}
                    helperText={errors.preco?.message}
                  />
                )}
              />
            </Grid>

            {/* Quilometragem */}
            <Grid item xs={4}>
              <Controller
                name="quilometragem"
                control={control}
                rules={{ required: 'Quilometragem é obrigatória', min: 0 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Quilometragem"
                    fullWidth
                    inputProps={{ min: 0 }}
                    error={!!errors.quilometragem}
                    helperText={errors.quilometragem?.message}
                  />
                )}
              />
            </Grid>

            {/* Marca */}
            <Grid item xs={4}>
              <FormControl fullWidth error={!!errors.marca_id}>
                <InputLabel>Marca</InputLabel>
                <Controller
                  name="marca_id"
                  control={control}
                  rules={{ validate: value => value > 0 || 'Selecione uma marca' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Marca"
                      disabled={options.marcas.length === 0}
                    >
                      <MenuItem value={0} disabled>
                        Selecione uma marca
                      </MenuItem>
                      {options.marcas.map((marca) => (
                        <MenuItem key={marca.id} value={marca.id}>
                          {marca.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.marca_id && (
                  <Typography variant="caption" color="error">
                    {errors.marca_id.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Categoria */}
            <Grid item xs={4}>
              <FormControl fullWidth error={!!errors.categoria_id}>
                <InputLabel>Categoria</InputLabel>
                <Controller
                  name="categoria_id"
                  control={control}
                  rules={{ validate: value => value > 0 || 'Selecione uma categoria' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Categoria"
                      disabled={options.categorias.length === 0}
                    >
                      <MenuItem value={0} disabled>
                        Selecione uma categoria
                      </MenuItem>
                      {options.categorias.map((categoria) => (
                        <MenuItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.categoria_id && (
                  <Typography variant="caption" color="error">
                    {errors.categoria_id.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Ano */}
            <Grid item xs={4}>
              <FormControl fullWidth error={!!errors.ano_id}>
                <InputLabel>Ano</InputLabel>
                <Controller
                  name="ano_id"
                  control={control}
                  rules={{ validate: value => value > 0 || 'Selecione o ano' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Ano"
                      disabled={options.anos.length === 0}
                    >
                      <MenuItem value={0} disabled>
                        Selecione o ano
                      </MenuItem>
                      {options.anos.map((ano) => (
                        <MenuItem key={ano.id} value={ano.id}>
                          {ano.ano}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.ano_id && (
                  <Typography variant="caption" color="error">
                    {errors.ano_id.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Cor */}
            <Grid item xs={4}>
              <FormControl fullWidth error={!!errors.cor_id}>
                <InputLabel>Cor</InputLabel>
                <Controller
                  name="cor_id"
                  control={control}
                  rules={{ validate: value => value > 0 || 'Selecione uma cor' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Cor"
                      disabled={options.cores.length === 0}
                    >
                      <MenuItem value={0} disabled>
                        Selecione uma cor
                      </MenuItem>
                      {options.cores.map((cor) => (
                        <MenuItem key={cor.id} value={cor.id}>
                          {cor.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.cor_id && (
                  <Typography variant="caption" color="error">
                    {errors.cor_id.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Tipo de Combustível */}
            <Grid item xs={4}>
              <FormControl fullWidth error={!!errors.tipo_combustivel_id}>
                <InputLabel>Combustível</InputLabel>
                <Controller
                  name="tipo_combustivel_id"
                  control={control}
                  rules={{ validate: value => value > 0 || 'Selecione o tipo de combustível' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Combustível"
                      disabled={options.combustiveis.length === 0}
                    >
                      <MenuItem value={0} disabled>
                        Selecione o combustível
                      </MenuItem>
                      {options.combustiveis.map((combustivel) => (
                        <MenuItem key={combustivel.id} value={combustivel.id}>
                          {combustivel.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.tipo_combustivel_id && (
                  <Typography variant="caption" color="error">
                    {errors.tipo_combustivel_id.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Transmissão */}
            <Grid item xs={4}>
              <FormControl fullWidth error={!!errors.transmissao_id}>
                <InputLabel>Transmissão</InputLabel>
                <Controller
                  name="transmissao_id"
                  control={control}
                  rules={{ validate: value => value > 0 || 'Selecione o tipo de transmissão' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Transmissão"
                      disabled={options.transmissoes.length === 0}
                    >
                      <MenuItem value={0} disabled>
                        Selecione a transmissão
                      </MenuItem>
                      {options.transmissoes.map((transmissao) => (
                        <MenuItem key={transmissao.id} value={transmissao.id}>
                          {transmissao.tipo}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.transmissao_id && (
                  <Typography variant="caption" color="error">
                    {errors.transmissao_id.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Upload de Imagens */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Imagens do Veículo
              </Typography>
              
              {/* Imagens existentes */}
              {existingImages.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Imagens atuais (arraste para reordenar):
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {existingImages.map((img, idx) => (
                      <Box 
                        key={img.id} 
                        sx={{ 
                          width: 80, 
                          height: 60, 
                          borderRadius: 1, 
                          overflow: 'hidden', 
                          border: draggedIndex === idx ? '2px solid #1976d2' : '1px solid #e0e0e0',
                          cursor: 'move',
                          position: 'relative',
                          opacity: draggedIndex === idx ? 0.5 : 1
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx)}
                      >
                        <img
                          src={img.url}
                          alt={`Imagem ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <Box sx={{ 
                          position: 'absolute', 
                          bottom: 2, 
                          right: 2, 
                          background: 'rgba(0,0,0,0.7)', 
                          color: 'white', 
                          borderRadius: '50%', 
                          width: 16, 
                          height: 16, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: 10 
                        }}>
                          {idx + 1}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '8px'
                }}
              />
              {selectedImages.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Typography variant="body2" color="text.secondary" style={{ marginBottom: 8 }}>
                    {selectedImages.length} nova(s) imagem(ns) selecionada(s)
                  </Typography>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Button variant="outlined" size="small" onClick={goPrev} disabled={selectedImages.length <= 1}>
                      Anterior
                    </Button>
                    <div style={{
                      width: 280,
                      height: 180,
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: '1px solid #e0e0e0',
                      position: 'relative',
                      background: '#fafafa'
                    }}>
                      <img
                        src={URL.createObjectURL(selectedImages[currentPreviewIndex])}
                        alt={`Pré-visualização ${currentPreviewIndex + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleRemoveSelectedImage(currentPreviewIndex)}
                        style={{ position: 'absolute', top: 8, right: 8 }}
                      >
                        Remover
                      </Button>
                      <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 12 }}>
                        {currentPreviewIndex + 1} / {selectedImages.length}
                      </div>
                    </div>
                    <Button variant="outlined" size="small" onClick={goNext} disabled={selectedImages.length <= 1}>
                      Próximo
                    </Button>
                  </div>
                </div>
              )}
            </Grid>

            {/* Descrição */}
            <Grid item xs={12}>
              <Controller
                name="descricao"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descrição"
                    fullWidth
                    multiline
                    rows={4}
                  />
                )}
              />
            </Grid>

            {/* Opcionais */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Opcionais
              </Typography>
              <Grid container spacing={2}>
                {options.opcionais.map((opcional) => (
                  <Grid item key={opcional.id}>
                    <Controller
                      name="opcionais"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value?.includes(opcional.id) || false}
                              onChange={(e) => {
                                const value = Number(opcional.id);
                                const newValue = e.target.checked
                                  ? [...(field.value || []), value]
                                  : field.value?.filter((v) => v !== value) || [];
                                field.onChange(newValue);
                              }}
                            />
                          }
                          label={opcional.name}
                        />
                      )}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Disponível */}
            <Grid item xs={12}>
              <Controller
                name="disponivel"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Disponível para venda"
                  />
                )}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => router.push('/concessionaria')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Notificações */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Veículo atualizado com sucesso!
        </Alert>
      </Snackbar>
    </Box>
  );
}