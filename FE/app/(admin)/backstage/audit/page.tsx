"use client";

import httpClient from "@/core/api/http-client";
import { ChevronDown, Globe, Monitor, Search } from "lucide-react";
import React, { useEffect, useState } from "react";

interface AdminAuditLog {
    id: string;
    admin_id: string;
    action: string;
    resource: string;
    old_value: string | null;
    new_value: string | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

// Maps action verbs to a color so the eye can scan the list quickly
const ACTION_COLOR: Record<string, string> = {
    CREATE: "text-emerald-400",
    UPDATE: "text-amber-400",
    DELETE: "text-red-400",
    BAN: "text-red-400",
    APPROVE: "text-emerald-400",
    REJECT: "text-red-400",
};

function actionColor(action: string) {
    const key = Object.keys(ACTION_COLOR).find((k) => action.toUpperCase().includes(k));
    return key ? ACTION_COLOR[key] : "text-slate-300";
}

function formatValue(value: string | null) {
    if (!value) return null;
    try {
        return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
        return value;
    }
}

export default function AdminAuditLogsPage() {
    const [logs, setLogs] = useState<AdminAuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [query, setQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchLogs = async (cursor?: string | null, searchStr: string = "") => {
        try {
            if (cursor) setLoadingMore(true);
            else setLoading(true);

            const params: any = {};
            if (cursor) params.cursor = cursor;
            if (searchStr) params.search = searchStr;

            const res = await httpClient.get("/api/v1/admin/audit-logs", { params });
            if (res.data?.data) {
                setLogs(prev => cursor ? [...prev, ...res.data.data] : res.data.data);
                setNextCursor(res.data.meta?.next_cursor || null);
                setHasMore(res.data.meta?.has_more || false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs(null, query);
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-100">Nhật ký hoạt động</h1>
                <p className="text-slate-500 text-sm mt-1">Lịch sử thao tác của quản trị viên trên hệ thống.</p>
            </div>

            <div className="relative w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm theo admin, hành động, đối tượng..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-slate-600 transition-colors"
                />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-800/40 border-b border-slate-800 text-xs text-slate-500">
                                <th className="p-3 font-medium w-8" />
                                <th className="p-3 font-medium">Admin</th>
                                <th className="p-3 font-medium">Hành động</th>
                                <th className="p-3 font-medium">Đối tượng</th>
                                <th className="p-3 font-medium">IP</th>
                                <th className="p-3 font-medium">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        Đang tải nhật ký...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        Không tìm thấy bản ghi nào.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => {
                                    const isExpanded = expandedId === log.id;
                                    const hasDetail = log.old_value || log.new_value || log.user_agent;
                                    const oldVal = formatValue(log.old_value);
                                    const newVal = formatValue(log.new_value);

                                    return (
                                        <React.Fragment key={log.id}>
                                            <tr
                                                key={log.id}
                                                onClick={() => hasDetail && setExpandedId(isExpanded ? null : log.id)}
                                                className={`transition-colors ${hasDetail ? "cursor-pointer hover:bg-slate-800/30" : ""}`}
                                            >
                                                <td className="p-3 text-slate-600">
                                                    {hasDetail && (
                                                        <ChevronDown
                                                            size={14}
                                                            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                                        />
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <div className="font-mono text-xs text-slate-300">{log.admin_id.substring(0, 8)}...</div>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`text-xs font-medium ${actionColor(log.action)}`}>{log.action}</span>
                                                </td>
                                                <td className="p-3 text-slate-300">{log.resource}</td>
                                                <td className="p-3 text-slate-500 font-mono text-xs">{log.ip_address || "—"}</td>
                                                <td className="p-3 text-slate-500">
                                                    {new Date(log.created_at).toLocaleString("vi-VN", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: false,
                                                    })}
                                                </td>
                                            </tr>

                                            {isExpanded && (
                                                <tr key={`${log.id}-detail`} className="bg-slate-950/40">
                                                    <td colSpan={6} className="p-4">
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                            {oldVal && (
                                                                <div>
                                                                    <div className="text-xs text-slate-500 mb-1.5">Giá trị trước</div>
                                                                    <pre className="text-xs text-red-300/80 bg-slate-900 border border-slate-800 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                                                                        {oldVal}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                            {newVal && (
                                                                <div>
                                                                    <div className="text-xs text-slate-500 mb-1.5">Giá trị sau</div>
                                                                    <pre className="text-xs text-emerald-300/80 bg-slate-900 border border-slate-800 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                                                                        {newVal}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {log.user_agent && (
                                                            <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
                                                                <Monitor size={12} />
                                                                <span className="font-mono">{log.user_agent}</span>
                                                            </div>
                                                        )}
                                                        {log.ip_address && (
                                                            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                                                                <Globe size={12} />
                                                                <span className="font-mono">{log.ip_address}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {hasMore && (
                    <div className="p-4 border-t border-slate-800 text-center">
                        <button
                            onClick={() => fetchLogs(nextCursor, query)}
                            disabled={loadingMore}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loadingMore ? "Đang tải..." : "Tải thêm"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}