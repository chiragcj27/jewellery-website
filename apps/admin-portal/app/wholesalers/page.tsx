'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

type WholesalerStatus = 'pending' | 'approved' | 'rejected';

interface Wholesaler {
  _id: string;
  email: string;
  name: string;
  role: string;
  businessName?: string;
  gstNo?: string;
  firmName?: string;
  city?: string;
  visitingCardImage?: string;
  mobNumber?: string;
  gstCertificateFiles?: string[];
  approvalStatus: WholesalerStatus;
  approvedAt?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function WholesalersPage() {
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<WholesalerStatus | ''>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<{ id: string; value: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchWholesalers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.wholesalers.getAll(statusFilter || undefined);
      if (result.success) {
        setWholesalers(result.data ?? []);
      } else {
        setWholesalers([]);
      }
    } catch (error) {
      console.error('Error fetching wholesalers:', error);
      setWholesalers([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchWholesalers();
  }, [fetchWholesalers, statusFilter]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await api.wholesalers.approve(id);
      if (result.success) {
        await fetchWholesalers();
      } else {
        alert(result.error || 'Failed to approve');
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert('Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string, reason?: string) => {
    setActionLoading(id);
    try {
      const result = await api.wholesalers.reject(id, reason);
      if (result.success) {
        setRejectReason(null);
        await fetchWholesalers();
      } else {
        alert(result.error || 'Failed to reject');
      }
    } catch (error) {
      console.error('Reject error:', error);
      alert('Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
            >
              ← Back to Admin
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Wholesaler Accounts</h1>
            <p className="mt-1 text-sm text-gray-600">
              Review and approve business (wholesaler) signups. Approved accounts can sign in and see trade pricing.
            </p>
          </div>
        </div>

        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {(['pending', 'approved', 'rejected', ''] as const).map((s) => (
            <button
              key={s || 'all'}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                statusFilter === s
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {s === 'pending' ? 'Pending' : s === 'approved' ? 'Approved' : s === 'rejected' ? 'Rejected' : 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Loading…
          </div>
        ) : wholesalers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No wholesaler accounts found for this filter.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name / Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    {statusFilter === 'pending' && (
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {wholesalers.map((w) => (
                    <tr key={w._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{w.name}</div>
                        <div className="text-sm text-gray-500">{w.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{w.firmName || w.businessName || '—'}</div>
                        {w.city && <div className="text-xs text-gray-500">{w.city}</div>}
                        {w.mobNumber && <div className="text-xs text-gray-500">{w.mobNumber}</div>}
                        {w.gstNo && <div className="text-xs text-gray-500">GST: {w.gstNo}</div>}
                        {w.visitingCardImage && (
                          <a
                            href={w.visitingCardImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                          >
                            Visiting card
                          </a>
                        )}
                        {w.gstCertificateFiles && w.gstCertificateFiles.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            GST cert(s):{' '}
                            {w.gstCertificateFiles.map((url, i) => (
                              <span key={i}>
                                {i > 0 && ', '}
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {i + 1}
                                </a>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            w.approvalStatus === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : w.approvalStatus === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {w.approvalStatus}
                        </span>
                        {w.rejectedReason && (
                          <div className="text-xs text-gray-500 mt-1">{w.rejectedReason}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(w.createdAt)}
                      </td>
                      {statusFilter === 'pending' && (
                        <td className="px-4 py-3 text-right">
                          {rejectReason?.id === w._id ? (
                            <div className="flex flex-col items-end gap-2">
                              <input
                                type="text"
                                placeholder="Rejection reason (optional)"
                                value={rejectReason.value}
                                onChange={(e) =>
                                  setRejectReason({ id: w._id, value: e.target.value })
                                }
                                className="text-sm border border-gray-300 rounded px-2 py-1 w-48"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleReject(w._id, rejectReason.value)}
                                  disabled={actionLoading === w._id}
                                  className="text-sm px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                >
                                  {actionLoading === w._id ? '…' : 'Reject'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectReason(null)}
                                  className="text-sm px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => handleApprove(w._id)}
                                disabled={actionLoading !== null}
                                className="text-sm px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                {actionLoading === w._id ? '…' : 'Approve'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectReason({ id: w._id, value: '' })}
                                disabled={actionLoading !== null}
                                className="text-sm px-3 py-1.5 border border-red-300 text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All wholesaler details section */}
        {!loading && wholesalers.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                All wholesaler details
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Expand a row to see every field for that wholesaler
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {wholesalers.map((w) => (
                <div key={w._id} className="border-b border-gray-200 last:border-0">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === w._id ? null : w._id)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{w.name}</span>
                    <span className="text-sm text-gray-500">{w.email}</span>
                    <span className="text-gray-400">
                      {expandedId === w._id ? '▼' : '▶'}
                    </span>
                  </button>
                  {expandedId === w._id && (
                    <div className="px-4 pb-4 pt-0 bg-gray-50/70">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 text-sm">
                        <div>
                          <dt className="text-gray-500">ID</dt>
                          <dd className="font-mono text-gray-900 break-all">{w._id}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Email</dt>
                          <dd className="text-gray-900">{w.email}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Name</dt>
                          <dd className="text-gray-900">{w.name}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Role</dt>
                          <dd className="text-gray-900">{w.role}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Business name</dt>
                          <dd className="text-gray-900">{w.businessName ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Firm name</dt>
                          <dd className="text-gray-900">{w.firmName ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">GST number</dt>
                          <dd className="text-gray-900">{w.gstNo ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">City</dt>
                          <dd className="text-gray-900">{w.city ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Mobile number</dt>
                          <dd className="text-gray-900">{w.mobNumber ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Approval status</dt>
                          <dd>
                            <span
                              className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                w.approvalStatus === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : w.approvalStatus === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {w.approvalStatus}
                            </span>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Approved at</dt>
                          <dd className="text-gray-900">
                            {w.approvedAt ? formatDate(w.approvedAt) : '—'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Rejected at</dt>
                          <dd className="text-gray-900">
                            {w.rejectedAt ? formatDate(w.rejectedAt) : '—'}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-gray-500">Rejection reason</dt>
                          <dd className="text-gray-900">{w.rejectedReason ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Created at</dt>
                          <dd className="text-gray-900">{formatDate(w.createdAt)}</dd>
                        </div>
                        {w.updatedAt && (
                          <div>
                            <dt className="text-gray-500">Updated at</dt>
                            <dd className="text-gray-900">{formatDate(w.updatedAt)}</dd>
                          </div>
                        )}
                        {w.visitingCardImage && (
                          <div className="sm:col-span-2">
                            <dt className="text-gray-500">Visiting card</dt>
                            <dd>
                              <a
                                href={w.visitingCardImage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View visiting card image
                              </a>
                            </dd>
                          </div>
                        )}
                        {w.gstCertificateFiles && w.gstCertificateFiles.length > 0 && (
                          <div className="sm:col-span-2 lg:col-span-3">
                            <dt className="text-gray-500">GST certificate files</dt>
                            <dd className="mt-1 flex flex-wrap gap-2">
                              {w.gstCertificateFiles.map((url, i) => (
                                <a
                                  key={i}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-sm"
                                >
                                  Certificate {i + 1}
                                </a>
                              ))}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
