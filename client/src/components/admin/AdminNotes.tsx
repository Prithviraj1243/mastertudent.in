import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  subject: string;
  uploader: string;
  status: string;
  downloads: number;
  createdAt: string;
  price: number;
}

export default function AdminNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, searchTerm, statusFilter]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      setError('Failed to load notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = notes;

    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((note) => note.status === statusFilter);
    }

    setFilteredNotes(filtered);
  };

  const handleDelete = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        setNotes(notes.filter((n) => n.id !== noteId));
        setSelectedNote(null);
      } catch (err) {
        setError('Failed to delete note');
      }
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Title', 'Subject', 'Status', 'Downloads', 'Price', 'Created At'],
      ...filteredNotes.map((n) => [
        n.id,
        n.title,
        n.subject,
        n.status,
        n.downloads,
        n.price,
        new Date(n.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes.csv';
    a.click();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'published':
        return <CheckCircle className="text-green-600" size={18} />;
      case 'pending':
      case 'submitted':
        return <Clock className="text-yellow-600" size={18} />;
      default:
        return <AlertCircle className="text-gray-600" size={18} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'pending':
      case 'submitted':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notes Management</h1>
          <p className="text-gray-600 mt-2">Total notes: {notes.length}</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Title</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Subject</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Downloads</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Price</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Created</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => (
                  <tr key={note.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900 line-clamp-2">{note.title}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{note.subject}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(note.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(note.status)}`}>
                          {note.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-900">{note.downloads}</td>
                    <td className="py-4 px-6 text-gray-600">{note.price} coins</td>
                    <td className="py-4 px-6 text-gray-600 text-sm">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedNote(note)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                          title="View details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                          title="Delete note"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No notes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note Details Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedNote.title}</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subject:</span>
                <span className="font-semibold text-gray-900">{selectedNote.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedNote.status)}`}>
                  {selectedNote.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Downloads:</span>
                <span className="font-semibold text-gray-900">{selectedNote.downloads}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold text-gray-900">{selectedNote.price} coins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(selectedNote.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedNote(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
