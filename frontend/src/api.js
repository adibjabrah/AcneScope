import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5000';

// Mengubah path gambar relatif dari backend (mis. /static/history/x.jpg) menjadi URL absolut
export function resolveImageUrl(path) {
  if (!path) return '';
  return `${API_BASE_URL}${path}`;
}

// source: 'upload' | 'camera' | 'video' — menandai asal gambar di Riwayat Testing
// saveHistory: false dipakai oleh mode realtime video agar inferensi live tidak disimpan tiap frame
export async function predict(file, { source = 'upload', saveHistory = true } = {}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('source', source);
  formData.append('save_history', saveHistory ? 'true' : 'false');

  const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function getHistory() {
  const response = await axios.get(`${API_BASE_URL}/api/history`);
  return response.data;
}

export async function getHistoryDetail(id) {
  const response = await axios.get(`${API_BASE_URL}/api/history/${id}`);
  return response.data;
}

export async function submitValidation(id, payload) {
  const response = await axios.post(`${API_BASE_URL}/api/history/${id}/validation`, payload);
  return response.data;
}

export async function getStats() {
  const response = await axios.get(`${API_BASE_URL}/api/stats`);
  return response.data;
}
