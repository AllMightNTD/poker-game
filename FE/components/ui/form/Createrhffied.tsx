"use client";

/**
 * createRHFField
 * ----------------
 * Bọc sẵn `Controller` (react-hook-form) cho một base component MUI-controlled
 * (FormInput, FormSelect, FormCheckbox, FormSwitch, FormSlider, DateTimePicker...).
 *
 * Sau khi bọc, nơi dùng chỉ cần truyền `control` + `name`, không cần viết
 * <Controller> lại mỗi lần, không cần lo về value/onChange/ref nữa:
 *
 *   const RHFInput = createRHFField(FormInput);
 *
 *   <RHFInput control={control} name="title" label="Tiêu đề" required />
 *
 * Lỗi hiển thị (error) tự lấy từ formState nếu bạn không truyền error riêng.
 */

import React from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

export interface RHFFieldExtraOptions {
    /** Tên prop dùng để truyền giá trị hiện tại xuống component (mặc định "value"). */
    valueProp?: string;
    /** Lấy giá trị mới từ event/callback mà component con bắn ra. Mặc định đọc event.target.value */
    extractValue?: (event: any) => any;
    /** Tên prop dùng để hiển thị lỗi (mặc định "error"). */
    errorProp?: string;
}

type RHFFieldProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
    TComponentProps
> = Omit<TComponentProps, "value" | "checked" | "onChange" | "name" | "ref"> & {
    control: Control<TFieldValues>;
    name: TName;
};

export function createRHFField<TComponentProps extends Record<string, any>>(
    Component: React.ComponentType<TComponentProps>,
    options: RHFFieldExtraOptions = {}
) {
    const {
        valueProp = "value",
        extractValue = (event: any) => event?.target?.value,
        errorProp = "error",
    } = options;

    function RHFField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
        control,
        name,
        ...rest
    }: RHFFieldProps<TFieldValues, TName, TComponentProps>) {
        return (
            <Controller
                control={control}
                name={name}
                render={({ field, fieldState }) => {
                    const componentProps: Record<string, any> = {
                        ...rest,
                        name: field.name,
                        ref: field.ref,
                        onBlur: field.onBlur,
                        onChange: (event: any) => field.onChange(extractValue(event)),
                        [valueProp]: field.value,
                    };

                    // Chỉ tự điền error từ fieldState nếu nơi gọi không truyền error riêng.
                    if (componentProps[errorProp] === undefined) {
                        componentProps[errorProp] = fieldState.error?.message;
                    }

                    return <Component {...(componentProps as TComponentProps)} />;
                }}
            />
        );
    }

    RHFField.displayName = `RHF(${Component.displayName || Component.name || "Component"})`;

    return RHFField;
}