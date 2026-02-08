import React from 'react';

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
      {notes.map(note => (
        <div
          key={note.id}
          className={`note-item ${note.id === activeNoteId ? 'active' : ''}`}
          onClick={() => onSelect(note.id)}
        >
          <div className="note-item-content">
            <div className="note-item-title">{note.title || 'Untitled Note'}</div>
            <div className="note-item-preview">
              {stripHtml(note.content).substring(0, 80) || 'Empty note'}
            </div>
            <div className="note-item-date">
              {new Date(note.updatedAt).toLocaleDateString()}
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
      ))}
    </div>
  );
}

export default NotesList;
