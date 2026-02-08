import React from 'react';

function Toolbar() {
  const execFormat = (command) => {
    document.execCommand(command, false, null);
  };

  // Prevent mousedown from stealing focus away from the contentEditable editor
  const preventFocusLoss = (e) => {
    e.preventDefault();
  };

  return (
    <div className="toolbar">
      <button
        className="toolbar-btn"
        onMouseDown={preventFocusLoss}
        onClick={() => execFormat('bold')}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        className="toolbar-btn"
        onMouseDown={preventFocusLoss}
        onClick={() => execFormat('italic')}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </button>
      <button
        className="toolbar-btn"
        onMouseDown={preventFocusLoss}
        onClick={() => execFormat('underline')}
        title="Underline (Ctrl+U)"
      >
        <u>U</u>
      </button>
      <div className="toolbar-divider" />
      <button
        className="toolbar-btn"
        onMouseDown={preventFocusLoss}
        onClick={() => execFormat('insertUnorderedList')}
        title="Bullet List"
      >
        &#8226; List
      </button>
      <button
        className="toolbar-btn"
        onMouseDown={preventFocusLoss}
        onClick={() => execFormat('insertOrderedList')}
        title="Numbered List"
      >
        1. List
      </button>
      <div className="toolbar-divider" />
      <button
        className="toolbar-btn"
        onMouseDown={preventFocusLoss}
        onClick={() => execFormat('strikeThrough')}
        title="Strikethrough"
      >
        <s>S</s>
      </button>
    </div>
  );
}

export default Toolbar;
