import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, onValue, update, remove, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDbnNvauscbLYzKT-vFtLqG2DcBu3eQYFE",
  authDomain: "shared-notes-app-948e5.firebaseapp.com",
  databaseURL: "https://shared-notes-app-948e5-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shared-notes-app-948e5",
  storageBucket: "shared-notes-app-948e5.firebasestorage.app",
  messagingSenderId: "821776987521",
  appId: "1:821776987521:web:dc8759b82eea4fe47ca480"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Notes operations
export function subscribeToNotes(callback) {
  const notesRef = ref(db, 'notes');
  return onValue(notesRef, (snapshot) => {
    const data = snapshot.val();
    const notes = [];
    if (data) {
      Object.entries(data).forEach(([id, note]) => {
        notes.push({ id, ...note });
      });
    }
    callback(notes);
  });
}

export function createNote() {
  const notesRef = ref(db, 'notes');
  const newNoteRef = push(notesRef);
  const now = Date.now();
  const note = {
    title: 'Untitled Note',
    content: '',
    createdAt: now,
    updatedAt: now,
    deleted: false,
    deletedAt: null
  };
  set(newNoteRef, note);
  return newNoteRef.key;
}

export function updateNote(noteId, updates) {
  const noteRef = ref(db, `notes/${noteId}`);
  return update(noteRef, {
    ...updates,
    updatedAt: Date.now()
  });
}

export function softDeleteNote(noteId) {
  const noteRef = ref(db, `notes/${noteId}`);
  return update(noteRef, {
    deleted: true,
    deletedAt: Date.now()
  });
}

export function restoreNote(noteId) {
  const noteRef = ref(db, `notes/${noteId}`);
  return update(noteRef, {
    deleted: false,
    deletedAt: null
  });
}

export function permanentlyDeleteNote(noteId) {
  const noteRef = ref(db, `notes/${noteId}`);
  return remove(noteRef);
}

export { db };
