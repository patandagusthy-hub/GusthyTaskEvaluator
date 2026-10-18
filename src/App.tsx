import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { DashboardView } from './components/DashboardView';
import { EvaluatorWorkspace } from './components/EvaluatorWorkspace';
import { RubricManager } from './components/RubricManager';
import { ArchiveView } from './components/ArchiveView';
import { AdminPreloginModal } from './components/AdminPreloginModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { IdentityEditModal } from './components/IdentityEditModal';
import { AdminSettings } from './components/AdminSettings';
import { StudentSubmissionPortal } from './components/StudentSubmissionPortal';
import { 
  AdminUser, 
  EvaluationResult, 
  RubricTemplate,
  AppSettings,
  SchoolClass,
  AssignmentLink
} from './types';
import { 
  INITIAL_ADMIN_USERS, 
  INITIAL_EVALUATIONS, 
  INITIAL_RUBRIC_TEMPLATES,
  DEFAULT_APP_SETTINGS,
  INITIAL_CLASSES,
  INITIAL_ASSIGNMENT_LINKS
} from './data/mockData';

export default function App() {
  // Navigation Tab: 'home' | 'dashboard' | 'evaluator' | 'rubrics' | 'archive' | 'settings' | 'portal'
  const [currentTab, setCurrentTab] = useState<'home' | 'dashboard' | 'evaluator' | 'rubrics' | 'archive' | 'settings' | 'portal'>('home');
  const [settingsSection, setSettingsSection] = useState<'profile' | 'classes' | 'links' | 'evaluation' | 'security' | 'backup' | 'system'>('profile');

  // Admin User Auth State
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('gusthy_admin_user');
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_USERS[0]; // Default authenticated as Super Admin
  });
  const [isPreloginOpen, setIsPreloginOpen] = useState(false);

  // App Settings State (Strictly preserved, never wiped)
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('gusthy_settings');
    return saved ? JSON.parse(saved) : DEFAULT_APP_SETTINGS;
  });

  // Rubrics State (Strictly preserved, never wiped)
  const [rubrics, setRubrics] = useState<RubricTemplate[]>(() => {
    const saved = localStorage.getItem('gusthy_rubrics');
    return saved ? JSON.parse(saved) : INITIAL_RUBRIC_TEMPLATES;
  });

  // Evaluations Archive State (Strictly preserved, never wiped)
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>(() => {
    const saved = localStorage.getItem('gusthy_evaluations');
    return saved ? JSON.parse(saved) : INITIAL_EVALUATIONS;
  });

  // School Classes State (Strictly preserved, never wiped)
  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    const saved = localStorage.getItem('gusthy_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  // Assignment Links for Students (Strictly preserved, never wiped)
  const [assignmentLinks, setAssignmentLinks] = useState<AssignmentLink[]>(() => {
    const saved = localStorage.getItem('gusthy_assignment_links');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENT_LINKS;
  });

  // Modals state
  const [selectedEvaluationDetail, setSelectedEvaluationDetail] = useState<EvaluationResult | null>(null);
  const [selectedEvaluationForEdit, setSelectedEvaluationForEdit] = useState<EvaluationResult | null>(null);
  const [presetTaskIndex, setPresetTaskIndex] = useState<number | null>(null);
  const [selectedAssignmentLinkForPortal, setSelectedAssignmentLinkForPortal] = useState<AssignmentLink | null>(null);

  // Check URL query parameters on load for student portal link access: ?portal=submit&token=...
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('portal') === 'submit') {
        setCurrentTab('portal');
        const token = params.get('token');
        if (token) {
          const matched = assignmentLinks.find(l => l.token === token);
          if (matched) {
            setSelectedAssignmentLinkForPortal(matched);
          }
        }
      }
    } catch (e) {
      // Ignore SSR/URL parse errors
    }
  }, []);

  // Sync to LocalStorage (DILARANG KERAS MENGHAPUS DATA YANG DI INPUT ADMIN)
  useEffect(() => {
    if (adminUser) {
      localStorage.setItem('gusthy_admin_user', JSON.stringify(adminUser));
    } else {
      localStorage.removeItem('gusthy_admin_user');
    }
  }, [adminUser]);

  useEffect(() => {
    localStorage.setItem('gusthy_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('gusthy_rubrics', JSON.stringify(rubrics));
  }, [rubrics]);

  useEffect(() => {
    localStorage.setItem('gusthy_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('gusthy_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('gusthy_assignment_links', JSON.stringify(assignmentLinks));
  }, [assignmentLinks]);

  // Auth Handlers
  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setIsPreloginOpen(false);
  };

  const handleLogout = () => {
    setAdminUser(null);
    setIsPreloginOpen(true);
  };

  // Add / Save Evaluation
  const handleSaveEvaluation = (newEval: EvaluationResult) => {
    if (settings.autoSaveToArchive) {
      setEvaluations(prev => [newEval, ...prev]);
    }
  };

  // Update Student Identity (e.g. for Unidentified Student)
  const handleSaveIdentity = (evalId: string, updatedName: string, updatedNisn: string, updatedClass: string) => {
    setEvaluations(prev =>
      prev.map(item => {
        if (item.id === evalId) {
          return {
            ...item,
            student_info: {
              ...item.student_info,
              detected_name: updatedName,
              nisn: updatedNisn,
              class_group: updatedClass,
            },
          };
        }
        return item;
      })
    );

    if (selectedEvaluationDetail && selectedEvaluationDetail.id === evalId) {
      setSelectedEvaluationDetail(prev => prev ? {
        ...prev,
        student_info: {
          ...prev.student_info,
          detected_name: updatedName,
          nisn: updatedNisn,
          class_group: updatedClass,
        },
      } : null);
    }
  };

  // Delete evaluation from archive
  const handleDeleteEvaluation = (id: string) => {
    setEvaluations(prev => prev.filter(e => e.id !== id));
  };

  // Add rubric
  const handleAddRubric = (newRubric: RubricTemplate) => {
    setRubrics(prev => [newRubric, ...prev]);
  };

  // Delete rubric
  const handleDeleteRubric = (rubricId: string) => {
    setRubrics(prev => prev.filter(r => r.id !== rubricId));
  };

  // Select rubric and jump to evaluator
  const handleSelectRubricForEvaluator = (rubricId: string) => {
    setCurrentTab('evaluator');
  };

  // Bulk Class Operations
  const handleAddClassesBulk = (newClasses: SchoolClass[]) => {
    setClasses(prev => [...prev, ...newClasses]);
  };

  const handleDeleteClassesBulk = (classIds: string[]) => {
    setClasses(prev => prev.filter(c => !classIds.includes(c.id)));
  };

  // Assignment Links Operations
  const handleAddAssignmentLink = (newLink: AssignmentLink) => {
    setAssignmentLinks(prev => [newLink, ...prev]);
  };

  const handleDeleteAssignmentLink = (id: string) => {
    setAssignmentLinks(prev => prev.filter(l => l.id !== id));
  };

  const handleToggleLinkActive = (id: string) => {
    setAssignmentLinks(prev =>
      prev.map(l => (l.id === id ? { ...l, active: !l.active } : l))
    );
  };

  const handleOpenStudentPortalTest = (link: AssignmentLink) => {
    setSelectedAssignmentLinkForPortal(link);
    setCurrentTab('portal');
  };

  // Restore entire backup data
  const handleRestoreAllData = (data: {
    adminUser?: AdminUser;
    settings?: AppSettings;
    rubrics?: RubricTemplate[];
    evaluations?: EvaluationResult[];
    classes?: SchoolClass[];
    assignmentLinks?: AssignmentLink[];
  }) => {
    if (data.adminUser) setAdminUser(data.adminUser);
    if (data.settings) setSettings(data.settings);
    if (data.rubrics) setRubrics(data.rubrics);
    if (data.evaluations) setEvaluations(data.evaluations);
    if (data.classes) setClasses(data.classes);
    if (data.assignmentLinks) setAssignmentLinks(data.assignmentLinks);
  };

  // Reset to initial factory demo data
  const handleResetFactoryData = () => {
    setAdminUser(INITIAL_ADMIN_USERS[0]);
    setRubrics(INITIAL_RUBRIC_TEMPLATES);
    setEvaluations(INITIAL_EVALUATIONS);
    setSettings(DEFAULT_APP_SETTINGS);
    setClasses(INITIAL_CLASSES);
    setAssignmentLinks(INITIAL_ASSIGNMENT_LINKS);
  };

  // If in student portal mode, render student-facing interface
  if (currentTab === 'portal') {
    return (
      <StudentSubmissionPortal
        assignmentLink={selectedAssignmentLinkForPortal}
        availableClasses={classes}
        rubricTemplates={rubrics}
        onSubmissionSuccess={(evalResult) => {
          setEvaluations(prev => [evalResult, ...prev]);
        }}
        onExitPortal={() => {
          setCurrentTab('home');
          setSelectedAssignmentLinkForPortal(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Global Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        adminUser={adminUser}
        onOpenPrelogin={() => setIsPreloginOpen(true)}
        onLogout={handleLogout}
        archiveCount={evaluations.length}
        onNavigateSettingsSection={(section) => {
          setSettingsSection(section);
          setCurrentTab('settings');
        }}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {currentTab === 'home' && (
          <HomeHero
            onStartEvaluator={() => setCurrentTab('evaluator')}
            onGoToDashboard={() => setCurrentTab('dashboard')}
            onLoadDemoSample={(idx) => {
              setPresetTaskIndex(idx);
              setCurrentTab('evaluator');
            }}
            onOpenStudentLinks={() => {
              setSettingsSection('links');
              setCurrentTab('settings');
            }}
            onOpenBulkClasses={() => {
              setSettingsSection('classes');
              setCurrentTab('settings');
            }}
            onOpenRubrics={() => setCurrentTab('rubrics')}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            evaluations={evaluations}
            onStartNewEvaluation={() => setCurrentTab('evaluator')}
            onViewEvaluationDetail={(item) => setSelectedEvaluationDetail(item)}
            onEditStudentIdentity={(item) => setSelectedEvaluationForEdit(item)}
          />
        )}

        {currentTab === 'evaluator' && (
          <EvaluatorWorkspace
            onSaveEvaluationToArchive={handleSaveEvaluation}
            rubricTemplates={rubrics}
            onOpenIdentityEditor={(item) => setSelectedEvaluationForEdit(item)}
            presetTaskIndex={presetTaskIndex}
            onClearPresetTaskIndex={() => setPresetTaskIndex(null)}
            defaultPassingGrade={settings.defaultPassingGrade}
            defaultTone={settings.defaultTone}
            enableConfetti={settings.enableConfetti}
            classes={classes}
          />
        )}

        {currentTab === 'rubrics' && (
          <RubricManager
            rubrics={rubrics}
            onAddRubric={handleAddRubric}
            onDeleteRubric={handleDeleteRubric}
            onSelectRubricForEvaluator={handleSelectRubricForEvaluator}
          />
        )}

        {currentTab === 'archive' && (
          <ArchiveView
            evaluations={evaluations}
            onViewDetail={(item) => setSelectedEvaluationDetail(item)}
            onEditIdentity={(item) => setSelectedEvaluationForEdit(item)}
            onDeleteEvaluation={handleDeleteEvaluation}
          />
        )}

        {currentTab === 'settings' && adminUser && (
          <AdminSettings
            adminUser={adminUser}
            onUpdateAdminUser={(updated) => setAdminUser(updated)}
            settings={settings}
            onUpdateSettings={(updated) => setSettings(updated)}
            rubrics={rubrics}
            evaluations={evaluations}
            classes={classes}
            onAddClassesBulk={handleAddClassesBulk}
            onDeleteClassesBulk={handleDeleteClassesBulk}
            assignmentLinks={assignmentLinks}
            onAddAssignmentLink={handleAddAssignmentLink}
            onDeleteAssignmentLink={handleDeleteAssignmentLink}
            onToggleLinkActive={handleToggleLinkActive}
            onOpenStudentPortalTest={handleOpenStudentPortalTest}
            onRestoreAllData={handleRestoreAllData}
            onResetFactoryData={handleResetFactoryData}
            initialSection={settingsSection}
          />
        )}
      </main>

      {/* Admin Prelogin Page / Modal */}
      <AdminPreloginModal
        isOpen={isPreloginOpen}
        onClose={() => setIsPreloginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={adminUser}
      />

      {/* Student Assessment Detail Inspection Modal */}
      <StudentDetailModal
        evaluation={selectedEvaluationDetail}
        isOpen={Boolean(selectedEvaluationDetail)}
        onClose={() => setSelectedEvaluationDetail(null)}
        onEditIdentity={(item) => {
          setSelectedEvaluationDetail(null);
          setSelectedEvaluationForEdit(item);
        }}
      />

      {/* 1-Click Fallback Identity Editor Modal */}
      <IdentityEditModal
        evaluation={selectedEvaluationForEdit}
        isOpen={Boolean(selectedEvaluationForEdit)}
        onClose={() => setSelectedEvaluationForEdit(null)}
        onSaveIdentity={handleSaveIdentity}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="font-bold text-slate-300">GusthyTaskEvaluator</span>
            <span>— Asisten AI Penilai Tugas Siswa Multimodal</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Ditenagai Google Gemini Flash</span>
            <span>•</span>
            <span>Standar KKM 0-100</span>
            <span>•</span>
            <button
              onClick={() => {
                setSettingsSection('classes');
                setCurrentTab('settings');
              }}
              className="text-cyan-400 hover:underline"
            >
              Kelola {classes.length} Kelas
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setSettingsSection('links');
                setCurrentTab('settings');
              }}
              className="text-emerald-400 hover:underline"
            >
              Link Kumpul Tugas
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentTab('settings')}
              className="text-indigo-400 hover:underline"
            >
              Pengaturan Admin
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
