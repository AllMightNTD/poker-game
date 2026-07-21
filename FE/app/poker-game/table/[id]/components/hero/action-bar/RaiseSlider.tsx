"use client";

import React from "react";
import { fmt } from "../../formatter";
import { RHFSlider } from "@/components/ui/form/RhfFields";
import { useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";

interface RaiseSliderProps {
    minRaise: number;
    maxRaise: number;
    raiseAmount: number;
    onChange: (val: number) => void;
}

export const RaiseSlider: React.FC<RaiseSliderProps> = ({
    minRaise,
    maxRaise,
    raiseAmount,
    onChange,
}) => {
    const { control } = useForm({
        defaultValues: { raiseAmount: raiseAmount }
    });

    const watchRaiseAmount = useWatch({ control, name: "raiseAmount" });

    useEffect(() => {
        onChange(Number(watchRaiseAmount));
    }, [watchRaiseAmount, onChange]);

    return (
        <div className="flex items-center gap-4 px-1 text-[8px] font-bold text-[#F7EFDD]/40 w-full">
            <span>{fmt(minRaise)}</span>
            <RHFSlider
                control={control}
                name="raiseAmount"
                min={minRaise}
                max={maxRaise}
                className="flex-1"
            />
            <span className="text-red-400">ALL-IN</span>
        </div>
    );
};