import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 120000, // 2 min timeout for training
})

const handleError = (error) => {
  const msg = error.response?.data?.error || error.response?.data?.detail || error.message || 'Unknown error'
  throw new Error(typeof msg === 'object' ? JSON.stringify(msg) : msg)
}

export const uploadDataset = async (file, expertiseLevel = 'beginner') => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('expertise_level', expertiseLevel)
    const response = await api.post('/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  } catch (error) { handleError(error) }
}

export const analyzeDataset = async (datasetId) => {
  try {
    const response = await api.get(`/analyze/${datasetId}/`)
    return response.data
  } catch (error) { handleError(error) }
}

export const recommendModels = async (datasetId, expertiseLevel = 'beginner') => {
  try {
    const response = await api.get(`/recommend/${datasetId}/`, {
      params: { expertise_level: expertiseLevel }
    })
    return response.data
  } catch (error) { handleError(error) }
}

export const generatePipeline = async (datasetId, modelName, targetColumn) => {
  try {
    const response = await api.post(`/pipeline/${datasetId}/`, {
      model_name: modelName,
      target_column: targetColumn,
    })
    return response.data
  } catch (error) { handleError(error) }
}

export const trainModel = async (datasetId, modelName, targetColumn, expertiseLevel) => {
  try {
    const response = await api.post(`/train/${datasetId}/`, {
      model_name: modelName,
      target_column: targetColumn,
      expertise_level: expertiseLevel,
    })
    return response.data
  } catch (error) { handleError(error) }
}

export const explainDataset = async (datasetId, expertiseLevel) => {
  try {
    const response = await api.post('/explain/', {
      dataset_id: datasetId,
      expertise_level: expertiseLevel,
    })
    return response.data
  } catch (error) { handleError(error) }
}

export const chatWithAI = async (message, datasetId, expertiseLevel, modelName) => {
  try {
    const response = await api.post('/chat/', {
      message,
      dataset_id: datasetId,
      expertise_level: expertiseLevel,
      model_name: modelName,
    })
    return response.data
  } catch (error) { handleError(error) }
}

export const getDatasets = async () => {
  try {
    const response = await api.get('/datasets/')
    return response.data
  } catch (error) { handleError(error) }
}
