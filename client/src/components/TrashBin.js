import React from 'react';
import { restoreNote, permanentlyDeleteNote } from '../firebase';

function TrashBin({ notes }) {
  const handleRestore = (id) => {
    restoreNote(id);
  };

  const handlePermanentDelete = (id) => {
    if (window.confirm('Permanently delete this note? This cannot be undone.')) {
      permanentlyDeleteNote(id);
    }
  };

  return (
    <div className="trash-bin">
      <div className="trash-header">
        <h2>&#128465; Trash</h2>
        <p className="trash-subtitle">Deleted notes can be restored or permanently removed</p>
      </div>
      {notes.length === 0 ? (
        <div className="trash-empty">
          <div className="trash-empty-icon">&#128076;</div>
          <p>Trash is empty</p>
        </div>
      ) : (
        <div className="trash-list">
          {notes.map(note => (
            <div key={note.id} className="trash-item">
              <div className="trash-item-info">
                <div className="trash-item-title">{note.title || 'Untitled Note'}</div>
                <div className="trash-item-date">
                  Deleted {new Date(note.deletedAt).toLocaleString()}
                </div>
              </div>
              <div className="trash-item-actions">
                <button
                  className="btn-restore"
                  onClick={() => handleRestore(note.id)}
                  title="Restore note"
                >
                  Restore
                </button>
                <button
                  className="btn-perm-delete"
                  onClick={() => handlePermanentDelete(note.id)}
                  title="Delete forever"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrashBin;
