'use client';

import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold, Italic, Underline, Strikethrough,
    Heading1, Heading2, Heading3, Heading4,
    List, ListOrdered, Quote, Code, Pilcrow,
    Undo, Redo, TableIcon, Link as LinkIcon
} from 'lucide-react';
import { useCallback } from 'react';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Link from '@tiptap/extension-link';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const EditorToolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="border border-input rounded-t-md p-1 flex flex-wrap items-center gap-1 bg-muted/50">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}><Bold /></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}><Italic /></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''}><Underline /></button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}><Strikethrough /></button>
        
        <div className="h-6 w-px bg-border mx-1"></div>

        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}><Heading1 /></button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}><Heading2 /></button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}><Heading3 /></button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}><Heading4 /></button>
        
         <div className="h-6 w-px bg-border mx-1"></div>

        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}><List /></button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''}><ListOrdered /></button>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''}><Quote /></button>
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'is-active' : ''}><Code /></button>
        
         <div className="h-6 w-px bg-border mx-1"></div>

         <button
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
            <TableIcon />
        </button>

        <button onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''}>
           <LinkIcon />
        </button>
        
         <div className="h-6 w-px bg-border mx-1"></div>

        <button onClick={() => editor.chain().focus().undo().run()}><Undo /></button>
        <button onClick={() => editor.chain().focus().redo().run()}><Redo /></button>
    </div>
  );
};

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
          underline: false, // Use custom Underline extension
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
      }),
      
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[250px]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border border-input rounded-b-md">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="bubble-menu">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>Bold</button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>Italic</button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}>Strike</button>
        </BubbleMenu>
      )}

      <style jsx global>{`
        .ProseMirror {
            min-height: 250px;
            padding: 0.75rem;
        }
        .ProseMirror:focus {
            outline: none;
        }
        .ProseMirror table {
            border-collapse: collapse;
            margin: 0;
            overflow: hidden;
            table-layout: fixed;
            width: 100%;
        }
        .ProseMirror td, .ProseMirror th {
            border: 2px solid #ced4da;
            box-sizing: border-box;
            min-width: 1em;
            padding: 3px 5px;
            position: relative;
            vertical-align: top;
        }
        .ProseMirror th {
            background-color: #f1f3f5;
            font-weight: bold;
            text-align: left;
        }
        .ProseMirror .selectedCell:after {
            background: rgba(200, 200, 255, 0.4);
            content: "";
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            pointer-events: none;
            position: absolute;
            z-index: 2;
        }
        .ProseMirror .column-resize-handle {
            background-color: #adf;
            bottom: -2px;
            position: absolute;
            right: -2px;
            pointer-events: none;
            top: 0;
            width: 4px;
        }
        .tiptap button {
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            transition: background-color 0.2s;
        }
        .tiptap button.is-active {
            background-color: hsl(var(--primary));
            color: hsl(var(--primary-foreground));
        }
        .bubble-menu {
            display: flex;
            background-color: black;
            padding: 0.2rem;
            border-radius: 0.5rem;
        }
        .bubble-menu button {
            border: none;
            background: none;
            color: #FFF;
            font-size: 0.85rem;
            font-weight: 500;
            padding: 0 0.2rem;
        }
        .bubble-menu button.is-active {
            color: #818cf8;
        }
        .EditorToolbar button {
             padding: 0.25rem;
             margin: 0.125rem;
             border-radius: 4px;
        }
        .EditorToolbar button:hover {
            background-color: hsl(var(--muted));
        }
        .EditorToolbar button.is-active {
            background-color: hsl(var(--accent));
            color: hsl(var(--accent-foreground));
        }
      `}</style>
    </div>
  );
}
