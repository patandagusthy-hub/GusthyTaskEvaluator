import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface RubricCriterionInput {
  name: string;
  maxScore: number;
  description: string;
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'GusthyTaskEvaluator',
    timestamp: new Date().toISOString(),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Evaluate endpoint
app.post('/api/evaluate', async (req: Request, res: Response) => {
  try {
    const {
      textSubmission,
      imagePart,
      rubricCriteria,
      passingGrade = 75,
      tone = 'Encouraging & Constructive',
      customInstructions = '',
      targetClass = '',
      taskTitle = '',
    } = req.body;

    if (!textSubmission && !imagePart) {
      return res.status(400).json({
        error: 'Mohon berikan teks lembar kerja atau unggah foto/dokumen tugas siswa.',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di lingkungan server.',
      });
    }

    const criteriaList = Array.isArray(rubricCriteria) && rubricCriteria.length > 0
      ? rubricCriteria
          .map(
            (c: RubricCriterionInput, i: number) =>
              `${i + 1}. ${c.name} (Bobot Maks: ${c.maxScore}): ${c.description || 'Sesuai standar rubrik'}`
          )
          .join('\n')
      : `1. Keselarasan isi dengan instruksi tugas/topik pilihan (Maks: 35)
2. Keruntutan alur dan struktur teks/jawaban (Maks: 30)
3. Akurasi konsep, tata bahasa (grammar/kebahasaan), dan logika pemikiran (Maks: 35)`;

    const systemPrompt = `Anda adalah "GusthyTaskEvaluator", asisten AI penilai tugas siswa multimodal tingkat mahir yang ditenagai oleh model Google Gemini Flash.
Anda bertugas mengevaluasi lembar kerja siswa secara objektif, mendalam, dan edukatif.

PEDOMAN UTAMA:
1. ATURAN EKSTRAKSI IDENTITAS & DOKUMEN (OCR & PARSING):
   - Deteksi otomatis header tugas: Nama Siswa, NISN/NIS, Kelas, dan Judul Tugas dari lembar kerja.
   - Jika tulisan tangan siswa pada foto kurang jelas, gunakan penalaran multimodal konteks kalimat untuk mengenali kata yang dimaksud sebelum menilai.
   - PENTING: Jika identitas siswa tidak ditemukan sama sekali di lembar kerja, tandai nama sebagai: "Unidentified Student #REC-${Math.floor(1000 + Math.random() * 9000)}" agar guru dapat menggantinya dengan 1 klik.
   - Jika kelas tidak terdeteksi, gunakan nilai default atau '${targetClass || 'Kelas Siswa'}'.
   - Jika judul tugas tidak terdeteksi, beri judul deskriptif berdasarkan konten tugas atau '${taskTitle || 'Tugas Siswa'}'.

2. PANDUAN PENILAIAN BERDASARKAN RUBRIK:
   - Evaluasi strictly berbasis kriteria rubrik yang aktif:
${criteriaList}
   - Hitung total skor pada skala 0 - 100 dengan menjumlahkan skor tiap kriteria (proporsional ke 100).
   - Nilai KKM (Passing Grade): ${passingGrade}
   - Aturan Kelulusan:
     * Jika total skor < ${passingGrade}: Siswa otomatis diberi status "Remedial".
     * Jika total skor >= ${passingGrade}: Siswa dinyatakan status "Tuntas".

3. TONE OF VOICE (GAYA BAHASA FEEDBACK):
   - Mode terpilih: "${tone}"
   - Panduan Tone:
     * Encouraging & Constructive: Beri apresiasi terhadap poin kuat siswa terlebih dahulu, lalu sampaikan 1–2 saran perbaikan yang jelas dan ramah.
     * Academic & Rigorous: Formal, analitis, fokus pada ketepatan terminologi dan kepatuhan rubrik akademik.
     * Direct & Actionable: Ringkas, langsung ke poin kesalahan dan langkah perbaikan konkret.
     * Socratic & Inquisitive: Mengajukan pertanyaan reflektif untuk memancing pemahaman mandiri siswa.
     * Gentle / Remedial-Friendly: Lembut, tidak menghakimi, sangat suportif untuk mendampingi siswa remedial.

4. INSTRUKSI TAMBAHAN GURU:
   ${customInstructions ? customInstructions : 'Tidak ada instruksi khusus tambahan.'}

5. EKSTRAKSI TEKS (OCR):
   Sediakan 'transcribed_text' berisi hasil bacaan lengkap tulisan/teks siswa agar guru dapat menelaah teks aslinya dengan mudah.`;

    const contents: any[] = [];

    // Image part if provided
    if (imagePart && imagePart.data) {
      contents.push({
        inlineData: {
          mimeType: imagePart.mimeType || 'image/jpeg',
          data: imagePart.data,
        },
      });
    }

    // Text instructions & student input
    let userPrompt = `Silakan baca dan evaluasi lembar kerja siswa berikut:\n\n`;
    if (textSubmission) {
      userPrompt += `=== LEMBAR KERJA / TEKS SISWA ===\n${textSubmission}\n=== AKHIR LEMBAR KERJA ===\n\n`;
    } else {
      userPrompt += `[Periksa gambar/dokumen terlampir di atas untuk mengekstrak identitas, membaca tulisan tangan/ketikan siswa, dan mengevaluasi isi lembar kerja]\n\n`;
    }
    userPrompt += `Berikan penilaian lengkap berformat JSON sesuai skema yang diminta.`;

    contents.push({ text: userPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents.length === 1 ? contents[0].text : { parts: contents },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            student_info: {
              type: Type.OBJECT,
              properties: {
                detected_name: {
                  type: Type.STRING,
                  description: 'Nama siswa yang terdeteksi, atau Unidentified Student #REC-XXXX jika tidak ada',
                },
                nisn: {
                  type: Type.STRING,
                  description: 'NISN atau nomor induk siswa jika ada, atau strip',
                },
                class_group: {
                  type: Type.STRING,
                  description: 'Kelas siswa yang terdeteksi',
                },
                submission_title: {
                  type: Type.STRING,
                  description: 'Judul tugas yang terdeteksi',
                },
              },
              required: ['detected_name', 'class_group', 'submission_title'],
            },
            scoring: {
              type: Type.OBJECT,
              properties: {
                total_score: {
                  type: Type.NUMBER,
                  description: 'Total skor akhir skala 0-100',
                },
                passing_grade: {
                  type: Type.NUMBER,
                  description: 'Nilai KKM batas tuntas',
                },
                status: {
                  type: Type.STRING,
                  description: 'Status evaluasi: "Tuntas" atau "Remedial"',
                },
                rubric_breakdown: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      criterion: { type: Type.STRING },
                      score: { type: Type.NUMBER },
                      max_score: { type: Type.NUMBER },
                      notes: { type: Type.STRING },
                    },
                    required: ['criterion', 'score', 'max_score', 'notes'],
                  },
                },
              },
              required: ['total_score', 'passing_grade', 'status', 'rubric_breakdown'],
            },
            feedback: {
              type: Type.OBJECT,
              properties: {
                strengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Daftar kelebihan dan poin positif siswa',
                },
                areas_for_improvement: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Daftar aspek yang perlu ditingkatkan',
                },
                student_friendly_summary: {
                  type: Type.STRING,
                  description: 'Ringkasan feedback bersahabat dan memotivasi untuk siswa',
                },
              },
              required: ['strengths', 'areas_for_improvement', 'student_friendly_summary'],
            },
            transcribed_text: {
              type: Type.STRING,
              description: 'Teks hasil transkripsi OCR dari lembar kerja siswa',
            },
          },
          required: ['student_info', 'scoring', 'feedback'],
        },
      },
    });

    const responseText = response.text || '{}';
    const parsedData = JSON.parse(responseText);

    // Ensure status matches KKM logic strictly
    if (parsedData.scoring) {
      const calculatedScore = Number(parsedData.scoring.total_score) || 0;
      const kkm = Number(parsedData.scoring.passing_grade) || Number(passingGrade);
      parsedData.scoring.passing_grade = kkm;
      parsedData.scoring.status = calculatedScore >= kkm ? 'Tuntas' : 'Remedial';
    }

    return res.json({
      success: true,
      data: parsedData,
      raw_json: parsedData,
      modelUsed: 'gemini-3.8-flash',
      evaluatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error during task evaluation:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Terjadi kesalahan saat memproses evaluasi AI.',
    });
  }
});

