import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Alert from '../../components/Alert';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Users as UsersIcon, Trash2, Shield, User, Search } from 'lucide-react';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load registered users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (targetUser) => {
    if (targetUser.id === currentUser.id) {
      setError('You cannot delete your own active administrator account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${targetUser.name}" (${targetUser.email}) and all their data?`)) {
      return;
    }

    try {
      await adminService.deleteUser(targetUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
      setSuccess(`User "${targetUser.email}" deleted successfully.`);
    } catch (err) {
      setError('Failed to delete user.');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar mode="admin" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto min-w-0 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <UsersIcon className="w-6 h-6 text-indigo-600" />
                <span>Users Management</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                View, audit, and manage all registered candidate and admin accounts.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium"
              />
            </div>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
              Loading user accounts...
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold text-slate-500">
                    <tr>
                      <th className="py-3.5 px-6">User</th>
                      <th className="py-3.5 px-6">Email Address</th>
                      <th className="py-3.5 px-6">System Role</th>
                      <th className="py-3.5 px-6">Date Registered</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{u.name}</span>
                        </td>

                        <td className="py-4 px-6 text-slate-600 font-medium">{u.email}</td>

                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                              u.role === 'ADMIN'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-slate-500">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>

                        <td className="py-4 px-6 text-right">
                          {u.id !== currentUser.id ? (
                            <button
                              onClick={() => handleDelete(u)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Current Admin</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
