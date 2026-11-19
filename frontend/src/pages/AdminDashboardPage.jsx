import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  ShieldCheck, Users, BookOpen, GraduationCap, Award, 
  CheckCircle2, XCircle, RefreshCw, UserCheck, AlertTriangle 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/reports'),
      ]);
      setUsers(uRes.data || []);
      setReports(rRes.data || null);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateStatus = async (userId, targetStatus) => {
    setActionLoading(userId);
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: targetStatus });
      setMessage(`User status successfully changed to ${targetStatus}`);
      fetchAdminData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Operation failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-purple-600" />
            System Administration Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global governance: verify instructor credentials, oversee accounts, and inspect platform metrics.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Reports Metrics Cards */}
      {reports && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Accounts</div>
            <div className="text-2xl font-black text-slate-900">{reports.users_count.total}</div>
            <div className="text-[11px] text-slate-500">
              {reports.users_count.students} Students • {reports.users_count.instructors} Instructors
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Courses</div>
            <div className="text-2xl font-black text-indigo-600">{reports.courses_count.total}</div>
            <div className="text-[11px] text-slate-500">
              {reports.courses_count.published} Active Published
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registrations</div>
            <div className="text-2xl font-black text-emerald-600">
              {reports.academic_metrics.total_enrollments}
            </div>
            <div className="text-[11px] text-slate-500">Active Course Enrollments</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submissions</div>
            <div className="text-2xl font-black text-purple-600">
              {reports.academic_metrics.total_submissions}
            </div>
            <div className="text-[11px] text-slate-500">
              {reports.academic_metrics.graded_submissions} Graded by Faculty
            </div>
          </div>
        </div>
      )}

      {/* User Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">User Account Oversight</h2>
          <p className="text-xs text-slate-500">Approve pending instructor applications or deactivate accounts.</p>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800">{u.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'ADMIN'
                        ? 'bg-purple-50 text-purple-700'
                        : u.role === 'INSTRUCTOR'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      u.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700'
                        : u.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700 animate-pulse'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.role !== 'ADMIN' && (
                      <div className="flex items-center justify-end gap-1.5">
                        {u.status !== 'ACTIVE' && (
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'ACTIVE')}
                            disabled={actionLoading === u.id}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold transition"
                          >
                            Approve / Activate
                          </button>
                        )}
                        {u.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'DEACTIVATED')}
                            disabled={actionLoading === u.id}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-semibold transition"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
