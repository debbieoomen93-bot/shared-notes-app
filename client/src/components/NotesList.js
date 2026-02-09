import React from 'react';
import { getUserColor } from '../userColor';
import { getDisplayTitle } from '../autoTitle';

function NotesList({ notes, activeNoteId, onSelect, onDelete }) {
  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return tmp.textContent || tmp.innerText || '';
  };

  if (notes.length === 0) {
    return (
      <div className="notes-list-empty">
        <p>No notes yet</p>
      </div>
    );
  }

  return (
    <div className="notes-list">
      {notes.map(note => {
        const editorColor = getUserColor(note.lastEditedBy);
        const displayTitle = getDisplayTitle(note);
        const isAuto = !note.manualTitle && displayTitle !== 'Untitled Note';
        return (
          <div
            key={note.id}
            className={`note-item ${note.id === activeNoteId ? 'active' : ''}`}
            onClick={() => onSelect(note.id)}
          >
            <div className="note-item-color-bar" style={{ background: editorColor.bg }} />
            {note.image ? (
              <img
                className="note-item-image"
                src={note.image.thumb}
                alt={note.image.alt}
                style={{ background: note.image.color }}
              />
            ) : (
              <div className="note-item-image-placeholder" style={{ background: editorColor.bg }}>
                {displayTitle.charAt(0) || '?'}
              </div>
            )}
            <div className="note-item-content">
              <div className={`note-item-title ${isAuto ? 'auto' : ''}`}>{displayTitle}</div>
              <div className="note-item-preview">
                {stripHtml(note.content).substring(0, 80) || 'Empty note'}
              </div>
              <div className="note-item-meta">
                <span className="note-item-date">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
                {note.lastEditedBy && (
                  <span className="note-item-author">
                    <span className="note-item-author-dot" style={{ background: editorColor.bg }} />
                    {note.lastEditedBy}
                  </span>
                )}
              </div>
            </div>
            <button
              className="note-item-delete"
              onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
              title="Move to trash"
            >
              &#128465;
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default NotesList;
