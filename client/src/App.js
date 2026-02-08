import React, { useState, useEffect, useCallback } from 'react';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import TrashBin from './components/TrashBin';
import Toolbar from './components/Toolbar';
import { subscribeToNotes, createNote, updateNote, softDeleteNote } from './firebase';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');

  useEffect(() => {
    const unsubscribe = subscribeToNotes((allNotes) => {
      setNotes(allNotes);
    });
    return () => unsubscribe();
  }, []);

  const activeNotes = notes.filter(n => !n.deleted).sort((a, b) => b.updatedAt - a.updatedAt);
  const trashedNotes = notes.filter(n => n.deleted).sort((a, b) => b.deletedAt - a.deletedAt);
  const activeNote = notes.find(n => n.id === activeNoteId);

  const handleCreateNote = useCallback(() => {
    const id = createNote();
    setActiveNoteId(id);
    setShowTrash(false);
  }, []);

  const handleSelectNote = useCallback((id) => {
    setActiveNoteId(id);
    setShowTrash(false);
  }, []);

  const handleDeleteNote = useCallback((id) => {
    softDeleteNote(id);
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  }, [activeNoteId]);

  const handleUpdateNote = useCallback((id, updates) => {
    setSaveStatus('saving');
    updateNote(id, updates).then(() => {
      setSaveStatus('saved');
    });
  }, []);

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Shared Notes</h1>
          <button className="btn-new" onClick={handleCreateNote} title="New Note">+</button>
        </div>
        <NotesList
          notes={activeNotes}
          activeNoteId={activeNoteId}
          onSelect={handleSelectNote}
          onDelete={handleDeleteNote}
        />
        <button
          className={`btn-trash ${showTrash ? 'active' : ''}`}
          onClick={() => { setShowTrash(!showTrash); setActiveNoteId(null); }}
        >
          <span className="trash-icon">&#128465;</span>
          Trash ({trashedNotes.length})
        </button>
      </div>
      <div className="main">
        {showTrash ? (
          <TrashBin notes={trashedNotes} />
        ) : activeNote && !activeNote.deleted ? (
          <>
            <Toolbar />
            <NoteEditor
              note={activeNote}
              onUpdate={handleUpdateNote}
              saveStatus={saveStatus}
            />
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">&#128221;</div>
            <h2>No note selected</h2>
            <p>Select a note from the sidebar or create a new one</p>
            <button className="btn-create" onClick={handleCreateNote}>Create Note</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
