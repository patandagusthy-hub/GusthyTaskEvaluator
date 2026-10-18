import { RubricTemplate, EvaluationResult, AdminUser } from '../types';

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin-1',
    name: 'Bapak Gusthy Patanda, M.Pd.',
    nip: '19840315 200801 1 008',
    email: 'admin@gusthy.sch.id',
    school: 'SMA Negeri Unggulan Nusantara',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    aiTokenQuota: 850000,
    licenseTier: 'Enterprise AI Pro Unlimited',
    isVerified: true,
  },
  {
    id: 'admin-2',
    name: 'Ibu Ratna Dewi, S.Pd.',
    nip: '19890620 201202 2 004',
    email: 'ratna.dewi@gusthy.sch.id',
    school: 'SMA Negeri Unggulan Nusantara',
    role: 'Guru Penguji',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    aiTokenQuota: 450000,
    licenseTier: 'Guru Educator Plan',
    isVerified: true,
  },
];

export const INITIAL_RUBRIC_TEMPLATES: RubricTemplate[] = [
  {
    id: 'rubric-deskripsi-indo',
    title: 'Rubrik Teks Deskripsi & Narasi',
    subject: 'Bahasa Indonesia',
    gradeLevel: 'Fase E (Kelas 10)',
    passingGrade: 75,
    criteria: [
      {
        id: 'c1',
        name: 'Keruntutan Alur & Struktur',
        maxScore: 35,
        description: 'Alur deskripsi tersusun runtut dari identifikasi umum ke deskripsi bagian dan simpulan.',
      },
      {
        id: 'c2',
        name: 'Ketepatan Kebahasaan & Kosakata',
        maxScore: 30,
        description: 'Ketepatan konjungsi, ejaan EYD, variasi kata sifat/deskriptif, dan minim typo.',
      },
      {
        id: 'c3',
        name: 'Relevansi dengan Topik & Detail Sensorik',
        maxScore: 35,
        description: 'Kesesuaian dengan tema penugasan serta penggambaran detail panca indera yang hidup.',
      },
    ],
  },
  {
    id: 'rubric-sains-praktikum',
    title: 'Rubrik Laporan Praktikum Sains & IPA',
    subject: 'Biologi / Fisika / Kimia',
    gradeLevel: 'Fase F (Kelas 11-12)',
    passingGrade: 75,
    criteria: [
      {
        id: 'c4',
        name: 'Ketepatan Konsep Sains & Teori Pendukung',
        maxScore: 40,
        description: 'Pemahaman mendalam mengenai hukum ilmiah, rumus, dan prinsip kerja fenomena.',
      },
      {
        id: 'c5',
        name: 'Sistematika & Penyajian Data Percobaan',
        maxScore: 30,
        description: 'Tabel observasi teratur, visualisasi grafik jelas, dan perhitungan matematis akurat.',
      },
      {
        id: 'c6',
        name: 'Analisis Pembahasan & Kesimpulan Logis',
        maxScore: 30,
        description: 'Kemampuan mengaitkan variabel kontrol, bebas, dan terikat dengan hasil empiris.',
      },
    ],
  },
  {
    id: 'rubric-math-problem',
    title: 'Rubrik Pemecahan Masalah Matematika',
    subject: 'Matematika Tingkat Lanjut',
    gradeLevel: 'Kelas 10-12',
    passingGrade: 70,
    criteria: [
      {
        id: 'c7',
        name: 'Pemahaman Masalah & Notasi Matematis',
        maxScore: 30,
        description: 'Mampu menerjemahkan soal cerita ke dalam model matematis yang tepat.',
      },
      {
        id: 'c8',
        name: 'Ketepatan Langkah Prosedural & Algoritma',
        maxScore: 40,
        description: 'Langkah pengerjaan sistematis, substitusi benar, dan pembuktian runut.',
      },
      {
        id: 'c9',
        name: 'Akurasi Hasil Akhir & Interpretasi Solusi',
        maxScore: 30,
        description: 'Jawaban final benar beserta satuan dan interpretasi konteks nyata.',
      },
    ],
  },
  {
    id: 'rubric-english-essay',
    title: 'Rubric for Argumentative & Analytical Essay',
    subject: 'Bahasa Inggris',
    gradeLevel: 'Senior High (Grade 10-12)',
    passingGrade: 75,
    criteria: [
      {
        id: 'c10',
        name: 'Thesis Statement & Argument Development',
        maxScore: 35,
        description: 'Clear position, logical claims supported by concrete textual evidence or data.',
      },
      {
        id: 'c11',
        name: 'Grammatical Accuracy & Cohesion',
        maxScore: 35,
        description: 'Mastery of tenses, transitions (furthermore, however), and syntactic variety.',
      },
      {
        id: 'c12',
        name: 'Academic Vocabulary & Tone',
        maxScore: 30,
        description: 'Use of formal register, domain-specific terminology, and clear voice.',
      },
    ],
  },
];

