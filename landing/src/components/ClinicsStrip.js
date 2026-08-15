const CLINICS = [
  'MedLine Clinic',
  'Tashkent Medical Center',
  'City Hospital',
  'Neo Clinic',
  'Family Clinic',
  'Shifo Medical',
  'Grand Med',
  'Healthy Life Clinic',
];

const STATS = [
  { value: '8+', label: 'Klinika' },
  { value: '12', label: "Bo'lim yo'nalishi" },
  { value: '70+', label: 'Shifokor' },
  { value: '24/7', label: 'Navbat kuzatuvi' },
];

export function ClinicsStrip() {
  return (
    <section className="bg-surface py-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {CLINICS.map((name) => (
            <span key={name} className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
