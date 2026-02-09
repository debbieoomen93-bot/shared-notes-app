import React, { useRef } from 'react';

function Toolbar() {
  const savedRangeRef = useRef(null);

  // Save the current editor selection before a toolbar interaction can steal focus
  const saveCurrentSelection = () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const preventFocusLoss = (e) => {
    saveCurrentSelection();
    e.preventDefault();
  };

  const execFormat = (command) => {
    // Restore selection if focus was lost (mobile touch steals focus before mousedown)
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      const editor = document.querySelector('.editor-content');
      if (editor && (!sel.rangeCount || !editor.contains(sel.anchorNode))) {
        editor.focus();
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
    document.execCommand(command, false, null);
  };

  return (
    <div className="toolbar" onMouseDown={preventFocusLoss} onTouchStart={saveCurrentSelection}>
      <button
        className="toolbar-btn"
        onClick={() => execFormat('bold')}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        className="toolbar-btn"
        onClick={() => execFormat('italic')}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </button>
      <button
        className="toolbar-btn"
        onClick={() => execFormat('underline')}
        title="Underline (Ctrl+U)"
      >
        <u>U</u>
      </button>
      <div className="toolbar-divider" />
      <button
        className="toolbar-btn"
        onClick={() => execFormat('insertUnorderedList')}
        title="Bullet List"
      >
        &#8226; List
      </button>
      <button
        className="toolbar-btn"
        onClick={() => execFormat('insertOrderedList')}
        title="Numbered List"
      >
        1. List
      </button>
      <div className="toolbar-divider" />
      <button
        className="toolbar-btn"
        onClick={() => execFormat('strikeThrough')}
        title="Strikethrough"
      >
        <s>S</s>
      </button>
    </div>
  );
}

export default Toolbar;