export const INITIAL_EVALUATIONS: EvaluationResult[] = [
  {
    id: 'eval-001',
    student_info: {
      detected_name: 'Ahmad Rayhan Pratama',
      nisn: '0082910245',
      class_group: 'Kelas 10-A',
      submission_title: 'Teks Deskripsi: Keindahan Hutan Mangrove Kulon Progo',
    },
    scoring: {
      total_score: 88,
      passing_grade: 75,
      status: 'Tuntas',
      rubric_breakdown: [
        {
          criterion: 'Keruntutan Alur & Struktur',
          score: 32,
          max_score: 35,
          notes: 'Struktur orientasi, deskripsi bagian jembatan api-api dan flora fauna tertata sangat rapi.',
        },
        {
          criterion: 'Ketepatan Kebahasaan & Kosakata',
          score: 26,
          max_score: 30,
          notes: 'Kosakata sensorik kaya, terdapat sedikit inkonsistensi tanda petik tunggal pada istilah lokal.',
        },
        {
          criterion: 'Relevansi dengan Topik',
          score: 30,
          max_score: 35,
          notes: 'Sangat sesuai instruksi penugasan tempat wisata ekologis lokal.',
        },
      ],
    },
    feedback: {
      strengths: [
        'Diksi deskriptif sangat memikat, pembaca seolah merasakan semilir angin dan aroma rawa bakau.',
        'Kerapian paragraf dan alur transisi dari pintu masuk sampai menara pandang sangat runtut.',
      ],
      areas_for_improvement: [
        'Perhatikan penggunaan huruf kapital pada nama geografis spesifik sesuai pedoman EYD V.',
      ],
      student_friendly_summary: 'Kerja luar biasa, Rayhan! Teks deskripsimu sangat imajinatif dan membuat siapapun ingin berkunjung ke sana. Terus pertahankan ketajaman observasimu!',
    },
    transcribed_text: 'Nama: Ahmad Rayhan Pratama | Kelas: 10-A | NISN: 0082910245\nJudul: Keindahan Hutan Mangrove Kulon Progo\n\nHutan Mangrove Kulon Progo membentang hijau di pesisir pantai selatan. Saat melangkah di atas jembatan bambu, semilir angin laut menyapa dengan lembut...',
    evaluatedAt: '2026-10-17T14:30:00.000Z',
    sourceType: 'text',
    toneUsed: 'Encouraging & Constructive',
    kkmUsed: 75,
  },
  {
    id: 'eval-002',
    student_info: {
      detected_name: 'Siti Nurhaliza',
      nisn: '0089201948',
      class_group: 'Kelas 10-A',
      submission_title: 'Teks Narasi Pengalaman Liburan',
    },
    scoring: {
      total_score: 64,
      passing_grade: 75,
      status: 'Remedial',
      rubric_breakdown: [
        {
          criterion: 'Keruntutan Alur & Struktur',
          score: 20,
          max_score: 35,
          notes: 'Alur melompat-lompat tanpa konjungsi kronologis yang memadai; bagian komplikasi tidak tuntas.',
        },
        {
          criterion: 'Ketepatan Kebahasaan & Kosakata',
          score: 18,
          max_score: 30,
          notes: 'Banyak kalimat tidak lengkap (tanpa predikat jelas) dan pengaruh bahasa lisan percakapan.',
        },
        {
          criterion: 'Relevansi dengan Topik',
          score: 26,
          max_score: 35,
          notes: 'Topik sesuai namun elaborasi detail latar peristiwa masih sangat minim.',
        },
      ],
    },
    feedback: {
      strengths: [
        'Ide cerita dasar tentang petualangan keluarga di kebun teh sebenarnya sangat menarik.',
      ],
      areas_for_improvement: [
        'Gunakan kata hubung penanda urutan waktu seperti "kemudian", "setelah itu", dan "pada keesokan harinya".',
        'Lengkapi struktur kalimat utama agar memenuhi kaidah Subjek-Predikat-Objek yang baku.',
      ],
      student_friendly_summary: 'Jangan berkecil hati, Siti! Idenya sudah seru. Mari kita jadwalkan sesi pengayaan singkat untuk menyusun kalimat runtut agar ceritamu semakin enak dibaca.',
    },
    transcribed_text: 'Nama: Siti Nurhaliza\nKelas: 10-A\n\nLiburan kemarin aku ke kebun teh sama bapak ibu. Di sana dingin banget terus liat orang petik daun teh. Waktu itu ada kabut tebal jalanannya licin...',
    evaluatedAt: '2026-10-17T15:15:00.000Z',
    sourceType: 'text',
    toneUsed: 'Gentle / Remedial-Friendly',
    kkmUsed: 75,
  },
  {
    id: 'eval-003',
    student_info: {
      detected_name: 'Unidentified Student #REC-4821',
      nisn: '-',
      class_group: 'Kelas 10-B',
      submission_title: 'Uraian Analisis Karakter Novel Laskar Pelangi',
    },
    scoring: {
      total_score: 78,
      passing_grade: 75,
      status: 'Tuntas',
      rubric_breakdown: [
        {
          criterion: 'Keruntutan Alur & Struktur',
          score: 28,
          max_score: 35,
          notes: 'Analisis perwatakan tokoh Lintang dan Bu Mus tersusun logis.',
        },
        {
          criterion: 'Ketepatan Kebahasaan & Kosakata',
          score: 24,
          max_score: 30,
          notes: 'Gaya bahasa cukup baik dengan istilah sastra dasar yang relevan.',
        },
        {
          criterion: 'Relevansi dengan Topik',
          score: 26,
          max_score: 35,
          notes: 'Kutipan kutipan dialog pendukung watak sudah disertakan dengan baik.',
        },
      ],
    },
    feedback: {
      strengths: [
        'Pendalaman karakter tokoh Lintang diuraikan dengan bukti kutipan yang akurat.',
      ],
      areas_for_improvement: [
        'Harap menuliskan identitas Nama dan NISN di bagian pojok kanan atas lembar kerja agar tidak berstatus tanpa nama.',
      ],
      student_friendly_summary: 'Analisis karakter novelmu sangat bernas dan tajam! Mohon jangan lupa cantumkan nama di tugas berikutnya ya.',
    },
    transcribed_text: '[Catatan OCR: Header lembar kerja terpotong / nama tidak tertera]\nTugas Bahasa Indonesia - Analisis Karakter Laskar Pelangi\nLintang adalah sosok anak pesisir yang memiliki kecerdasan luar biasa...',
    evaluatedAt: '2026-10-18T01:10:00.000Z',
    sourceType: 'image',
    toneUsed: 'Encouraging & Constructive',
    kkmUsed: 75,
  },
];

