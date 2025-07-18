'use client';

import { useEffect, useState } from 'react';

type Note = {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
};

const getUserId = (): string => {
  if (typeof window === 'undefined') return '';
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('userId', userId);
  }
  return userId;
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    setUserId(getUserId());
  }, []);

  useEffect(() => {
    if (userId) fetchNotes();
    // eslint-disable-next-line
  }, [userId]);

  const fetchNotes = async () => {
    setLoading(true);
    const res = await fetch('/api/notes?userId=' + userId);
    const notes = await res.json();
    setNotes(notes);
    setLoading(false);
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, content }),
    });
    setContent('');
    fetchNotes();
  };

  const deleteNote = async (id: number) => {
    await fetch('/api/notes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, id }),
    });
    fetchNotes();
  };

  return (
    <main className="container">
      <h1>📝 Simple Notepad</h1>
      <form onSubmit={addNote}>
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write a note..."
        />
        <button type="submit">Add</button>
      </form>
      <div className="notes">
        {loading ? (
          <p>Loading...</p>
        ) : notes.length === 0 ? (
          <p>No notes yet.</p>
        ) : (
          notes.map(note => (
            <div className="note" key={note.id}>
              <span>{note.content}</span>
              <button onClick={() => deleteNote(note.id)}>🗑️</button>
            </div>
          ))
        )}
      </div>
      <style jsx global>{`
        body {
          background: #18191a;
          color: #f5f6fa;
          font-family: 'Inter', sans-serif;
          margin: 0;
          min-height: 100vh;
        }
      `}</style>
      <style jsx>{`
        .container {
          max-width: 500px;
          margin: 40px auto;
          padding: 2rem;
          background: #23272f;
          border-radius: 12px;
          box-shadow: 0 4px 32px #0007;
        }
        h1 {
          text-align: center;
          color: #fae365;
        }
        form {
          display: flex;
          margin-bottom: 1.5rem;
        }
        input {
          flex: 1;
          padding: 0.75rem;
          background: #222;
          color: #fff;
          border: none;
          border-radius: 6px 0 0 6px;
        }
        input:focus {
          outline: none;
          background: #252a34;
        }
        button {
          background: #fae365;
          color: #23272f;
          border: none;
          padding: 0 1.5rem;
          border-radius: 0 6px 6px 0;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }
        button:hover {
          background: #fff176;
        }
        .notes {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .note {
          background: #222;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
        }
        .note button {
          background: #f66;
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 2rem;
          height: 2rem;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .note button:hover {
          background: #ff1744;
        }
      `}</style>
    </main>
  );
}
