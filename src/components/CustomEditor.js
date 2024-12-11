import React, { useState } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";

// Custom inline styles
const styleMap = {
  RED: { color: "red" },
  UNDERLINE: { textDecoration: "underline" },
};

const LOCAL_STORAGE_KEY = "editorContent";

const CustomEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedContent) {
      try {
        const contentStates = JSON.parse(savedContent); 
        const combinedContent = contentStates.reduce((acc, rawContent) => {
          const contentState = convertFromRaw(rawContent);
          return acc.merge({ blockMap: acc.getBlockMap().concat(contentState.getBlockMap()) });
        }, EditorState.createEmpty().getCurrentContent());

        return EditorState.createWithContent(combinedContent);
      } catch (e) {
        console.error("Failed to load saved content:", e);
        return EditorState.createEmpty();
      }
    }
    return EditorState.createEmpty();
  });

  // Save content to localStorage and clear the editor
  const saveContent = () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);

    const savedContent = localStorage.getItem(LOCAL_STORAGE_KEY);
    let contentStates = [];

    if (savedContent) {
      try {
        contentStates = JSON.parse(savedContent);
        if (!Array.isArray(contentStates)) {
          contentStates = []; // Reset if it's not an array
        }
      } catch (e) {
        console.error("Failed to parse saved content:", e);
        contentStates = []; // Reset if there's an error with the stored data
      }
    }

    // Add the new content to the saved content array
    contentStates.push(rawContent);

    // Save the updated array to localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contentStates));

    alert("Content saved successfully!");
    setEditorState(EditorState.createEmpty()); // Clear the editor
  };

  // Delete all content from localStorage and clear the editor
  const deleteContent = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setEditorState(EditorState.createEmpty()); // Clear the editor
    alert("All content deleted successfully!");
  };

  // Handle special triggers like #, *, **, ***
  const handleBeforeInput = (chars, state) => {
    const selection = state.getSelection();
    const content = state.getCurrentContent();
    const blockKey = selection.getStartKey();
    const blockText = content.getBlockForKey(blockKey).getText();

    if (chars === " ") {
      if (blockText === "#") {
        return transformBlockType(state, "header-one");
      } else if (blockText === "*") {
        return transformInlineStyle(state, "BOLD");
      } else if (blockText === "**") {
        return transformInlineStyle(state, "RED");
      } else if (blockText === "***") {
        return transformInlineStyle(state, "UNDERLINE");
      }
    }
    return "not-handled";
  };

  const transformBlockType = (state, blockType) => {
    const newContentState = Modifier.replaceText(
      state.getCurrentContent(),
      state.getSelection().merge({ anchorOffset: 0 }),
      "" // Remove the trigger
    );
    const newState = EditorState.push(state, newContentState, "remove-range");
    setEditorState(RichUtils.toggleBlockType(newState, blockType));
    return "handled";
  };

  const transformInlineStyle = (state, style) => {
    const newContentState = Modifier.replaceText(
      state.getCurrentContent(),
      state.getSelection().merge({ anchorOffset: 0 }),
      "" 
    );
    const newState = EditorState.push(state, newContentState, "remove-range");
    setEditorState(RichUtils.toggleInlineStyle(newState, style));
    return "handled";
  };

  const handleKeyCommand = (command, state) => {
    const newState = RichUtils.handleKeyCommand(state, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  return (
    <div style={{ margin: "20px" }}>
      <h1>Demo Editor</h1>
      <button onClick={saveContent} style={{ marginBottom: "10px", marginRight: "10px" }}>
        Save
      </button>
      <button onClick={deleteContent} style={{ marginBottom: "10px" }}>
        Delete All Content
      </button>
      <div
        style={{
          border: "1px solid #ccc",
          minHeight: "200px",
          padding: "10px",
        }}
      >
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
          customStyleMap={styleMap}
        />
      </div>
    </div>
  );
};

export default CustomEditor;