export const DEMO_PRESET_TASKS = [
  {
    id: 'demo-1',
    label: '📝 Esai Teks Deskripsi (Lengkap dengan Identitas)',
    studentName: 'Farhan Dwi Wicaksono',
    classGroup: 'Kelas 10-B',
    nisn: '0087612301',
    title: 'Teks Deskripsi: Pesona Candi Borobudur di Fajar Pagi',
    rubricId: 'rubric-deskripsi-indo',
    tone: 'Encouraging & Constructive' as const,
    passingGrade: 75,
    sampleContent: `NAMA SISWA: Farhan Dwi Wicaksono
NISN: 0087612301
KELAS: Kelas 10-B
JUDUL TUGAS: Pesona Candi Borobudur di Fajar Pagi

Candi Borobudur berdiri megah di atas bukit Magelang, Jawa Tengah, diselimuti halimun pagi yang tipis. Bangunan batu andesit berwarna abu-abu kehitaman ini tersusun atas tingkatan kamadhatu, rupadhatu, hingga arupadhatu yang memuncak pada stupa induk raksasa.

Ketika sinar mentari terbit menyinari relief dinding candi, ukiran kisah-kisah kuno seolah hidup kembali. Siluet stupa berterawang yang diterpa semburat cahaya keemasan menciptakan kedamaian yang mendalam. Suara kicau burung pipit dan desau angin di antara pepohonan kenari menambah keheningan sakral tempat bersejarah ini.

Pengunjung yang tiba sebelum fajar akan menyaksikan panorama magis puncak Gunung Merapi dan Merbabu di kejauhan. Keagungan arsitektur peninggalan Dinasti Syailendra ini bukan sekadar monumen batu, melainkan mahakarya peradaban Nusantara yang memesona dunia.`,
  },
  {
    id: 'demo-2',
    label: '🔬 Laporan Sains Biologi (Analisis Praktikum Fotosintesis)',
    studentName: 'Nadia Safitri',
    classGroup: 'Kelas 11 MIPA 3',
    nisn: '0075482910',
    title: 'Laporan Praktikum: Uji Ingenhousz pada Tanaman Hydrilla verticillata',
    rubricId: 'rubric-sains-praktikum',
    tone: 'Academic & Rigorous' as const,
    passingGrade: 75,
    sampleContent: `NAMA: Nadia Safitri
NISN: 0075482910
KELAS: 11 MIPA 3
TUGAS: Laporan Praktikum Ingenhousz (Pengaruh Intensitas Cahaya dan NaHCO3 terhadap Laju Fotosintesis)

I. TUJUAN
Membuktikan bahwa proses fotosintesis menghasilkan gas oksigen (O2) dan menyelidiki pengaruh penambahan senyawa natrium bikarbonat (NaHCO3) serta variasi intensitas cahaya.

II. DATA HASIL PENGAMATAN
1. Tabung A (Cahaya Matahari Langsung + Air Biasa): Rata-rata 42 gelembung gas per 5 menit.
2. Tabung B (Cahaya Matahari Langsung + 5 gram NaHCO3): Rata-rata 89 gelembung gas per 5 menit.
3. Tabung C (Tempat Teduh/Gelap + Air Biasa): Rata-rata 4 gelembung gas per 5 menit.
4. Uji Bara Api: Bara lidi yang didekatkan pada rongga udara tabung reaksi langsung menyala terang, membuktikan gas yang terkumpul adalah Oksigen (O2).

III. PEMBAHASAN
Fotosintesis berlangsung melalui reaksi terang dan reaksi gelap dengan persamaan: 6CO2 + 6H2O -> C6H12O6 + 6O2. Pada Tabung B, penambahan NaHCO3 terurai menjadi Na+, OH-, dan ion bikarbonat yang melepaskan CO2 terlarut dalam air. Kadar CO2 yang melimpah bertindak sebagai substrat utama reaksi gelap (siklus Calvin), sehingga mempercepat pembentukan senyawa fotosintat dan melepaskan O2 sebagai produk sampingan fotolisis air. Sebaliknya, pada tempat teduh (Tabung C), ketiadaan foton cahaya membatasi eksitasi elektron pada klorofil fotosistem II.

IV. KESIMPULAN
1. Fotosintesis terbukti melepaskan gas oksigen.
2. Laju fotosintesis berkorelasi positif dengan intensitas radiasi cahaya tampak dan ketersediaan konsentrasi karbon dioksida.`,
  },
  {
    id: 'demo-3',
    label: '⚠️ Lembar Kerja Tanpa Identitas (Uji Unidentified Fallback)',
    studentName: '',
    classGroup: 'Kelas 10',
    nisn: '',
    title: 'Lembar Jawaban Uji Pemahaman Teori Gravitasi',
    rubricId: 'rubric-sains-praktikum',
    tone: 'Direct & Actionable' as const,
    passingGrade: 75,
    sampleContent: `[LEMBAR KERJA SISWA TULISAN TANGAN - BAGIAN ATAS SOBEK / TANPA NAMA & NISN]

Jawaban Pertanyaan Fisika:
1. Mengapa astronot melayang di stasiun luar angkasa ISS padahal gravitasi bumi di orbit tersebut masih sekitar 90%?
Jawab: Astronot melayang bukan karena tidak ada gravitasi sama sekali, melainkan karena stasiun ISS dan astronot sedang berada dalam kondisi jatuh bebas (free fall) mengelilingi kelengkungan bumi dengan kecepatan orbit yang seimbang dengan percepatan sentripetal.

2. Hitung gaya gravitasi antara dua benda bermassa 50kg dan 80kg pada jarak 2 meter!
Jawab: F = G * (m1 * m2) / r^2
F = (6.67 x 10^-11) * (50 * 80) / 4
F = (6.67 x 10^-11) * 4000 / 4
F = 6.67 x 10^-8 Newton.

Kesimpulan: Gaya tarik gravitasi pada benda massa kecil di kehidupan sehari-hari sangat lemah sehingga tidak kita rasakan, namun menjadi sangat signifikan pada skala planet dan bintang.`,
  },
];

