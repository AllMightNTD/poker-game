"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useUpdateProfile } from "@/hooks/useProfile";
import { X, CheckCircle, ChevronRight, ChevronLeft, MapPin, Briefcase, GraduationCap, Heart } from "lucide-react";

interface OnboardingModalProps {
  currentUser: any;
  onClose: () => void;
}

export default function OnboardingModal({ currentUser, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    location_city: currentUser?.profile?.location_city || "",
    work_company: currentUser?.profile?.work?.[0]?.company || "",
    education_school: currentUser?.profile?.education?.[0]?.school || "",
    hobbies: currentUser?.profile?.hobbies ? currentUser?.profile?.hobbies.join(", ") : "",
  });

  const updateProfileMutation = useUpdateProfile();
  const t = useTranslations("common");

  const totalSteps = 3;

  const calculateCompletion = () => {
    let score = 20; // Base score for having an account
    if (currentUser?.profile?.avatar_url) score += 20;
    if (formData.location_city) score += 15;
    if (formData.work_company) score += 15;
    if (formData.education_school) score += 15;
    if (formData.hobbies) score += 15;
    return Math.min(100, score);
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const hobbiesArray = formData.hobbies.split(",").map((h: string) => h.trim()).filter((h: string) => h);
    updateProfileMutation.mutate({
      location_city: formData.location_city,
      work: formData.work_company ? [{ company: formData.work_company }] : [],
      education: formData.education_school ? [{ school: formData.education_school }] : [],
      hobbies: hobbiesArray,
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const completion = calculateCompletion();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 relative">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Chào mừng bạn đến với Sociala! 🎉</h2>
            <p className="text-sm text-slate-500 mt-1">Hãy thiết lập hồ sơ để trải nghiệm tốt hơn</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-2">
            <motion.div 
              className="bg-blue-500 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>Hoàn thiện hồ sơ</span>
            <span className="text-blue-500">{completion}%</span>
          </div>
        </div>

        <div className="p-6 flex-1 min-h-[250px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-4 text-blue-500">
                  <MapPin size={24} />
                  <h3 className="text-lg font-bold text-slate-700">Bạn đang sống ở đâu?</h3>
                </div>
                <input
                  type="text"
                  placeholder="Nhập tên thành phố (Vd: Hà Nội)"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  value={formData.location_city}
                  onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4 text-blue-500">
                    <Briefcase size={24} />
                    <h3 className="text-lg font-bold text-slate-700">Nơi làm việc</h3>
                  </div>
                  <input
                    type="text"
                    placeholder="Nhập tên công ty"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.work_company}
                    onChange={(e) => setFormData({ ...formData, work_company: e.target.value })}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4 text-blue-500">
                    <GraduationCap size={24} />
                    <h3 className="text-lg font-bold text-slate-700">Trường học</h3>
                  </div>
                  <input
                    type="text"
                    placeholder="Nhập tên trường học"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    value={formData.education_school}
                    onChange={(e) => setFormData({ ...formData, education_school: e.target.value })}
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-4 text-blue-500">
                  <Heart size={24} />
                  <h3 className="text-lg font-bold text-slate-700">Sở thích của bạn là gì?</h3>
                </div>
                <textarea
                  placeholder="Cách nhau bằng dấu phẩy (Vd: Nghe nhạc, Đọc sách, Du lịch...)"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none h-32"
                  value={formData.hobbies}
                  onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition"
          >
            {step > 1 ? "Quay lại" : "Bỏ qua"}
          </button>
          <button
            onClick={handleNext}
            disabled={updateProfileMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50"
          >
            {step < totalSteps ? (
              <>Tiếp tục <ChevronRight size={16} /></>
            ) : (
              <>{updateProfileMutation.isPending ? "Đang lưu..." : "Hoàn tất"} <CheckCircle size={16} /></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
