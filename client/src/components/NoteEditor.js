import React, { useRef, useEffect, useCallback } from 'react';
import { getUserColor, getUserInitial } from '../userColor';

function NoteEditor({ note, onUpdate, saveStatus }) {
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const saveTimerRef = useRef(null);
  const lastNoteIdRef = useRef(null);

  const creatorColor = getUserColor(note.createdBy);
  const editorColor = getUserColor(note.lastEditedBy);

  // When switching notes, update the editor content
  useEffect(() => {
    if (note.id !== lastNoteIdRef.current) {
      lastNoteIdRef.current = note.id;
      if (titleRef.current) {
        titleRef.current.value = note.title || '';
      }
      if (contentRef.current) {
        contentRef.current.innerHTML = note.content || '';
      }
    }
  }, [note.id, note.title, note.content]);

  const debouncedSave = useCallback((id, updates) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      onUpdate(id, updates);
    }, 800);
  }, [onUpdate]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const handleTitleChange = (e) => {
    debouncedSave(note.id, { title: e.target.value });
  };

  const handleContentChange = () => {
    if (contentRef.current) {
      debouncedSave(note.id, { content: contentRef.current.innerHTML });
    }
  };

  const statusText = saveStatus === 'saving' ? 'Saving...' : 'Saved';

  return (
    <div className="editor">
      <div className="editor-header">
        <input
          ref={titleRef}
          className="editor-title"
          defaultValue={note.title}
          onChange={handleTitleChange}
          placeholder="Note title..."
        />
        <span className={`save-status ${saveStatus}`}>{statusText}</span>
      </div>
      <div
        ref={contentRef}
        className="editor-content"
        contentEditable
        onInput={handleContentChange}
        suppressContentEditableWarning
        placeholder="Start typing..."
        data-placeholder="Start typing your note..."
      />
      <div className="editor-footer">
        <div className="editor-footer-left">
          <span className="edited-by">
            <span className="edited-by-avatar" style={{ background: creatorColor.bg }}>
              {getUserInitial(note.createdBy)}
            </span>
            <span className="edited-by-name" style={{ color: creatorColor.accent }}>
              {note.createdBy || 'Unknown'}
            </span>
            <span>created on {new Date(note.createdAt).toLocaleString()}</span>
          </span>
          {note.lastEditedBy && (
            <span className="edited-by">
              <span className="edited-by-avatar" style={{ background: editorColor.bg }}>
                {getUserInitial(note.lastEditedBy)}
              </span>
              <span className="edited-by-name" style={{ color: editorColor.accent }}>
                {note.lastEditedBy}
              </span>
              <span>edited at {new Date(note.updatedAt).toLocaleString()}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default NoteEditor;
