"use client";

/**
 * Các field RHF-ready — chỉ cần truyền `control` + `name`.
 *
 *   <RHFInput control={control} name="title" label="Tiêu đề" required />
 *   <RHFTextArea control={control} name="description" label="Mô tả" rows={3} />
 *   <RHFSelect control={control} name="iconType" label="Icon" options={ICON_PRESETS} />
 *   <RHFCheckbox control={control} name="isActive" label="Kích hoạt ngay" />
 *   <RHFSwitch control={control} name="notify" label="Nhận thông báo" />
 *   <RHFSlider control={control} name="volume" label="Âm lượng" />
 *   <RHFDateTimePicker control={control} name="startDate" label="Bắt đầu" />
 *
 * Nếu cần custom hành vi khác cho 1 field cụ thể, vẫn có thể dùng <Controller>
 * thủ công như bình thường — các RHFXxx này chỉ là lớp tiện ích cho trường hợp
 * phổ biến (>90% các field trong form).
 */

import dynamic from "next/dynamic";
import { createRHFField } from "./Createrhffied";
import { FormCheckbox } from "./FormCheckbox";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { FormSlider } from "./FormSlider";
import { FormSwitch } from "./FormSwitch";
import { FormTextArea } from "./FormTextArea";

const DateTimePicker = dynamic(
    () => import("@/components/ui/DateTimePicker").then((mod) => mod.DateTimePicker),
    { ssr: false }
);

// Field dùng event native (target.value): Input, TextArea, Select
export const RHFInput = createRHFField(FormInput);
export const RHFTextArea = createRHFField(FormTextArea);
export const RHFSelect = createRHFField(FormSelect);

// Field dùng checked thay vì value
export const RHFCheckbox = createRHFField(FormCheckbox, {
    valueProp: "checked",
    extractValue: (e) => !!e?.target?.checked,
});
export const RHFSwitch = createRHFField(FormSwitch, {
    valueProp: "checked",
    extractValue: (e) => !!e?.target?.checked,
});

// Field bắn ra event dạng { target: { name, value } } tự custom (không phải DOM event thật)
// -> extractValue mặc định (event.target.value) vẫn dùng được, không cần khai báo riêng.
export const RHFSlider = createRHFField(FormSlider);
export const RHFDateTimePicker = createRHFField(DateTimePicker as any);