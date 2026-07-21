"use client";

import { FormButton } from "@/components/ui/form";
import { RHFInput } from "@/components/ui/form/RhfFields";
import { useForm, useWatch } from "react-hook-form";
import httpClient from "@/core/api/http-client";
import { Edit, Megaphone, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import EventFormModal from "./EventFormModal";
import { getEventIcon, PromoEvent } from "./event-constants";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<PromoEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { control } = useForm({
    defaultValues: { search: "" },
  });
  const search = useWatch({ control, name: "search" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PromoEvent | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await httpClient.get("/api/v1/admin/events", {
        params: search ? { search } : {},
      });
      setEvents(res.data || []);
    } catch (e) {
      console.error("Error fetching event list:", e);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchEvents();
    });
  }, [fetchEvents]);

  const openAddModal = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (event: PromoEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: string) => {
    try {
      await httpClient.patch(`/api/v1/admin/events/${id}/toggle`);
      fetchEvents();
    } catch (e) {
      console.error("Error toggling status:", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }
    try {
      await httpClient.delete(`/api/v1/admin/events/${id}`);
      fetchEvents();
    } catch (e) {
      console.error("Error deleting event:", e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2.5">
            <Megaphone className="text-indigo-400" size={24} /> Event & Promotion Management
                                </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure the banner list displayed in the CG Poker main lobby.
                                </p>
        </div>
        <FormButton
          onClick={openAddModal}
          variant="contained"
          color="primary"
          startIcon={<Plus size={16} />}
        >
          Add new event
                          </FormButton>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <RHFInput
          control={control}
          name="search"
          type="text"
          placeholder="Search event name, badge..."
          size="small"
          className="!w-80"
        />
      </div>

      {/* Events Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Loading event list...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No events found. Click the button above to create one.
                                    </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Label & Icon</th>
                  <th className="px-6 py-4">Event Information</th>
                  <th className="px-6 py-4">Applicable Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-800/20 transition-colors text-sm">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs rounded-full font-medium">
                          {event.badge}
                        </span>
                        <span className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-850">
                          {getEventIcon(event.icon_type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <div>
                        <div className="font-semibold text-slate-200">{event.title}</div>
                        <div className="text-xs text-slate-400 font-bold mt-0.5">{event.subtitle}</div>
                        <div className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {event.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 w-8">From:</span>
                          <span>
                            {event.start_date
                              ? new Date(event.start_date).toLocaleString("vi-VN")
                              : "Start immediately"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 w-8">To:</span>
                          <span>
                            {event.end_date
                              ? new Date(event.end_date).toLocaleString("vi-VN")
                              : "Indefinite"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(event.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${event.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-800 text-slate-500 border border-slate-700"
                          }`}
                      >
                        {event.is_active ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(event)}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EventFormModal
        isOpen={isModalOpen}
        editingEvent={editingEvent}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchEvents}
      />
    </div>
  );
}