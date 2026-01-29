'use client';

import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold, Italic, Underline, Strikethrough,
    Heading1, Heading2, Heading3, Heading4,
    List, ListOrdered, Quote, Code, Pilcrow,
    Undo, Redo, TableIcon, Link as LinkIcon, Image as ImageIcon
} from 'lucide-react';
import { useCallback, useState } from 'react';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { uploadImage } from '@/firebase/storage';

interface EditorToolbarProps {
  editor: any;
}

const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);
  
  if (!editor) {
    return null;
  }

  const handleImageInsert = async () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
    setIsImageModalOpen(false);
    setImageUrl("");
  };

  const handleImageUpload = async () => {
      if (!imageFile) {
          toast({ variant: 'destructive', title: "Chưa chọn file", description: "Vui lòng chọn một file ảnh để tải lên."});
          return;
      }

      setIsUploading(true);
      try {
          const downloadURL = await uploadImage(imageFile, 'content_images');
          editor.chain().focus().setImage({ src: downloadURL }).run();
          setIsImageModalOpen(false);
          setImageFile(null);
      } catch (error: any) {
           toast({ variant: 'destructive', title: "Lỗi tải ảnh lên", description: error.message || "Đã có lỗi xảy ra khi tải ảnh lên."});
      } finally {
          setIsUploading(false);
      }
  }

  return (
    <>
      <div className="border border-input rounded-t-md p-1 flex flex-wrap items-center gap-1 bg-muted/50">
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}><Bold /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}><Italic /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''}><Underline /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}><Strikethrough /></button>
          
          <div className="h-6 w-px bg-border mx-1"></div>

          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}><Heading1 /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}><Heading2 /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}><Heading3 /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}><Heading4 /></button>
          
           <div className="h-6 w-px bg-border mx-1"></div>

          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}><List /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''}><ListOrdered /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''}><Quote /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'is-active' : ''}><Code /></button>
          
           <div className="h-6 w-px bg-border mx-1"></div>

           <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} >
              <TableIcon />
          </button>
          <button type="button" onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''}>
             <LinkIcon />
          </button>
           <button type="button" onClick={() => setIsImageModalOpen(true)}>
             <ImageIcon />
          </button>
          
           <div className="h-6 w-px bg-border mx-1"></div>

          <button type="button" onClick={() => editor.chain().focus().undo().run()}><Undo /></button>
          <button type="button" onClick={() => editor.chain().focus().redo().run()}><Redo /></button>
      </div>

       <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chèn Ảnh</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="upload">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Tải lên</TabsTrigger>
              <TabsTrigger value="url">Từ URL</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="py-4">
                <DialogDescription>Chọn một ảnh từ máy tính của bạn để tải lên và chèn vào bài viết.</DialogDescription>
                <div className="mt-4">
                    <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                </div>
            </TabsContent>
            <TabsContent value="url" className="py-4">
                 <DialogDescription>Dán đường dẫn URL của ảnh bạn muốn chèn vào.</DialogDescription>
                 <div className="mt-4">
                    <Input placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                 </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsImageModalOpen(false)}>Hủy</Button>
            <Button type="button" onClick={imageUrl ? handleImageInsert : handleImageUpload} disabled={isUploading}>
              {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải lên</> : 'Chèn ảnh'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};


interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
          underline: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        inline: true,
        allowBase64: true, // Keep this true for pasting, but uploads will be URLs
      })
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none min-h-[250px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const openImageDialog = () => {
    const toolbar = document.querySelector('[data-testid="toolbar-image-button"]');
    if (toolbar) {
      (toolbar as HTMLButtonElement).click();
    }
  }

  return (
    <div className="border border-input rounded-b-md">
      <EditorToolbar editor={editor} />
      
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100 }}
        className="flex items-center space-x-1 rounded-md border bg-background p-1 shadow-md"
      >
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}><Bold className="h-4 w-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}><Italic className="h-4 w-4" /></button>
        <button type="button" onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''}><LinkIcon className="h-4 w-4"/></button>
      </BubbleMenu>

      <FloatingMenu
        editor={editor}
        tippyOptions={{ duration: 100 }}
        className="flex flex-col space-y-1 rounded-md border bg-background p-2 shadow-md"
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`flex items-center gap-2 p-1 rounded-sm hover:bg-muted ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
        >
          <Heading2 className="h-4 w-4" />
          <span>Tiêu đề 2</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`flex items-center gap-2 p-1 rounded-sm hover:bg-muted ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
        >
          <Heading3 className="h-4 w-4" />
          <span>Tiêu đề 3</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`flex items-center gap-2 p-1 rounded-sm hover:bg-muted ${editor.isActive('bulletList') ? 'is-active' : ''}`}
        >
          <List className="h-4 w-4" />
          <span>Danh sách</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className="flex items-center gap-2 p-1 rounded-sm hover:bg-muted"
        >
          <TableIcon className="h-4 w-4" />
          <span>Bảng</span>
        </button>
        <button
          type="button"
          onClick={openImageDialog}
          className="flex items-center gap-2 p-1 rounded-sm hover:bg-muted"
        >
          <ImageIcon className="h-4 w-4" />
          <span>Ảnh</span>
        </button>
      </FloatingMenu>

      <EditorContent editor={editor} />

      <style jsx global>{`
        .ProseMirror {
            min-height: 250px;
        }
        .ProseMirror:focus {
            outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: #adb5bd;
            pointer-events: none;
            height: 0;
        }
        .ProseMirror img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
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
        button.is-active {
            background-color: hsl(var(--accent));
            color: hsl(var(--accent-foreground));
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
