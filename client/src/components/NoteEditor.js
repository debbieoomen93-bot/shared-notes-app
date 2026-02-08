import React, { useRef, useEffect, useCallback } from 'react';
import { getUserColor, getUserInitial } from '../userColor';
import { getAutoTitle } from '../autoTitle';

function NoteEditor({ note, onUpdate, saveStatus }) {
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const saveTimerRef = useRef(null);
  const lastNoteIdRef = useRef(null);

  const creatorColor = getUserColor(note.createdBy);
  const editorColor = getUserColor(note.lastEditedBy);

  const isAutoTitle = !note.manualTitle;

  // When switching notes, update the editor content
  useEffect(() => {
    if (note.id !== lastNoteIdRef.current) {
      lastNoteIdRef.current = note.id;
      if (titleRef.current) {
        titleRef.current.value = isAutoTitle ? '' : (note.title || '');
      }
      if (contentRef.current) {
        contentRef.current.innerHTML = note.content || '';
      }
    }
  }, [note.id, note.title, note.content, isAutoTitle]);

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
    const value = e.target.value;
    if (value === '') {
      // User cleared the title - go back to auto mode
      debouncedSave(note.id, { title: '', manualTitle: false });
    } else {
      debouncedSave(note.id, { title: value, manualTitle: true });
    }
  };

  const scrollCaretIntoView = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && contentRef.current) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const editorRect = contentRef.current.getBoundingClientRect();
      if (rect.bottom > editorRect.bottom) {
        contentRef.current.scrollTop += rect.bottom - editorRect.bottom + 16;
      }
    }
  };

  const handleContentChange = () => {
    if (contentRef.current) {
      const html = contentRef.current.innerHTML;
      const updates = { content: html };

      // Auto-generate title from content if no manual title
      if (isAutoTitle) {
        updates.title = getAutoTitle(html);
      }

      debouncedSave(note.id, updates);
      scrollCaretIntoView();
    }
  };

  const statusText = saveStatus === 'saving' ? 'Saving...' : 'Saved';
  const displayTitle = isAutoTitle ? getAutoTitle(note.content) : note.title;
  const placeholderText = isAutoTitle && displayTitle ? displayTitle : 'Note title...';

  return (
    <div className="editor">
      <div className="editor-header">
        <input
          ref={titleRef}
          className={`editor-title ${isAutoTitle && displayTitle ? 'auto-title' : ''}`}
          defaultValue={isAutoTitle ? '' : (note.title || '')}
          onChange={handleTitleChange}
          placeholder={placeholderText}
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
