import React, { useState, useEffect, useCallback, useRef } from 'react';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import TrashBin from './components/TrashBin';
import Toolbar from './components/Toolbar';
import { subscribeToNotes, createNote, updateNote, softDeleteNote } from './firebase';
import { getUserColor, getUserInitial } from './userColor';
import { getDisplayTitle } from './autoTitle';
import './App.css';

function getUsername() {
  return localStorage.getItem('shared-notes-username');
}

function getTheme() {
  return localStorage.getItem('shared-notes-theme') || 'light';
}

function getLastActiveNoteId() {
  return localStorage.getItem('shared-notes-active-note');
}

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(getLastActiveNoteId);
  const [showTrash, setShowTrash] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [username, setUsername] = useState(getUsername);
  const [usernameInput, setUsernameInput] = useState('');
  const [theme, setTheme] = useState(getTheme);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth <= 768);
  const [notesLoaded, setNotesLoaded] = useState(false);

  const userColor = getUserColor(username);
  const touchStartRef = useRef(null);
  const touchStartYRef = useRef(null);

  // Swipe gesture handling
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (touchStartRef.current === null) return;
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current;
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
      const minSwipe = 60;

      // Only trigger if horizontal swipe is dominant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipe) {
        if (deltaX > 0 && touchStartRef.current < 50) {
          // Swipe right from left edge → open sidebar
          setSidebarOpen(true);
        } else if (deltaX < 0 && sidebarOpen) {
          // Swipe left while sidebar open → close sidebar
          setSidebarOpen(false);
        }
      }
      touchStartRef.current = null;
      touchStartYRef.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sidebarOpen]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('shared-notes-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSetUsername = () => {
    const trimmed = usernameInput.trim();
    if (trimmed) {
      localStorage.setItem('shared-notes-username', trimmed);
      setUsername(trimmed);
    }
  };

  // Persist active note selection to localStorage
  useEffect(() => {
    if (activeNoteId) {
      localStorage.setItem('shared-notes-active-note', activeNoteId);
    } else {
      localStorage.removeItem('shared-notes-active-note');
    }
  }, [activeNoteId]);

  useEffect(() => {
    const unsubscribe = subscribeToNotes((allNotes) => {
      setNotes(allNotes);
      setNotesLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  const activeNotes = notes.filter(n => !n.deleted).sort((a, b) => b.updatedAt - a.updatedAt);
  const trashedNotes = notes.filter(n => n.deleted).sort((a, b) => b.deletedAt - a.deletedAt);

  // Restore or auto-select a note once notes have loaded
  useEffect(() => {
    if (!notesLoaded || activeNotes.length === 0) return;

    if (activeNoteId) {
      // Validate that the saved note still exists and isn't deleted
      const note = notes.find(n => n.id === activeNoteId);
      if (!note || note.deleted) {
        setActiveNoteId(activeNotes[0].id);
      }
    } else if (!showTrash) {
      // No saved note — default to the most recently updated note
      setActiveNoteId(activeNotes[0].id);
    }
  }, [activeNoteId, notes, notesLoaded, activeNotes, showTrash]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const handleCreateNote = useCallback(() => {
    const id = createNote(username);
    setActiveNoteId(id);
    setShowTrash(false);
    setSidebarOpen(false);
  }, [username]);

  const handleSelectNote = useCallback((id) => {
    setActiveNoteId(id);
    setShowTrash(false);
    setSidebarOpen(false);
  }, []);

  const handleDeleteNote = useCallback((id) => {
    softDeleteNote(id);
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  }, [activeNoteId]);

  const handleUpdateNote = useCallback((id, updates) => {
    setSaveStatus('saving');
    updateNote(id, { ...updates, lastEditedBy: username }).then(() => {
      setSaveStatus('saved');
    });
  }, [username]);

  // Show username prompt if no username set
  if (!username) {
    return (
      <div className="username-modal-overlay">
        <div className="username-modal">
          <h2>Welcome to Shared Notes</h2>
          <p>Enter your name so others can see who made changes</p>
          <input
            type="text"
            placeholder="Your name..."
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSetUsername()}
            autoFocus
          />
          <button onClick={handleSetUsername} disabled={!usernameInput.trim()}>
            Get Started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>Shared Notes</h1>
          <div className="sidebar-header-actions">
            <button className="btn-theme" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              {theme === 'light' ? '\u263E' : '\u2600'}
            </button>
            <button className="btn-new" onClick={handleCreateNote} title="New Note">+</button>
          </div>
        </div>
        <div className="sidebar-user">
          <div className="user-avatar" style={{ background: userColor.bg }}>
            {getUserInitial(username)}
          </div>
          <span>{username}</span>
        </div>
        <NotesList
          notes={activeNotes}
          activeNoteId={activeNoteId}
          onSelect={handleSelectNote}
          onDelete={handleDeleteNote}
        />
        <button
          className={`btn-trash ${showTrash ? 'active' : ''}`}
          onClick={() => { setShowTrash(!showTrash); setActiveNoteId(null); setSidebarOpen(false); }}
        >
          <span className="trash-icon">&#128465;</span>
          Trash ({trashedNotes.length})
        </button>
      </div>
      <div className="main">
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <div className="mobile-topbar-brand">TamDebNotes</div>
          <div className="mobile-topbar-row">
            <button className="btn-hamburger" onClick={() => setSidebarOpen(true)} title="Open menu">
              <span /><span /><span />
            </button>
            <h2 className="mobile-title">
              {showTrash ? 'Trash' : activeNote ? getDisplayTitle(activeNote) : 'Select a note'}
            </h2>
            <button className="btn-new-mobile" onClick={handleCreateNote} title="New Note">+</button>
          </div>
        </div>

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
        ) : !notesLoaded ? (
          <div className="empty-state">
            <h2>Loading...</h2>
          </div>
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
