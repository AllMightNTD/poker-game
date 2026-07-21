"use client";

import { FormButton } from "@/components/ui/form";
import { RHFInput } from "@/components/ui/form/RhfFields";
import { useForm, useWatch } from "react-hook-form";
import httpClient from "@/core/api/http-client";
import { ChevronDown, Clock, Database, Globe, Monitor, Search } from "lucide-react";
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

// Maps action verbs to a premium style badge
const ACTION_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    CREATE: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    UPDATE: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    DELETE: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
    BAN: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
    APPROVE: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    REJECT: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
};

function getActionStyle(action: string) {
    const upper = action.toUpperCase();
    const key = Object.keys(ACTION_STYLES).find((k) => upper.includes(k));
    return key ? ACTION_STYLES[key] : { bg: "bg-slate-800", text: "text-slate-300", border: "border-slate-700" };
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
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const { control } = useForm({
        defaultValues: { query: "" },
    });
    
    const query = useWatch({ control, name: "query" });

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
        <div className="space-y-8 p-1">
            {/* Page Header */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-r from-teal-950/20 via-slate-900/40 to-transparent border border-white/5 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black tracking-wide text-white uppercase flex items-center gap-2">
                            <Database className="text-teal-400" size={24} />
                            System Logs
                                                    </h1>
                        <p className="text-slate-400 text-sm font-medium">
                            Detailed history of all actions and operations performed by administrators on the PKCG system.
                                                    </p>
                    </div>

                    <div className="w-full md:w-80 shrink-0">
                        <div className="relative">
                            <RHFInput
                                control={control}
                                name="query"
                                type="text"
                                placeholder="Filter by Admin ID, action..."
                                leftIcon={<Search size={16} className="text-slate-400" />}
                                size="small"
                                className="bg-slate-950/40 border-white/10"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main logs display */}
            <div className="rounded-2xl border border-white/5 bg-[#080d1a] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="p-4 w-12" />
                                <th className="p-4">Admin ID</th>
                                <th className="p-4">Action</th>
                                <th className="p-4">Resource</th>
                                <th className="p-4">IP Address</th>
                                <th className="p-4">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-xs font-semibold tracking-wider text-slate-400">Loading audit logs...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-500">
                                        No activity logs found.
                                                                                </td>
                                </tr>
                            ) : (
                                logs.map((log) => {
                                    const isExpanded = expandedId === log.id;
                                    const hasDetail = !!(log.old_value || log.new_value || log.user_agent);
                                    const oldVal = formatValue(log.old_value);
                                    const newVal = formatValue(log.new_value);
                                    const badge = getActionStyle(log.action);

                                    return (
                                        <React.Fragment key={log.id}>
                                            <tr
                                                onClick={() => hasDetail && setExpandedId(isExpanded ? null : log.id)}
                                                className={`group transition-all duration-200 ${hasDetail ? "cursor-pointer hover:bg-white/[0.02]" : ""
                                                    }`}
                                            >
                                                <td className="p-4 text-center">
                                                    {hasDetail && (
                                                        <ChevronDown
                                                            size={15}
                                                            className={`text-slate-500 group-hover:text-slate-300 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                                                                }`}
                                                        />
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-mono text-xs text-slate-300 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                                        {log.admin_id.substring(0, 10)}…
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${badge.bg} ${badge.text} ${badge.border}`}
                                                    >
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-300 font-medium">
                                                    {log.resource}
                                                </td>
                                                <td className="p-4 text-slate-500 font-mono text-xs">
                                                    {log.ip_address || "—"}
                                                </td>
                                                <td className="p-4 text-slate-500 font-medium">
                                                    <span className="flex items-center gap-1.5 text-xs">
                                                        <Clock size={12} className="text-slate-600" />
                                                        {new Date(log.created_at).toLocaleString("vi-VN", {
                                                            month: "2-digit",
                                                            day: "2-digit",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hour12: false,
                                                        })}
                                                    </span>
                                                </td>
                                            </tr>

                                            {/* Detail row with animations */}
                                            {isExpanded && (
                                                <tr className="bg-slate-950/60">
                                                    <td colSpan={6} className="p-6">
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                            {oldVal && (
                                                                <div className="space-y-2">
                                                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                                        Previous Data (Original State)
                                                                                                                                            </div>
                                                                    <pre className="text-xs font-mono text-rose-300/90 bg-rose-950/10 border border-rose-900/30 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap max-h-72 scrollbar-thin">
                                                                        {oldVal}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                            {newVal && (
                                                                <div className="space-y-2">
                                                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                                        Updated Data (Modified State)
                                                                                                                                            </div>
                                                                    <pre className="text-xs font-mono text-emerald-300/90 bg-emerald-950/10 border border-emerald-900/30 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap max-h-72 scrollbar-thin">
                                                                        {newVal}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Client context */}
                                                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 pt-4 border-t border-white/5 text-xs text-slate-500">
                                                            {log.user_agent && (
                                                                <div className="flex items-center gap-2">
                                                                    <Monitor size={13} className="text-slate-600" />
                                                                    <span className="font-mono text-slate-400 truncate max-w-lg">
                                                                        {log.user_agent}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {log.ip_address && (
                                                                <div className="flex items-center gap-2">
                                                                    <Globe size={13} className="text-slate-600" />
                                                                    <span className="font-mono text-slate-400">
                                                                        {log.ip_address}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
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

                {/* Pagination/Load More */}
                {hasMore && (
                    <div className="p-4 border-t border-white/5 text-center bg-white/[0.01]">
                        <FormButton
                            onClick={() => fetchLogs(nextCursor, query)}
                            disabled={loadingMore}
                            isLoading={loadingMore}
                            variant="contained"
                            color="primary"
                            size="small"
                            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-2 rounded-xl transition-all duration-200"
                        >
                            Load more logs
                                                    </FormButton>
                    </div>
                )}
            </div>
        </div>
    );
}