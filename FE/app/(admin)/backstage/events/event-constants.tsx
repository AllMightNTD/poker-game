import { Coins, Megaphone, Sparkles, Trophy, Zap } from "lucide-react";
import * as z from "zod";

export interface PromoEvent {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    badge: string;
    color_gradient: string;
    icon_type: string;
    link_url?: string;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
}

export const GRADIENT_PRESETS = [
    { name: "Gold Cup (Gold)", class: "from-amber-500/20 via-orange-600/10 to-[#0b141d]" },
    { name: "Sparkling (Blue)", class: "from-blue-500/20 via-[#0a2540]/10 to-[#0b141d]" },
    { name: "Big Win (Emerald)", class: "from-emerald-500/20 via-teal-900/10 to-[#0b141d]" },
    { name: "Dramatic (Rose)", class: "from-rose-500/20 via-purple-900/10 to-[#0b141d]" },
];

export const ICON_PRESETS = [
    { type: "Trophy", label: "Gold Cup", component: <Trophy className="text-amber-400 w-5 h-5" /> },
    { type: "Sparkles", label: "Sparkling Star", component: <Sparkles className="text-blue-400 w-5 h-5" /> },
    { type: "Coins", label: "Gold Coin", component: <Coins className="text-emerald-400 w-5 h-5" /> },
    { type: "Zap", label: "Red Lightning", component: <Zap className="text-rose-400 w-5 h-5" /> },
];

export function getEventIcon(iconType: string) {
    const matched = ICON_PRESETS.find((i) => i.type === iconType);
    return matched?.component || <Megaphone className="w-4 h-4 text-slate-400" />;
}

export const eventSchema = z
    .object({
        title: z.string().min(1, "Title cannot be empty"),
        subtitle: z.string().min(1, "Subtitle cannot be empty"),
        description: z.string().min(1, "Description cannot be empty"),
        badge: z.string().min(1, "Badge cannot be empty"),
        colorGradient: z.string(),
        iconType: z.string(),
        linkUrl: z.string().optional(),
        isActive: z.boolean(),
        startDate: z.string().optional().or(z.literal("")),
        endDate: z.string().optional().or(z.literal("")),
    })
    .refine(
        (data) => {
            if (data.startDate && data.endDate) {
                return new Date(data.endDate) > new Date(data.startDate);
            }
            return true;
        },
        {
            message: "End time must be after start time",
            path: ["endDate"],
        }
    );

export type EventFormValues = z.infer<typeof eventSchema>;

export const DEFAULT_EVENT_FORM_VALUES: EventFormValues = {
    title: "",
    subtitle: "",
    description: "",
    badge: "Hot Events",
    colorGradient: GRADIENT_PRESETS[0].class,
    iconType: "Trophy",
    linkUrl: "",
    isActive: true,
    startDate: "",
    endDate: "",
};

export function eventToFormValues(event: PromoEvent): EventFormValues {
    return {
        title: event.title,
        subtitle: event.subtitle,
        description: event.description,
        badge: event.badge,
        colorGradient: event.color_gradient,
        iconType: event.icon_type,
        linkUrl: event.link_url || "",
        isActive: event.is_active,
        startDate: event.start_date ? event.start_date.substring(0, 16) : "",
        endDate: event.end_date ? event.end_date.substring(0, 16) : "",
    };
}

export function formValuesToPayload(data: EventFormValues) {
    return {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        badge: data.badge,
        color_gradient: data.colorGradient,
        icon_type: data.iconType,
        link_url: data.linkUrl || undefined,
        is_active: data.isActive,
        start_date: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        end_date: data.endDate ? new Date(data.endDate).toISOString() : undefined,
    };
}