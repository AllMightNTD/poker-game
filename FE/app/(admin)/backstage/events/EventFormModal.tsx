"use client";

import { FormButton } from "@/components/ui/form";
import { RHFCheckbox, RHFDateTimePicker, RHFInput, RHFSelect, RHFTextArea } from "@/components/ui/form/RhfFields";
import httpClient from "@/core/api/http-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
    DEFAULT_EVENT_FORM_VALUES,
    EventFormValues,
    eventSchema,
    eventToFormValues,
    formValuesToPayload,
    GRADIENT_PRESETS,
    ICON_PRESETS,
    PromoEvent,
} from "./event-constants";

interface EventFormModalProps {
    isOpen: boolean;
    editingEvent: PromoEvent | null;
    onClose: () => void;
    onSaved: () => void;
}

export default function EventFormModal({ isOpen, editingEvent, onClose, onSaved }: EventFormModalProps) {
    const {
        handleSubmit,
        reset,
        control,
        setValue,
    } = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: DEFAULT_EVENT_FORM_VALUES,
    });

    const currentColorGradient = useWatch({ control, name: "colorGradient" });

    // Đồng bộ form mỗi khi modal mở lại hoặc sự kiện đang sửa thay đổi
    useEffect(() => {
        if (!isOpen) return;
        reset(editingEvent ? eventToFormValues(editingEvent) : DEFAULT_EVENT_FORM_VALUES);
    }, [isOpen, editingEvent, reset]);

    const onSubmit = async (data: EventFormValues) => {
        const payload = formValuesToPayload(data);

        try {
            if (editingEvent) {
                await httpClient.put(`/api/v1/admin/events/${editingEvent.id}`, payload);
            } else {
                await httpClient.post("/api/v1/admin/events", payload);
            }
            onClose();
            onSaved();
        } catch (e) {
            console.error("Error saving event:", e);
            alert("Unable to save event. Please check the data again.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative">
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-100">
                        {editingEvent ? "Edit event" : "Add new event"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <RHFInput
                            control={control}
                            name="title"
                            label="Main Title"
                            required
                            placeholder="Example: Weekly Freeroll $5,000 GTD"
                            className="col-span-2"
                        />

                        <RHFInput
                            control={control}
                            name="subtitle"
                            label="Subtitle"
                            required
                            placeholder="Example: Free tournament every Sunday"
                            className="col-span-2"
                        />

                        <RHFTextArea
                            control={control}
                            name="description"
                            label="Event description"
                            required
                            placeholder="Enter detailed description of prizes, terms..."
                            className="col-span-2"
                            rows={3}
                        />

                        <RHFInput
                            control={control}
                            name="badge"
                            label="Badge"
                            placeholder="Example: Hot Event, Promotion"
                        />

                        <RHFSelect
                            control={control}
                            name="iconType"
                            label="Display icon"
                            options={ICON_PRESETS.map((i) => ({ value: i.type, label: i.label }))}
                        />

                        <div className="space-y-1.5 col-span-2">
                            <label className="text-xs font-semibold text-slate-400">Banner background color template</label>
                            <div className="grid grid-cols-2 gap-2">
                                {GRADIENT_PRESETS.map((p) => (
                                    <button
                                        key={p.name}
                                        type="button"
                                        onClick={() => setValue("colorGradient", p.class)}
                                        className={`p-3 rounded-lg text-left text-xs font-semibold transition-all border cursor-pointer ${currentColorGradient === p.class
                                            ? "border-indigo-500 bg-slate-850/50"
                                            : "border-slate-850 bg-slate-950 hover:bg-slate-850/20"
                                            }`}
                                    >
                                        <div className="font-medium text-slate-300">{p.name}</div>
                                        <div className={`h-2 rounded mt-1 bg-gradient-to-r ${p.class}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <RHFInput
                            control={control}
                            name="linkUrl"
                            label="Action Link (Optional)"
                            placeholder="Example: /poker-game or https://..."
                            className="col-span-2"
                        />

                        <RHFDateTimePicker control={control} name="startDate" label="Start time" />
                        <RHFDateTimePicker control={control} name="endDate" label="End time" />

                        <div className="col-span-2 pt-2">
                            <RHFCheckbox control={control} name="isActive" label="Activate now (Display in lobby)" />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3 border-t border-slate-800 mt-6">
                        <FormButton type="button" onClick={onClose} variant="outlined" className="flex-1">
                            Cancel
                                                    </FormButton>
                        <FormButton type="submit" variant="contained" color="primary" className="flex-1">
                            {editingEvent ? "Save changes" : "Create event"}
                        </FormButton>
                    </div>
                </form>
            </div>
        </div>
    );
}