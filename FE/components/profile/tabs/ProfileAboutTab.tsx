"use client";
import React from "react";
import { User, Mail, Globe, MapPin, Briefcase, GraduationCap, Cake, Users, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProfileAboutTabProps {
  user: any;
  isOwnProfile: boolean;
}

export function ProfileAboutTab({ user, isOwnProfile }: ProfileAboutTabProps) {
  const profile = user?.profile || {};

  const infoBlocks = [
    {
      title: "Thông tin cơ bản",
      items: [
        { icon: User, label: "Họ và tên", value: profile.full_name || user?.email?.split("@")[0] || "Chưa cập nhật" },
        { icon: Cake, label: "Ngày sinh", value: profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString("vi-VN") : "Chưa cập nhật" },
        { icon: Users, label: "Giới tính", value: profile.gender === "MALE" ? "Nam" : profile.gender === "FEMALE" ? "Nữ" : "Khác" },
      ]
    },
    {
      title: "Thông tin liên hệ",
      items: [
        { icon: Mail, label: "Email", value: user?.email || "Chưa cập nhật" },
        { icon: Phone, label: "Số điện thoại", value: user?.phone || "Chưa cập nhật" },
        { icon: Globe, label: "Website", value: profile.website || "Chưa cập nhật" },
      ]
    },
    {
      title: "Công việc & Học vấn",
      items: [
        { icon: Briefcase, label: "Nơi làm việc", value: profile.work?.[0]?.company || "Chưa cập nhật" },
        { icon: GraduationCap, label: "Trường học", value: profile.education?.[0]?.school || "Chưa cập nhật" },
      ]
    },
    {
      title: "Địa điểm sống",
      items: [
        { icon: MapPin, label: "Hiện đang sống tại", value: profile.location_city ? `${profile.location_city}${profile.location_country ? `, ${profile.location_country}` : ""}` : "Chưa cập nhật" },
        { icon: MapPin, label: "Quê quán", value: profile.address || "Chưa cập nhật" },
      ]
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-300 w-full">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Giới thiệu</h2>
        {isOwnProfile && (
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition-colors">
            Chỉnh sửa chi tiết
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
        {infoBlocks.map((block, idx) => (
          <div key={idx} className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{block.title}</h3>
            <div className="space-y-4">
              {block.items.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-0.5">{item.label}</p>
                    <p className="text-sm font-medium text-slate-700">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
