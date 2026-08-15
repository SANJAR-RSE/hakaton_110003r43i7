/**
 * Fills the database with realistic demo data: clinics, departments,
 * doctors, bookable schedule slots, a demo patient + doctor login, a couple
 * of live appointments (so the queue/dashboard isn't empty on first look)
 * and one completed appointment with a medical record (so medical history
 * isn't empty either).
 *
 * Run with: npm run seed   (from backend/)
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../src/config/db');
const { normalizePhone } = require('../src/utils/normalizePhone');

const User = require('../src/models/User');
const Clinic = require('../src/models/Clinic');
const Department = require('../src/models/Department');
const Doctor = require('../src/models/Doctor');
const Schedule = require('../src/models/Schedule');
const Appointment = require('../src/models/Appointment');
const MedicalRecord = require('../src/models/MedicalRecord');
const Notification = require('../src/models/Notification');
const AIConversation = require('../src/models/AIConversation');
const AIMessage = require('../src/models/AIMessage');

const DEPARTMENT_NAMES = [
  'Terapiya',
  'Kardiologiya',
  'LOR',
  'Dermatologiya',
  'Nevrologiya',
  'Oftalmologiya',
  'Stomatologiya',
  'Pediatriya',
  'Urologiya',
  'Ginekologiya',
  'Laboratoriya',
  'Diagnostika',
];

const DEPARTMENT_ICONS = {
  Terapiya: 'Stethoscope',
  Kardiologiya: 'HeartPulse',
  LOR: 'Ear',
  Dermatologiya: 'Sparkles',
  Nevrologiya: 'Brain',
  Oftalmologiya: 'Eye',
  Stomatologiya: 'Smile',
  Pediatriya: 'Baby',
  Urologiya: 'Droplet',
  Ginekologiya: 'Flower2',
  Laboratoriya: 'FlaskConical',
  Diagnostika: 'ScanLine',
};

const CLINICS = [
  { name: 'MedLine Clinic', district: 'Yunusobod', rating: 4.8 },
  { name: 'Tashkent Medical Center', district: 'Mirzo Ulug\'bek', rating: 4.7 },
  { name: 'City Hospital', district: 'Shayxontohur', rating: 4.5 },
  { name: 'Neo Clinic', district: 'Chilonzor', rating: 4.6 },
  { name: 'Family Clinic', district: 'Sergeli', rating: 4.4 },
  { name: 'Shifo Medical', district: 'Yashnobod', rating: 4.5 },
  { name: 'Grand Med', district: 'Mirobod', rating: 4.7 },
  { name: 'Healthy Life Clinic', district: 'Olmazor', rating: 4.6 },
];

const FIRST_NAMES = ['Aziz', 'Botir', 'Dilnoza', 'Gulnora', 'Jasur', 'Kamola', 'Laylo', 'Muzaffar', 'Nodira', 'Otabek', 'Sardor', 'Zarina', 'Farrux', 'Malika', 'Rustam', 'Shahzoda'];
const LAST_NAMES = ['Aliyev', 'Karimova', 'Yusupov', 'Rashidova', 'Tashkentov', 'Nazarova', 'Ergashev', 'Yoqubova', 'Xolmatov', 'Saidova', 'Mirzayev', 'Abdullayeva'];

function pick(arr, n = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return n === 1 ? shuffled[0] : shuffled.slice(0, n);
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function run() {
  await connectDB();
  console.log('[seed] clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Clinic.deleteMany({}),
    Department.deleteMany({}),
    Doctor.deleteMany({}),
    Schedule.deleteMany({}),
    Appointment.deleteMany({}),
    MedicalRecord.deleteMany({}),
    Notification.deleteMany({}),
    AIConversation.deleteMany({}),
    AIMessage.deleteMany({}),
  ]);

  console.log('[seed] creating clinics...');
  const clinics = await Clinic.insertMany(
    CLINICS.map((c) => ({
      name: c.name,
      logo: null,
      address: `Toshkent sh., ${c.district} tumani`,
      district: c.district,
      phone: `+998 71 ${rand(200, 299)} ${rand(10, 99)} ${rand(10, 99)}`,
      workingHours: '08:00 - 20:00',
      description: `${c.name} — zamonaviy uskunalar va malakali shifokorlar bilan sifatli tibbiy xizmat ko'rsatuvchi klinika.`,
      rating: c.rating,
    }))
  );

  console.log('[seed] creating departments...');
  const departments = [];
  for (const clinic of clinics) {
    const deptNames = pick(DEPARTMENT_NAMES, rand(5, 8));
    for (const name of deptNames) {
      departments.push(await Department.create({ name, icon: DEPARTMENT_ICONS[name], clinic: clinic._id }));
    }
  }

  console.log('[seed] creating doctors + schedules...');
  const doctors = [];
  for (const dept of departments) {
    const doctorCount = rand(1, 2);
    for (let i = 0; i < doctorCount; i += 1) {
      const doctor = await Doctor.create({
        firstName: pick(FIRST_NAMES),
        lastName: pick(LAST_NAMES),
        specialty: dept.name,
        experienceYears: rand(2, 22),
        bio: `${dept.name} bo'yicha tajribali mutaxassis.`,
        clinic: dept.clinic,
        department: dept._id,
        rating: Number((4 + Math.random()).toFixed(1)),
        workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        workingHours: '09:00 - 17:00',
      });
      doctors.push(doctor);

      // Bookable slots for the next 5 days, 30-minute increments, 09:00-17:00
      // minus a lunch break. Built as one bulk insertMany per doctor instead
      // of hundreds of individual awaited creates - the latter took 15-20+
      // minutes against Atlas for ~80 doctors, this takes seconds.
      const slotDocs = [];
      for (let dayOffset = 0; dayOffset < 5; dayOffset += 1) {
        const date = dateOffset(dayOffset);
        for (let hour = 9; hour < 17; hour += 1) {
          if (hour === 13) continue; // lunch break
          for (const minute of [0, 30]) {
            const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            const endHour = minute === 30 ? hour + 1 : hour;
            const endMinute = minute === 30 ? 0 : 30;
            const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
            slotDocs.push({ doctor: doctor._id, date, startTime, endTime, isBooked: false });
          }
        }
      }
      await Schedule.insertMany(slotDocs);
    }
  }
  console.log(`[seed] created ${doctors.length} doctors across ${departments.length} departments`);

  // ---- Demo login accounts ------------------------------------------------
  console.log('[seed] creating demo accounts...');
  const demoPatientPhone = normalizePhone('+998901234567');
  const demoPatient = await User.create({
    phone: demoPatientPhone,
    passwordHash: await bcrypt.hash('patient123', 10),
    fullName: 'Sanjar Rasulberdiyev',
    role: 'patient',
  });

  const demoDoctorEntity = doctors[0];
  const demoDoctorPhone = normalizePhone('+998907654321');
  const demoDoctorUser = await User.create({
    phone: demoDoctorPhone,
    passwordHash: await bcrypt.hash('doctor123', 10),
    fullName: `${demoDoctorEntity.firstName} ${demoDoctorEntity.lastName}`,
    role: 'doctor',
  });
  demoDoctorEntity.user = demoDoctorUser._id;
  await demoDoctorEntity.save();

  // ---- A small live queue for the demo doctor today, so the dashboard and
  // doctor queue view aren't empty on first look -----------------------------
  const today = dateOffset(0);
  const demoDoctorDept = await Department.findById(demoDoctorEntity.department);
  const todaySlots = await Schedule.find({ doctor: demoDoctorEntity._id, date: today }).sort({ startTime: 1 }).limit(6);

  const otherPatients = [];
  for (let i = 0; i < todaySlots.length - 1; i += 1) {
    const p = await User.create({
      phone: normalizePhone(`99890111000${i}`),
      passwordHash: await bcrypt.hash('patient123', 10),
      fullName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      role: 'patient',
    });
    otherPatients.push(p);
  }

  let queueCounter = 1;
  for (let i = 0; i < todaySlots.length - 1; i += 1) {
    const slot = todaySlots[i];
    slot.isBooked = true;
    await slot.save();
    await Appointment.create({
      patient: otherPatients[i]._id,
      doctor: demoDoctorEntity._id,
      clinic: demoDoctorEntity.clinic,
      department: demoDoctorEntity.department,
      schedule: slot._id,
      date: slot.date,
      time: slot.startTime,
      queueNumber: `${demoDoctorDept.name.charAt(0).toUpperCase()}-${queueCounter}`,
      status: i < 3 ? 'NEAR' : 'WAITING',
      source: 'web',
    });
    queueCounter += 1;
  }

  // The demo patient books the last of the reserved slots -> what they'll see on their dashboard
  const myDemoSlot = todaySlots[todaySlots.length - 1];
  myDemoSlot.isBooked = true;
  await myDemoSlot.save();
  const myDemoAppointment = await Appointment.create({
    patient: demoPatient._id,
    doctor: demoDoctorEntity._id,
    clinic: demoDoctorEntity.clinic,
    department: demoDoctorEntity.department,
    schedule: myDemoSlot._id,
    date: myDemoSlot.date,
    time: myDemoSlot.startTime,
    queueNumber: `${demoDoctorDept.name.charAt(0).toUpperCase()}-${queueCounter}`,
    status: 'WAITING',
    source: 'web',
  });
  await Notification.create({
    user: demoPatient._id,
    type: 'APPOINTMENT_CONFIRMED',
    title: 'Navbat tasdiqlandi',
    message: `${myDemoSlot.date} ${myDemoSlot.startTime} - navbat raqamingiz ${myDemoAppointment.queueNumber}.`,
    appointment: myDemoAppointment._id,
  });

  // ---- A completed past appointment + medical record for medical history ----
  const pastDept = await Department.findById(doctors[1].department);
  const pastAppointment = await Appointment.create({
    patient: demoPatient._id,
    doctor: doctors[1]._id,
    clinic: doctors[1].clinic,
    department: doctors[1].department,
    schedule: (await Schedule.findOne({ doctor: doctors[1]._id }))._id,
    date: dateOffset(-14),
    time: '10:30',
    queueNumber: `${pastDept.name.charAt(0).toUpperCase()}-5`,
    status: 'COMPLETED',
    source: 'web',
  });
  await MedicalRecord.create({
    patient: demoPatient._id,
    doctor: doctors[1]._id,
    appointment: pastAppointment._id,
    clinic: doctors[1].clinic,
    department: doctors[1].department,
    date: pastAppointment.date,
    examination: "Umumiy ko'rik o'tkazildi, shikoyatlar tasdiqlanmadi.",
    recommendation: "Ko'p suyuqlik ichish, 1 hafta davomida kuzatuv.",
    labResults: [{ name: 'Qon tahlili', value: 'Norma', normalRange: '-', notes: "O'zgarish yo'q" }],
  });

  console.log('[seed] done.');
  console.log('--------------------------------------------------');
  console.log('Demo PATIENT login -> phone: +998901234567  password: patient123');
  console.log('Demo DOCTOR  login -> phone: +998907654321  password: doctor123');
  console.log('--------------------------------------------------');
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
