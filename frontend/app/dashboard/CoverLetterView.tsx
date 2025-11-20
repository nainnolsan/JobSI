// CoverLetterView: lista + creación (modo automático y manual)
"use client";
import React from "react";
import { CoverLetterListSection } from "../../features/cover-letters/components/CoverLetterListSection";
import { DraftModal } from "../../features/cover-letters/components/DraftModal";
import { useCoverLetters } from "../../features/cover-letters/hooks/useCoverLetters";

export default function CoverLetterView() {
  const {
    // state
    loading,
    showNewModal,
    mode,
    step,
    rawText,
    parsed,
    parseLoading,
    generateLoading,
    editingId,
    drafts,
    completed,
    // setters for modal
    setStep,
    setMode,
    setRawText,
    setParsed,
    // actions
    openNew,
    close,
    openDraft,
    viewCompleted,
    parse,
    generate,
    saveDraft,
  } = useCoverLetters();

  return (
    <div className="pt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Cover Letters</h2>
          <p className="text-gray-500 mt-1">Create and manage your AI-powered cover letters</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md" onClick={openNew}>
          + New Letter
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        </div>
      ) : (drafts.length + completed.length) === 0 ? (
        <div 
          className="bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-400 transition-all cursor-pointer group"
          onClick={openNew}
        >
          <div className="p-16 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No cover letters yet</h3>
            <p className="text-gray-500 text-lg">Click anywhere to create your first AI-powered cover letter</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Drafts Section */}
          {drafts.length > 0 && (
            <CoverLetterListSection
              title="Borradores"
              count={drafts.length}
              items={drafts}
              badgeColor="yellow"
              primaryLabel="Abrir"
              onPrimary={openDraft}
            />
          )}

          {/* Completed Section */}
          {completed.length > 0 && (
            <CoverLetterListSection
              title="Completadas"
              count={completed.length}
              items={completed}
              badgeColor="green"
              primaryLabel="Ver"
              onPrimary={viewCompleted}
            />
          )}

          {/* Empty state when only one section has items */}
          {drafts.length === 0 && completed.length > 0 && (
            <div className="bg-purple-50 rounded-xl border-2 border-dashed border-purple-200 p-6 text-center">
              <p className="text-purple-600 text-sm font-medium">No drafts in progress</p>
            </div>
          )}
          
          {completed.length === 0 && drafts.length > 0 && (
            <div className="bg-purple-50 rounded-xl border-2 border-dashed border-purple-200 p-6 text-center">
              <p className="text-purple-600 text-sm font-medium">No completed cover letters yet</p>
            </div>
          )}
        </div>
      )}

      <DraftModal
        open={showNewModal}
        editingId={editingId}
        step={step}
        setStep={setStep}
        mode={mode}
        setMode={setMode}
        rawText={rawText}
        setRawText={setRawText}
        parsed={parsed}
        setParsed={setParsed}
        parseLoading={parseLoading}
        generateLoading={generateLoading}
        onParse={parse}
        onGenerate={generate}
        onSaveDraft={saveDraft}
        onClose={close}
      />
    </div>
  );
}