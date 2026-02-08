import React, { useRef, useEffect, useCallback } from 'react';

function NoteEditor({ note, onUpdate, saveStatus }) {
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const saveTimerRef = useRef(null);
  const lastNoteIdRef = useRef(null);

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
          <span>Created by {note.createdBy || 'Unknown'} on {new Date(note.createdAt).toLocaleString()}</span>
          {note.lastEditedBy && (
            <span className="edited-by">
              <span className="edited-by-avatar">{note.lastEditedBy.charAt(0).toUpperCase()}</span>
              Last edited by {note.lastEditedBy} at {new Date(note.updatedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default NoteEditor;
