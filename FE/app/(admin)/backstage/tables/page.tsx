"use client";

import { FormButton } from "@/components/ui/form";
import { RHFCheckbox, RHFInput, RHFSelect } from "@/components/ui/form/RhfFields";
import httpClient from "@/core/api/http-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleDollarSign, Pause, Play, Plus, PowerOff, Users, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const adminKeys = {
  all: ["admin"] as const,
  tables: () => [...adminKeys.all, "tables"] as const,
};

const fetchTablesPage = async ({ pageParam }: { pageParam: string | null }) => {
  const res = await httpClient.get("/api/v1/admin/tables", {
    params: pageParam ? { cursor: pageParam } : {}
  });
  return res.data;
};

const tableSchema = z.object({
  name: z.string().min(1, "Table name cannot be empty"),
  game_type: z.string(),
  small_blind: z.string().min(1, "Small Blind is required").refine((val) => Number(val) > 0, "Must be greater than 0"),
  ante: z.string().min(1, "Ante is required").refine((val) => Number(val) >= 0, "Cannot be less than 0"),
  max_players: z.number(),
  min_buyin: z.string().min(1, "Min Buy-in is required").refine((val) => Number(val) > 0, "Must be greater than 0"),
  max_buyin: z.string().min(1, "Max Buy-in is required").refine((val) => Number(val) > 0, "Must be greater than 0"),
  rake_rate: z.number().min(0, "Rake rate cannot be less than 0").max(10, "Maximum rake rate is 10%"),
  rake_cap: z.string().min(1, "Trần Rake Cap là bắt buộc").refine((val) => Number(val) >= 0, "Cannot be less than 0"),
  allow_bomb_pot: z.boolean(),
  allow_rit: z.boolean(),
}).refine(
  (data) => Number(data.max_buyin) >= Number(data.min_buyin),
  {
    message: "Max Buy-in phải lớn hơn hoặc bằng Min Buy-in",
    path: ["max_buyin"],
  }
);

type TableFormValues = z.infer<typeof tableSchema>;

const INITIAL_VALUES: TableFormValues = {
  name: "",
  game_type: "TEXAS",
  small_blind: "5",
  ante: "0",
  max_players: 9,
  min_buyin: "400",
  max_buyin: "2000",
  rake_rate: 5.0,
  rake_cap: "30",
  allow_bomb_pot: false,
  allow_rit: false,
};

