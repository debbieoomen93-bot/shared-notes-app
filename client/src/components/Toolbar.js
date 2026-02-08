import React from 'react';

function Toolbar() {
  const execFormat = (command) => {
    document.execCommand(command, false, null);
  };

  return (
    <div className="toolbar">
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
