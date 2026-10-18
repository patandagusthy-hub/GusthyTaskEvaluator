export interface StudentInfo {
  detected_name: string;
  nisn?: string;
  class_group: string;
  submission_title: string;
}

export interface RubricCriterionScore {
  criterion: string;
  score: number;
  max_score: number;
  notes: string;
}

export interface Scoring {
  total_score: number;
  passing_grade: number;
  status: 'Tuntas' | 'Remedial';
  rubric_breakdown: RubricCriterionScore[];
}

export interface Feedback {
  strengths: string[];
  areas_for_improvement: string[];
  student_friendly_summary: string;
}

export interface EvaluationResult {
  id: string;
  student_info: StudentInfo;
  scoring: Scoring;
  feedback: Feedback;
  transcribed_text?: string;
  evaluatedAt: string;
  sourceType: 'image' | 'text' | 'document';
  imagePreview?: string;
  toneUsed: string;
  kkmUsed: number;
}

export interface RubricCriterion {
  id: string;
  name: string;
  maxScore: number;
  description: string;
}

export interface RubricTemplate {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  passingGrade: number;
  criteria: RubricCriterion[];
}

export type ToneMode =
  | 'Encouraging & Constructive'
  | 'Academic & Rigorous'
  | 'Direct & Actionable'
  | 'Socratic & Inquisitive'
  | 'Gentle / Remedial-Friendly';

export interface AdminUser {
  id: string;
  name: string;
  nip: string;
  email: string;
  school: string;
  role: 'Super Admin' | 'Guru Penguji' | 'Kepala Kurikulum';
  avatar: string;
  aiTokenQuota: number;
  licenseTier: string;
  isVerified: boolean;
}

export interface AppSettings {
  defaultPassingGrade: number;
  defaultTone: ToneMode;
  receiptPrefix: string;
  autoSaveToArchive: boolean;
  multimodalTolerance: 'Otomatis & Kontekstual' | 'Tinggi (Toleran)' | 'Ketat & Kaku';
  schoolAcademicYear: string;
  enableConfetti: boolean;
  autoCompressStudentUploads?: boolean;
  maxImageDimension?: number;
}

export interface SchoolClass {
  id: string;
  name: string;
  gradeLevel: string;
  academicYear: string;
  studentCount?: number;
  createdAt: string;
}

export interface AssignmentLink {
  id: string;
  title: string;
  subject: string;
  targetClass: string;
  rubricId: string;
  passingGrade: number;
  tone: ToneMode;
  instructions?: string;
  dueDate?: string;
  token: string;
  active: boolean;
  createdAt: string;
}
