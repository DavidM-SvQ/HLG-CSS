import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Save, Bold, Italic, Strikethrough, List, ListOrdered } from 'lucide-react';
import { supabase } from '../../../supabase';
import { Skeleton } from "../../ui/Skeleton";

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex gap-1 mb-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-md text-sm ${editor.isActive('bold') ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'}`}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-md text-sm ${editor.isActive('italic') ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'}`}
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded-md text-sm ${editor.isActive('strike') ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'}`}
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-neutral-200 mx-1 self-center" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-md text-sm ${editor.isActive('bulletList') ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'}`}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-md text-sm ${editor.isActive('orderedList') ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'}`}
      >
        <ListOrdered className="w-4 h-4" />
      </button>
    </div>
  );
};

export function TestsIdeasTracker() {
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap max-w-none focus:outline-none min-h-[250px] bg-neutral-50 border border-neutral-200 rounded-lg p-4',
      },
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const fetchIdeas = async () => {
      try {
        const { data, error } = await supabase
          .from("global_files")
          .select("data")
          .eq("id", "ideas_tracker_rich")
          .single();
          
        if (!error && data && data.data) {
          setContent(data.data as string);
          try {
            if (editor && !editor.isDestroyed) {
              editor.commands.setContent(data.data as string);
            }
          } catch (e) {
            console.warn("Could not set editor content", e);
          }
        }
      } catch (err) {
        console.error("Error loading ideas:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchIdeas();
  }, [editor]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");
    try {
      await supabase
        .from("global_files")
        .upsert({
          id: "ideas_tracker_rich",
          data: content,
          updated_at: new Date().toISOString()
        }, { onConflict: "id" });
      setSaveMessage("Guardado");
      setTimeout(() => setSaveMessage(""), 2000);
    } catch (err) {
      console.error("Failed to save ideas to supabase", err);
      setSaveMessage("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 w-full mb-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Bloc de Ideas & Funcionalidades</h2>
          <p className="text-sm text-neutral-500 mt-1">Anota aquí cualquier mejora, estadística o idea para el Fantasy. (Cuadro de texto enriquecido)</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!isLoaded || isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex-shrink-0"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Guardando..." : "Guardar ideas"}
        </button>
      </div>
      
      {saveMessage && (
        <div className="text-xs font-medium text-emerald-600 mb-2">{saveMessage}</div>
      )}

      {!isLoaded ? (
        <div className="h-40 flex items-center justify-center p-4 bg-white border border-neutral-200 rounded-lg">
          <Skeleton className="w-full h-full" />
        </div>
      ) : (
        <div className="mt-2">
          <MenuBar editor={editor} />
          <EditorContent editor={editor} />
        </div>
      )}
    </div>
  );
}