export default function AdminTablesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<TableFormValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: INITIAL_VALUES,
    mode: "onChange",
  });

  // Query: Fetch tables with cursor-based pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: adminKeys.tables(),
    queryFn: fetchTablesPage,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage?.meta?.has_more ? (lastPage?.meta?.next_cursor || null) : undefined,
  });

  // Flatten pages data into single array
  const tables = data?.pages.flatMap((page) => page?.data || []) || [];

  // Mutations
  const closeMutation = useMutation({
    mutationFn: (id: string) => httpClient.post(`/api/v1/admin/tables/${id}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tables() });
    },
    onError: () => {
      alert("Đóng bàn thất bại");
    }
  });

  const pauseMutation = useMutation({
    mutationFn: (id: string) => httpClient.post(`/api/v1/admin/tables/${id}/pause`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tables() });
    },
    onError: () => {
      alert("Tạm dừng bàn thất bại");
    }
  });

  const resumeMutation = useMutation({
    mutationFn: (id: string) => httpClient.post(`/api/v1/admin/tables/${id}/resume`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tables() });
    },
    onError: () => {
      alert("Tiếp tục bàn thất bại");
    }
  });

  const createMutation = useMutation({
    mutationFn: (values: TableFormValues) =>
      httpClient.post("/api/v1/admin/tables", {
        name: values.name,
        game_type: values.game_type,
        small_blind: values.small_blind,
        ante: values.ante,
        max_players: Number(values.max_players),
        min_buyin: values.min_buyin,
        max_buyin: values.max_buyin,
        rake_rate: Number(values.rake_rate),
        rake_cap: values.rake_cap,
        custom_settings: {
          allow_bomb_pot: values.allow_bomb_pot,
          allow_rit: values.allow_rit,
        }
      }),
    onSuccess: (res) => {
      if (res.data?.success) {
        queryClient.invalidateQueries({ queryKey: adminKeys.tables() });
        setIsModalOpen(false);
        reset(INITIAL_VALUES);
      } else {
        alert("Tạo bàn chơi thất bại");
      }
    },
    onError: () => {
      alert("Tạo bàn chơi thất bại");
    }
  });

  const handleClose = (id: string) => {
    if (!confirm("Đóng bàn này? Tất cả người chơi sẽ bị rời khỏi bàn.")) return;
    closeMutation.mutate(id);
  };

  const handlePause = (id: string) => {
    pauseMutation.mutate(id);
  };

  const handleResume = (id: string) => {
    resumeMutation.mutate(id);
  };

  const onSubmit = (values: TableFormValues) => {
    createMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Quản lý bàn</h1>
          <p className="text-slate-500 text-sm mt-1">Theo dõi bàn đang hoạt động, cấu hình cược và các thao tác admin.</p>
        </div>
        <FormButton
          onClick={() => {
            reset(INITIAL_VALUES);
            setIsModalOpen(true);
          }}
          variant="contained"
          color="primary"
          startIcon={<Plus size={16} />}
        >
          Tạo bàn mới
        </FormButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-slate-500">Đang tải danh sách bàn...</div>
        ) : tables.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500">Không có bàn nào đang hoạt động.</div>
        ) : (
          tables.map((table: any) => (
            <div key={table.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative flex flex-col hover:border-slate-700 transition-colors">
              {table.status === "closed" && (
                <div className="absolute inset-0 bg-slate-950/90 z-10 flex items-center justify-center rounded-xl">
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-400 text-xs rounded-md font-medium border border-slate-700">Đã đóng</span>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">{table.name}</h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {table.id}</div>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${table.status === "paused" ? "bg-amber-500 animate-pulse" : table.status === "closed" ? "bg-slate-600" : "bg-emerald-500"} mt-1.5`} />
              </div>

              <div className="space-y-2.5 mb-5 flex-1 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-2">
                    <CircleDollarSign size={14} /> Mức cược
                  </span>
                  <span className="font-medium text-slate-200">
                    ${table.small_blind} / ${table.big_blind}
                  </span>
                </div>
                {table.ante && table.ante !== "0" && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Ante</span>
                    <span className="font-medium text-slate-200">${table.ante}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Users size={14} /> Số ghế tối đa
                  </span>
                  <span className="font-medium text-slate-200">{table.max_players}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Rake Rate / Cap</span>
                  <span className="font-medium text-slate-200">{table.rake_rate}% / ${table.rake_cap}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${table.status === "paused" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                    {table.status?.toUpperCase() || "WAITING"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-slate-800/60">
                {table.status === "paused" ? (
                  <FormButton
                    onClick={() => handleResume(table.id)}
                    variant="outlined"
                    color="success"
                    size="small"
                    startIcon={<Play size={13} />}
                  >
                    Tiếp tục
                  </FormButton>
                ) : (
                  <FormButton
                    onClick={() => handlePause(table.id)}
                    variant="outlined"
                    color="warning"
                    size="small"
                    startIcon={<Pause size={13} />}
                  >
                    Pause
                  </FormButton>
                )}
                <FormButton
                  onClick={() => handleClose(table.id)}
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<PowerOff size={13} />}
                >
                  Đóng bàn
                </FormButton>
              </div>
            </div>
          ))
        )}
      </div>

      {hasNextPage && (
        <div className="flex justify-center mt-6">
          <FormButton
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            isLoading={isFetchingNextPage}
            variant="outlined"
            color="primary"
          >
            Load more
          </FormButton>
        </div>
      )}

      {/* Create Table Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-slate-100">Tạo bàn Poker mới</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <RHFInput
                control={control}
                name="name"
                label="Table Name"
                required
                placeholder="Ví dụ: High Roller Club"
                error={errors.name?.message}
              />

              <div className="grid grid-cols-2 gap-4">
                <RHFInput
                  control={control}
                  name="small_blind"
                  label="Small Blind ($)"
                  type="number"
                  required
                  min="1"
                  error={errors.small_blind?.message}
                />
                <RHFInput
                  control={control}
                  name="ante"
                  label="Ante ($)"
                  type="number"
                  required
                  min="0"
                  error={errors.ante?.message}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <RHFSelect
                  control={control}
                  name="max_players"
                  label="Số ghế"
                >
                  <option value="9">9 players</option>
                  <option value="6">6 players</option>
                  <option value="2">Heads Up (2)</option>
                </RHFSelect>

                <RHFSelect
                  control={control}
                  name="game_type"
                  label="Kiểu chơi"
                  className="col-span-2"
                >
                  <option value="TEXAS">Texas Hold&apos;em</option>
                  <option value="OMAHA">Omaha (PLO)</option>
                </RHFSelect>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <RHFInput
                  control={control}
                  name="min_buyin"
                  label="Min Buy-in ($)"
                  type="number"
                  required
                  min="1"
                  error={errors.min_buyin?.message}
                />
                <RHFInput
                  control={control}
                  name="max_buyin"
                  label="Max Buy-in ($)"
                  type="number"
                  required
                  min="1"
                  error={errors.max_buyin?.message}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <RHFInput
                  control={control}
                  name="rake_rate"
                  label="Tỉ lệ Rake (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  required
                  error={errors.rake_rate?.message}
                />
                <RHFInput
                  control={control}
                  name="rake_cap"
                  label="Trần Rake Cap ($)"
                  type="number"
                  required
                  min="0"
                  error={errors.rake_cap?.message}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <RHFCheckbox
                  control={control}
                  name="allow_bomb_pot"
                  label="Cho phép Bomb Pot"
                />

                <RHFCheckbox
                  control={control}
                  name="allow_rit"
                  label="Cho phép RIT"
                />
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-800 mt-6">
                <FormButton
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="outlined"
                  className="flex-1"
                >
                  Cancel
                </FormButton>
                <FormButton
                  type="submit"
                  disabled={createMutation.isPending || !isValid}
                  isLoading={createMutation.isPending}
                  variant="contained"
                  color="primary"
                  className="flex-1"
                >
                  Tạo ngay
                </FormButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}