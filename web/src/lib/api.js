'use client';

import axios from 'axios';
import { useAuthStore } from './store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({ baseURL: API_URL, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

export function apiErrorMessage(err) {
  return err?.response?.data?.message || "Ma'lumotni yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.";
}

// ---- Auth -------------------------------------------------------------
export const authApi = {
  register: (body) => api.post('/auth/register', body).then((r) => r.data),
  login: (body) => api.post('/auth/login', body).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data.user),
};

export const usersApi = {
  updateMe: (body) => api.patch('/users/me', body).then((r) => r.data.user),
};

// ---- Clinics / departments / doctors -----------------------------------
export const clinicsApi = {
  list: () => api.get('/clinics').then((r) => r.data.clinics),
  get: (id) => api.get(`/clinics/${id}`).then((r) => r.data),
};

export const departmentsApi = {
  list: (clinicId) => api.get('/departments', { params: { clinicId } }).then((r) => r.data.departments),
};

export const doctorsApi = {
  list: (params) => api.get('/doctors', { params }).then((r) => r.data.doctors),
  get: (id) => api.get(`/doctors/${id}`).then((r) => r.data.doctor),
  schedules: (id, date) => api.get(`/doctors/${id}/schedules`, { params: { date } }).then((r) => r.data.schedules),
};

// ---- Appointments --------------------------------------------------------
export const appointmentsApi = {
  create: (scheduleId) => api.post('/appointments', { scheduleId }).then((r) => r.data.appointment),
  mine: () => api.get('/appointments/me').then((r) => r.data.appointments),
  get: (id) => api.get(`/appointments/${id}`).then((r) => r.data.appointment),
  cancel: (id, reason) => api.patch(`/appointments/${id}/cancel`, { reason }).then((r) => r.data.appointment),
  doctorQueue: (date) => api.get('/appointments/doctor/queue', { params: { date } }).then((r) => r.data),
  setStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }).then((r) => r.data.appointment),
};

// ---- Medical records ------------------------------------------------------
export const medicalRecordsApi = {
  mine: () => api.get('/medical-records/me').then((r) => r.data.records),
  forPatient: (patientId) => api.get(`/medical-records/patient/${patientId}`).then((r) => r.data.records),
  create: (body) => api.post('/medical-records', body).then((r) => r.data.record),
};

// ---- Notifications ---------------------------------------------------------
export const notificationsApi = {
  mine: () => api.get('/notifications/me').then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data.notification),
  markAllRead: () => api.patch('/notifications/read-all').then((r) => r.data),
};

// ---- Doctor schedule management --------------------------------------------
export const schedulesApi = {
  mine: (date) => api.get('/schedules/me', { params: { date } }).then((r) => r.data.schedules),
  create: (body) => api.post('/schedules', body).then((r) => r.data.schedule),
  remove: (id) => api.delete(`/schedules/${id}`).then((r) => r.data),
};

// ---- AI assistant -----------------------------------------------------------
export const aiApi = {
  send: (body) => api.post('/ai/message', body).then((r) => r.data),
  conversations: () => api.get('/ai/conversations/me').then((r) => r.data.conversations),
  messages: (conversationId) => api.get(`/ai/conversations/${conversationId}/messages`).then((r) => r.data.messages),
};
