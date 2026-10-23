import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Users,
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Check,
  Ban,
  Filter,
} from 'lucide-react';

export const AdminDashboardScreen: React.FC = () => {
  const {
    currentUser,
    users,
    matches,
    reports,
    verifications,
    adminResolveReport,
    adminReviewVerification,
    adminToggleUserStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'reports' | 'verifications' | 'directory'>('reports');
  const [searchDirectory, setSearchDirectory] = useState('');

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#F8F9FA] text-[#2D3436]">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-lg font-bold text-[#2D3436] mb-1">Restricted Access</h2>
        <p className="text-xs text-[#636E72] max-w-xs">
          The Admin Moderation Dashboard is reserved for Trust & Safety personnel.
        </p>
      </div>
    );
  }

  const pendingReports = reports.filter((r) => r.status === 'pending');
  const pendingVerifications = verifications.filter((v) => v.status === 'pending');

  const filteredUsers = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(searchDirectory.toLowerCase()) ||
      u.occupation.toLowerCase().includes(searchDirectory.toLowerCase()) ||
      u.location.city.toLowerCase().includes(searchDirectory.toLowerCase())
    );
  });

  return (
    <div className="min-h-[calc(100vh-8rem)] py-6 px-4 max-w-4xl mx-auto flex flex-col pb-16 bg-[#F8F9FA] text-[#2D3436]">
      {/* Top Console Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-[11px] font-bold text-[#6C5CE7] tracking-wider uppercase">
            Trust & Safety Operations
          </span>
          <h1 className="text-2xl font-extrabold text-[#2D3436] mt-0.5">Admin Moderation Console</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#636E72]">Authenticated as:</span>
          <span className="text-xs font-semibold text-[#2D3436] bg-white border border-[#E9ECEF] px-2.5 py-1 rounded-lg shadow-sm">
            {currentUser.name}
          </span>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-white border border-[#E9ECEF] shadow-[0_8px_30px_rgba(108,92,231,0.06)]">
          <span className="text-xs text-[#636E72]">Registered Users</span>
          <p className="text-2xl font-extrabold text-[#2D3436] tabular-nums mt-1">{users.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E9ECEF] shadow-[0_8px_30px_rgba(108,92,231,0.06)]">
          <span className="text-xs text-[#636E72]">Mutual Matches</span>
          <p className="text-2xl font-extrabold text-[#00B894] tabular-nums mt-1">{matches.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E9ECEF] shadow-[0_8px_30px_rgba(108,92,231,0.06)]">
          <span className="text-xs text-[#636E72]">Open Reports</span>
          <p className="text-2xl font-extrabold text-[#FD79A8] tabular-nums mt-1">
            {pendingReports.length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E9ECEF] shadow-[0_8px_30px_rgba(108,92,231,0.06)]">
          <span className="text-xs text-[#636E72]">Pending Verifications</span>
          <p className="text-2xl font-extrabold text-[#6C5CE7] tabular-nums mt-1">
            {pendingVerifications.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#E9ECEF]/70 p-1 rounded-2xl mb-6 max-w-md">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'reports' ? 'bg-[#6C5CE7] text-white shadow-sm' : 'text-[#636E72] hover:text-[#2D3436]'
          }`}
        >
          Reports ({pendingReports.length})
        </button>
        <button
          onClick={() => setActiveTab('verifications')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'verifications' ? 'bg-[#6C5CE7] text-white shadow-sm' : 'text-[#636E72] hover:text-[#2D3436]'
          }`}
        >
          Verifications ({pendingVerifications.length})
        </button>
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'directory' ? 'bg-[#6C5CE7] text-white shadow-sm' : 'text-[#636E72] hover:text-[#2D3436]'
          }`}
        >
          Users Directory
        </button>
      </div>

      {/* Tab 1: Reports Queue */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.length > 0 ? (
            reports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-2xl bg-white border border-[#E9ECEF] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_8px_30px_rgba(108,92,231,0.06)]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#2D3436]">
                      Reported: <span className="text-red-500">{report.reportedUserName}</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                      {report.reason.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-[#636E72] tabular-nums">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-[#2D3436]">
                    <span className="text-[#636E72]">Reported by:</span> {report.reporterName}
                  </p>
                  <p className="text-xs text-[#636E72] italic">"{report.description}"</p>

                  {report.status !== 'pending' && (
                    <div className="text-[11px] text-[#00B894] font-medium pt-1">
                      Status: {report.status} ({report.actionTaken})
                    </div>
                  )}
                </div>

                {report.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => adminResolveReport(report.id, 'dismiss')}
                      className="px-3 py-1.5 rounded-lg bg-[#F8F9FA] hover:bg-[#E9ECEF] text-xs font-medium text-[#636E72] border border-[#E9ECEF]"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => adminResolveReport(report.id, 'warn')}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 text-xs font-medium"
                    >
                      Warn
                    </button>
                    <button
                      onClick={() => adminResolveReport(report.id, 'suspend_user')}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-sm"
                    >
                      Suspend User
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E9ECEF] shadow-sm">
              <CheckCircle className="w-8 h-8 text-[#00B894] mx-auto mb-2" />
              <p className="text-xs text-[#636E72]">All reports have been reviewed!</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Verifications Queue */}
      {activeTab === 'verifications' && (
        <div className="space-y-3">
          {verifications.length > 0 ? (
            verifications.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-white border border-[#E9ECEF] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_8px_30px_rgba(108,92,231,0.06)]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#2D3436]">{req.userName}</span>
                    <span className="text-xs text-[#636E72] tabular-nums">Age: {req.userAge}</span>
                    <span className="text-[10px] text-[#636E72] tabular-nums">
                      {new Date(req.submittedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#2D3436]">
                    <span className="text-[#636E72]">Pose challenge:</span> {req.selfiePose}
                  </p>
                  <p className="text-[11px] text-[#00B894]">
                    Status: <span className="font-semibold">{req.status}</span>
                  </p>
                </div>

                {req.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => adminReviewVerification(req.id, false)}
                      className="px-3 py-1.5 rounded-lg bg-[#F8F9FA] hover:bg-[#E9ECEF] border border-[#E9ECEF] text-xs text-[#636E72]"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => adminReviewVerification(req.id, true)}
                      className="px-4 py-1.5 rounded-lg bg-[#00B894] hover:bg-[#00a884] text-white font-bold text-xs shadow-md"
                    >
                      Approve & Verify
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E9ECEF] shadow-sm">
              <CheckCircle className="w-8 h-8 text-[#00B894] mx-auto mb-2" />
              <p className="text-xs text-[#636E72]">No pending verification requests</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Users Directory */}
      {activeTab === 'directory' && (
        <div>
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-[#636E72] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchDirectory}
              onChange={(e) => setSearchDirectory(e.target.value)}
              placeholder="Filter users by name, city, occupation..."
              className="w-full bg-white border border-[#E9ECEF] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2D3436] placeholder-[#636E72] focus:outline-none focus:border-[#6C5CE7] shadow-sm"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E9ECEF] bg-white shadow-[0_8px_30px_rgba(108,92,231,0.06)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-[#636E72] uppercase text-[10px] tracking-wider border-b border-[#E9ECEF]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Age / City</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9ECEF]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="py-3 px-4 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#E9ECEF] shrink-0">
                        <img
                          src={u.photos[0]}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-[#2D3436]">{u.name}</div>
                        <div className="text-[10px] text-[#636E72]">{u.occupation}</div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="tabular-nums text-[#2D3436]">{u.age} yrs</div>
                      <div className="text-[10px] text-[#636E72]">{u.location.city}</div>
                    </td>

                    <td className="py-3 px-4">
                      {u.isVerified ? (
                        <span className="text-[#00B894] font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-[#636E72]">Unverified</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          u.accountStatus === 'active'
                            ? 'bg-[#00B894]/15 text-[#00B894]'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {u.accountStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => adminToggleUserStatus(u.id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                          u.accountStatus === 'active'
                            ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                            : 'bg-[#00B894]/15 hover:bg-[#00B894]/25 text-[#00B894] border border-[#00B894]/30'
                        }`}
                      >
                        {u.accountStatus === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
