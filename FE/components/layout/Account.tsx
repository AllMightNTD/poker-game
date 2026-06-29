"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, CloudLightning, UploadCloud, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/core/providers/toast-provider";

interface AccountProps {
  currentUser: any;
  onBack: () => void;
}

export default function Account({ currentUser, onBack }: AccountProps) {
  const t = useTranslations("account");
  const { success } = useToast();
  const updateProfileMutation = useUpdateProfile();

  const profile = currentUser?.profile || {};

  // Extract first and last name from full_name
  const nameParts = profile.full_name ? profile.full_name.split(" ") : ["", ""];
  const initialFirstName = nameParts[0] || "";
  const initialLastName = nameParts.slice(1).join(" ") || "";

  const [formData, setFormData] = useState({
    firstName: initialFirstName,
    lastName: initialLastName,
    location_country: profile.location_country || "",
    location_city: profile.location_city || "",
    address: profile.address || "",
    postcode: profile.postcode || "",
    bio: profile.bio || "",
    work_company: profile.work?.[0]?.company || "",
    education_school: profile.education?.[0]?.school || "",
    hobbies: profile.hobbies ? profile.hobbies.join(", ") : "",
    avatar_url: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email}&backgroundColor=c0aede`
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hobbiesArray = formData.hobbies.split(",").map((h: string) => h.trim()).filter((h: string) => h);
    
    updateProfileMutation.mutate({
      full_name: `${formData.firstName} ${formData.lastName}`.trim(),
      location_country: formData.location_country,
      location_city: formData.location_city,
      address: formData.address,
      postcode: formData.postcode,
      bio: formData.bio,
      work: formData.work_company ? [{ company: formData.work_company }] : [],
      education: formData.education_school ? [{ school: formData.education_school }] : [],
      hobbies: hobbiesArray,
    }, {
      onSuccess: () => {
        success("Cập nhật thông tin thành công!");
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6 mx-auto w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Blue Header */}
      <div className="bg-blue-600 p-4 flex items-center gap-4 text-white">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">{t("accountDetails")}</h1>
      </div>

      <div className="p-8">
        {/* Profile Summary */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative mb-4 group">
            <img
              src={formData.avatar_url}
              alt="Avatar"
              className="w-28 h-28 rounded-2xl object-cover shadow-md border-4 border-white"
            />
            <label className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md text-blue-600 hover:text-blue-700 hover:scale-110 transition-transform cursor-pointer">
              <UploadCloud size={16} fill="currentColor" />
              <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  success("Tính năng upload ảnh đang được xây dựng!");
                }
              }} />
            </label>
          </div>
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
            {profile.full_name || currentUser?.email?.split('@')[0] || "Người dùng"}
          </h2>
          <p className="text-sm font-semibold text-slate-400">{profile.location_city || "Chưa cập nhật vị trí"}</p>
        </div>

        {/* Form Grid */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Personal Info */}
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Thông tin cá nhân</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">{t("firstName")}</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="w-full p-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 transition-all text-sm shadow-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">{t("lastName")}</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="w-full p-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 transition-all text-sm shadow-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">{t("email")} (Không thể sửa)</label>
                <input type="email" value={currentUser?.email || ""} readOnly className="w-full p-4 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 outline-none text-sm shadow-sm cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">{t("phone")} (Không thể sửa)</label>
                <input type="text" value={currentUser?.phone || ""} readOnly className="w-full p-4 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 outline-none text-sm shadow-sm cursor-not-allowed" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">{t("description")} (Bio)</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} placeholder="Giới thiệu đôi nét về bạn..." className="w-full p-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 transition-all text-sm resize-none shadow-sm"></textarea>
            </div>
          </div>

          {/* Location Info */}
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Thông tin địa chỉ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">{t("country")}</label>
                <input name="location_country" value={formData.location_country} onChange={handleChange} type="text" className="w-full p-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 transition-all text-sm shadow-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">{t("townCity")}</label>
                <input name="location_city" value={formData.location_city} onChange={handleChange} type="text" className="w-full p-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 transition-all text-sm shadow-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">{t("address")}</label>
                <input name="address" value={formData.address} onChange={handleChange} type="text" className="w-full p-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 transition-all text-sm shadow-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">{t("postcode")}</label>
                <input name="postcode" value={formData.postcode} onChange={handleChange} type="text" className="w-full p-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 transition-all text-sm shadow-sm" />
              </div>
            </div>
          </div>

          {/* Work, Education & Hobbies (From Onboarding) */}
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Học vấn & Công việc</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Trường học</label>
                <input name="education_school" value={formData.education_school} onChange={handleChange} placeholder="Vd: Đại học Bách Khoa" type="text" className="w-full p-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 transition-all text-sm shadow-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Nơi làm việc</label>
                <input name="work_company" value={formData.work_company} onChange={handleChange} placeholder="Vd: Google" type="text" className="w-full p-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 transition-all text-sm shadow-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">Sở thích</label>
              <input name="hobbies" value={formData.hobbies} onChange={handleChange} placeholder="Vd: Đọc sách, Nghe nhạc, Thể thao" type="text" className="w-full p-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500 transition-all text-sm shadow-sm" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={updateProfileMutation.isPending}
              className="w-full md:w-auto px-8 py-4 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-70"
            >
              {updateProfileMutation.isPending ? "Đang lưu..." : (
                <><CheckCircle size={18} /> {t("save")}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
