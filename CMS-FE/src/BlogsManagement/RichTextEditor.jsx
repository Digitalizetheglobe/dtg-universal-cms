import React, { useState, useRef, useEffect } from 'react';
import { 
  FiBold, 
  FiItalic, 
  FiUnderline, 
  FiList, 
  FiAlignLeft, 
  FiAlignCenter, 
  FiAlignRight,
  FiType,
  FiLink,
  FiImage,
  FiCode,
  FiMessageSquare
} from 'react-icons/fi';

const RichTextEditor = ({ value, onChange, placeholder = "Write your content here..." }) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleInput();
  };

  const handleInput = () => {
    if (onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertHTML = (html) => {
    document.execCommand('insertHTML', false, html);
    editorRef.current.focus();
    handleInput();
  };

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      insertHTML(`<img src="${url}" alt="Image" style="max-width: 100%; height: auto;" />`);
    }
  };

  const toolbarButtons = [
    {
      icon: <FiBold />,
      title: 'Bold',
      command: 'bold',
      shortcut: 'Ctrl+B'
    },
    {
      icon: <FiItalic />,
      title: 'Italic',
      command: 'italic',
      shortcut: 'Ctrl+I'
    },
    {
      icon: <FiUnderline />,
      title: 'Underline',
      command: 'underline',
      shortcut: 'Ctrl+U'
    },
    { separator: true },
    {
      icon: <FiType />,
      title: 'Heading',
      command: 'formatBlock',
      value: '<h2>',
      shortcut: 'Ctrl+H'
    },
    {
      icon: <FiList />,
      title: 'Bullet List',
      command: 'insertUnorderedList',
      shortcut: 'Ctrl+L'
    },
    {
      icon: <FiMessageSquare />,
      title: 'Quote',
      command: 'formatBlock',
      value: '<blockquote>',
      shortcut: 'Ctrl+Q'
    },
    { separator: true },
    {
      icon: <FiAlignLeft />,
      title: 'Align Left',
      command: 'justifyLeft'
    },
    {
      icon: <FiAlignCenter />,
      title: 'Align Center',
      command: 'justifyCenter'
    },
    {
      icon: <FiAlignRight />,
      title: 'Align Right',
      command: 'justifyRight'
    },
    { separator: true },
    {
      icon: <FiLink />,
      title: 'Insert Link',
      action: addLink
    },
    {
      icon: <FiImage />,
      title: 'Insert Image',
      action: addImage
    },
    {
      icon: <FiCode />,
      title: 'Code',
      command: 'formatBlock',
      value: '<pre>'
    }
  ];

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="bg-gray-50 border border-gray-300 rounded-t-lg p-2 flex flex-wrap items-center gap-1">
        {toolbarButtons.map((button, index) => {
          if (button.separator) {
            return (
              <div key={index} className="w-px h-6 bg-gray-300 mx-1"></div>
            );
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => button.action ? button.action() : execCommand(button.command, button.value)}
              title={`${button.title} (${button.shortcut})`}
              className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700 hover:text-gray-900"
            >
              {button.icon}
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          min-h-[200px] p-4 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          ${isFocused ? 'bg-white' : 'bg-white'}
        `}
        style={{
          fontFamily: 'inherit',
          fontSize: '14px',
          lineHeight: '1.6'
        }}
        data-placeholder={placeholder}
      />

             {/* Formatting Tips */}
       <div className="mt-2 text-xs text-gray-500">
         <p><strong>Formatting Tips:</strong></p>
         <ul className="list-disc list-inside space-y-1 mt-1">
           <li><strong>Bold:</strong> Select text and click Bold button or use Ctrl+B</li>
           <li><strong>Italic:</strong> Select text and click Italic button or use Ctrl+I</li>
           <li><strong>Headings:</strong> Click Heading button to create section titles</li>
           <li><strong>Lists:</strong> Click Bullet List button to create bullet points</li>
           <li><strong>Links:</strong> Select text and click Link button to add URLs</li>
           <li><strong>Images:</strong> Click Image button to insert images</li>
         </ul>
       </div>
    </div>
  );
};

export default RichTextEditor;