export const DEFAULT_APP_SETTINGS = {
  defaultPassingGrade: 75,
  defaultTone: 'Encouraging & Constructive' as const,
  receiptPrefix: 'REC-',
  autoSaveToArchive: true,
  multimodalTolerance: 'Otomatis & Kontekstual' as const,
  schoolAcademicYear: '2025/2026 Ganjil',
  enableConfetti: true,
  autoCompressStudentUploads: true,
  maxImageDimension: 1800,
};

export const INITIAL_CLASSES: { id: string; name: string; gradeLevel: string; academicYear: string; studentCount: number; createdAt: string }[] = [
  { id: 'cls-10a', name: 'Kelas 10-A', gradeLevel: 'Fase E (Kelas 10)', academicYear: '2025/2026 Ganjil', studentCount: 36, createdAt: '2026-07-15T08:00:00Z' },
  { id: 'cls-10b', name: 'Kelas 10-B', gradeLevel: 'Fase E (Kelas 10)', academicYear: '2025/2026 Ganjil', studentCount: 36, createdAt: '2026-07-15T08:00:00Z' },
  { id: 'cls-10c', name: 'Kelas 10-C', gradeLevel: 'Fase E (Kelas 10)', academicYear: '2025/2026 Ganjil', studentCount: 35, createdAt: '2026-07-15T08:00:00Z' },
  { id: 'cls-11m1', name: 'Kelas 11 MIPA 1', gradeLevel: 'Fase F (Kelas 11)', academicYear: '2025/2026 Ganjil', studentCount: 34, createdAt: '2026-07-15T08:00:00Z' },
  { id: 'cls-11m2', name: 'Kelas 11 MIPA 2', gradeLevel: 'Fase F (Kelas 11)', academicYear: '2025/2026 Ganjil', studentCount: 35, createdAt: '2026-07-15T08:00:00Z' },
  { id: 'cls-11m3', name: 'Kelas 11 MIPA 3', gradeLevel: 'Fase F (Kelas 11)', academicYear: '2025/2026 Ganjil', studentCount: 34, createdAt: '2026-07-15T08:00:00Z' },
  { id: 'cls-12m1', name: 'Kelas 12 MIPA 1', gradeLevel: 'Fase F (Kelas 12)', academicYear: '2025/2026 Ganjil', studentCount: 32, createdAt: '2026-07-15T08:00:00Z' },
];

