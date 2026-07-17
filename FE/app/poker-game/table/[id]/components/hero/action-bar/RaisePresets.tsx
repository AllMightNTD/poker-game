"use client";

import React from "react";
import { QuickBetOption } from "../../types";

import { FormButton, FormButtonGroup } from "@/components/ui/form";

interface RaisePresetsProps {
    quickBets: QuickBetOption[];
    raiseAmount: number;
    clamp: (v: number) => number;
    onSelect: (val: number) => void;
}

export const RaisePresets: React.FC<RaisePresetsProps> = ({
    quickBets,
    raiseAmount,
    clamp,
    onSelect,
}) => {
    return (
        <FormButtonGroup fullWidth size="small" variant="outlined" color="primary" className="mt-1">
            {quickBets.map((opt) => {
                const v = Math.round(opt.val);
                const isSelected = raiseAmount === clamp(v);
                return (
                    <FormButton
                        key={opt.label}
                        onClick={() => onSelect(opt.val)}
                        variant={isSelected ? "contained" : "outlined"}
                        color="primary"
                        sx={{ fontSize: '8px', py: 0.5, minWidth: 0 }}
                    >
                        {opt.label}
                    </FormButton>
                );
            })}
        </FormButtonGroup>
    );
};