// Parse Rubric File endpoint (supports Word .docx/.doc, Excel .xlsx/.xls/.csv, PDF, Image)
app.post('/api/parse-rubric', async (req: Request, res: Response) => {
  try {
    const { fileData, fileName, mimeType } = req.body;

    if (!fileData) {
      return res.status(400).json({
        success: false,
        error: 'Mohon unggah file rubrik terlebih dahulu.',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY belum dikonfigurasi di server.',
      });
    }

    const lowerName = (fileName || '').toLowerCase();
    const buffer = Buffer.from(fileData, 'base64');
    let extractedTextContent = '';
    let isInlinePdfOrImage = false;

    // 1. Process Word (.docx, .doc)
    if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc') || mimeType?.includes('word')) {
      try {
        const mammoth = await import('mammoth');
        const mammothResult = await mammoth.extractRawText({ buffer });
        extractedTextContent = mammothResult.value;
      } catch (docErr) {
        console.warn('Mammoth docx parse failed, attempting fallback text extraction:', docErr);
        extractedTextContent = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      }
    }
    // 2. Process Excel (.xlsx, .xls, .csv)
    else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.csv') || mimeType?.includes('sheet') || mimeType?.includes('excel') || mimeType?.includes('csv')) {
      try {
        const xlsx = await import('xlsx');
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetTexts: string[] = [];
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const csvText = xlsx.utils.sheet_to_csv(sheet);
          sheetTexts.push(`--- LEMBAR EXCEL: ${sheetName} ---\n${csvText}`);
        });
        extractedTextContent = sheetTexts.join('\n\n');
      } catch (xlErr) {
        console.warn('XLSX parse error:', xlErr);
        extractedTextContent = buffer.toString('utf-8');
      }
    }
    // 3. Process PDF (.pdf)
    else if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
      isInlinePdfOrImage = true;
    }
    // 4. Process Images (.jpg, .jpeg, .png, .webp)
    else if (mimeType?.startsWith('image/')) {
      isInlinePdfOrImage = true;
    } else {
      // Fallback try as text
      extractedTextContent = buffer.toString('utf-8');
    }

    const systemPrompt = `Anda adalah "GusthyTaskEvaluator", asisten AI spesialis ekstraksi rubrik penilaian akademik siswa.
Tugas Anda adalah membaca dokumen rubrik (bisa berupa teks, tabel Word/Excel, atau PDF) dan mengekstrak komponen rubrik secara akurat:
1. Judul Rubrik (title) yang deskriptif
2. Mata Pelajaran (subject)
3. Jenjang/Fase (gradeLevel, cth: "Fase E (Kelas 10)" atau "Kelas 11")
4. Batas KKM (passingGrade, default 75 jika tidak disebutkan secara eksplisit)
5. Kriteria Penilaian (criteria): daftar aspek penilaian beserta bobot skor maksimal (maxScore) dan deskripsi/indikator ketercapaian.
   - PENTING: Jika di dalam dokumen ada skor per kriteria, ambil skor tersebut.
   - Jika total bobot kriteria belum mencapai 100, sesuaikan secara proporsional atau pertahankan pembagian yang logis menuju total 100.
   - Jangan lewatkan kriteria atau indikator penting yang tertulis di tabel.`;

    const contents: any[] = [];

    if (isInlinePdfOrImage) {
      contents.push({
        inlineData: {
          mimeType: mimeType || (lowerName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
          data: fileData,
        },
      });
      contents.push({
        text: `Silakan ekstrak seluruh kriteria rubrik penilaian dari dokumen terlampir di atas (${fileName}) ke dalam format JSON terstruktur.`
      });
    } else {
      contents.push({
        text: `Berikut adalah isi teks dan tabel dari file rubrik (${fileName}):\n\n=== ISI DOKUMEN RUBRIK ===\n${extractedTextContent || 'Dokumen kosong'}\n=== AKHIR DOKUMEN ===\n\nSilakan ekstrak kriteria rubrik penilaian ke dalam format JSON terstruktur.`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents.length === 1 ? contents[0].text : { parts: contents },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subject: { type: Type.STRING },
            gradeLevel: { type: Type.STRING },
            passingGrade: { type: Type.NUMBER },
            criteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  maxScore: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                },
                required: ['name', 'maxScore', 'description'],
              },
            },
          },
          required: ['title', 'subject', 'gradeLevel', 'criteria'],
        },
      },
    });

    const responseText = response.text || '{}';
    const parsedRubric = JSON.parse(responseText);

    if (!parsedRubric.criteria || !Array.isArray(parsedRubric.criteria) || parsedRubric.criteria.length === 0) {
      parsedRubric.criteria = [
        { name: 'Kesesuaian Isi dengan Topik', maxScore: 35, description: 'Sesuai dengan instruksi tugas' },
        { name: 'Keruntutan Alur & Struktur', maxScore: 30, description: 'Organisasi ide dan pemikiran' },
        { name: 'Ketepatan Bahasa & Konsep', maxScore: 35, description: 'Tata bahasa dan konsep yang benar' },
      ];
    }

    // Assign temporary IDs to each criterion
    parsedRubric.criteria = parsedRubric.criteria.map((c: any, i: number) => ({
      id: `crit-${Date.now()}-${i}`,
      name: c.name || `Kriteria ${i + 1}`,
      maxScore: Number(c.maxScore) || 25,
      description: c.description || 'Sesuai standar rubrik',
    }));

    parsedRubric.passingGrade = Number(parsedRubric.passingGrade) || 75;

    return res.json({
      success: true,
      data: parsedRubric,
      rubric: parsedRubric,
      fileName,
    });
  } catch (parseErr: any) {
    console.error('Error parsing rubric file:', parseErr);
    return res.status(500).json({
      success: false,
      error: parseErr?.message || 'Gagal memproses dan mengekstrak file rubrik.',
    });
  }
});

// Start server and handle Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GusthyTaskEvaluator server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