export const INITIAL_ASSIGNMENT_LINKS = [
  {
    id: 'link-01',
    title: 'Tugas Teks Deskripsi Objek Wisata Nusantara',
    subject: 'Bahasa Indonesia',
    targetClass: 'Kelas 10-A',
    rubricId: 'rubric-deskripsi-indo',
    passingGrade: 75,
    tone: 'Encouraging & Constructive' as const,
    instructions: 'Kumpulkan foto tulisan tangan lembar kerja Anda atau ketik langsung teks deskripsi Anda. Pastikan tulisan terbaca jelas.',
    dueDate: '2026-10-30',
    token: 'TUGAS-DESKRIPSI-10A',
    active: true,
    createdAt: '2026-10-15T08:00:00Z',
  },
  {
    id: 'link-02',
    title: 'Laporan Praktikum Uji Fotosintesis Ingenhousz',
    subject: 'Biologi',
    targetClass: 'Kelas 11 MIPA 3',
    rubricId: 'rubric-sains-praktikum',
    passingGrade: 75,
    tone: 'Academic & Rigorous' as const,
    instructions: 'Sertakan tabel pengamatan dan pembahasan reaksi terang & gelap fotosintesis.',
    dueDate: '2026-11-05',
    token: 'PRAKTIKUM-INGENHOUSZ-11M3',
    active: true,
    createdAt: '2026-10-16T09:00:00Z',
  },
];


