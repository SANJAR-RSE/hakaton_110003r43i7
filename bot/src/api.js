const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

// Links (or creates) the backend User behind this Telegram chat, keyed by
// phone number - this is what keeps the web app and the bot as ONE account.
// Guarded on the backend by BOT_TOKEN as a shared secret.
async function linkTelegramAccount({ phone, telegramChatId, telegramUsername, fullName }) {
  const { data } = await api.post(
    '/auth/telegram-link',
    { phone, telegramChatId, telegramUsername, fullName },
    { headers: { 'x-bot-secret': process.env.BOT_TOKEN } }
  );
  return data; // { token, user }
}

// Every other call re-uses the SAME protected REST API the web app calls -
// single data-access layer, no bot-only fake data.
function authed(token) {
  return {
    getClinics: () => api.get('/clinics', { headers: auth(token) }).then((r) => r.data.clinics),
    getDepartments: (clinicId) => api.get('/departments', { params: { clinicId }, headers: auth(token) }).then((r) => r.data.departments),
    getDoctors: (clinicId, departmentId) =>
      api.get('/doctors', { params: { clinicId, departmentId }, headers: auth(token) }).then((r) => r.data.doctors),
    getSchedules: (doctorId, date) =>
      api.get(`/doctors/${doctorId}/schedules`, { params: { date }, headers: auth(token) }).then((r) => r.data.schedules),
    bookAppointment: (scheduleId) =>
      api.post('/appointments', { scheduleId }, { headers: auth(token) }).then((r) => r.data.appointment),
    myAppointments: () => api.get('/appointments/me', { headers: auth(token) }).then((r) => r.data.appointments),
    cancelAppointment: (id) => api.patch(`/appointments/${id}/cancel`, {}, { headers: auth(token) }).then((r) => r.data.appointment),
    me: () => api.get('/auth/me', { headers: auth(token) }).then((r) => r.data.user),
  };
}

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

function extractApiError(err) {
  return err.response?.data?.message || "Server bilan aloqa o'rnatilmadi. Birozdan so'ng qayta urinib ko'ring.";
}

module.exports = { linkTelegramAccount, authed, extractApiError };
