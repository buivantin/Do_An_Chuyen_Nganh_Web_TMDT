<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class VoucherController extends Controller
{
    /**
     * Chuẩn hóa dữ liệu Voucher trả về cho Frontend (khớp cả tên cột DB lẫn tên biến UI)
     */
    private function formatVoucher(Voucher $voucher): array
    {
        return [
            'id'                => $voucher->id,
            'code'              => $voucher->code,
            'name'              => $voucher->name,
            'discount_type'     => $voucher->discount_type ?? 'fixed',
            'discount_value'    => (float) $voucher->discount_amount,
            'discount_amount'   => (float) $voucher->discount_amount,
            'max_discount'      => (float) ($voucher->max_discount ?? 0),
            'min_order_amount'  => (float) ($voucher->min_order_value ?? 0),
            'min_order_value'   => (float) ($voucher->min_order_value ?? 0),
            'min_spent'         => (float) ($voucher->min_spent ?? 0),
            'membership_tier'   => $voucher->membership_tier,
            'target_tiers'      => $voucher->target_tiers ?? [],
            'tier_name'         => $voucher->tier_name,
            'distribution_mode' => $voucher->distribution_mode ?? 'all_eligible',
            'is_exclusive'      => (bool) $voucher->is_exclusive,
            'assigned_count'    => $voucher->users_count ?? $voucher->users()->count(),
            'usage_limit'       => (int) ($voucher->usage_limit ?? 0),
            'used_count'        => (int) ($voucher->used_count ?? 0),
            'start_date'        => $voucher->start_date ? $voucher->start_date->format('Y-m-d') : null,
            'end_date'          => $voucher->expiration_date ? $voucher->expiration_date->format('Y-m-d') : null,
            'expiration_date'   => $voucher->expiration_date ? $voucher->expiration_date->format('Y-m-d') : null,
            'status'            => $voucher->status,
            'effective_status'  => $voucher->effective_status,
            'is_expired'        => $voucher->is_expired,
            'requirement'       => $voucher->requirement,
        ];
    }

    /**
     * [ADMIN] Thống kê số lượng thành viên theo từng cấp bậc (1 -> 5)
     */
    public function tierStats()
    {
        $counts = User::where('role', '!=', 'admin')
            ->select('membership_tier', DB::raw('COUNT(*) as total'))
            ->groupBy('membership_tier')
            ->pluck('total', 'membership_tier');

        $tiers = [];
        foreach (User::TIERS as $level => $name) {
            $tiers[] = [
                'tier'  => $level,
                'name'  => $name,
                'count' => (int) ($counts[$level] ?? 0),
            ];
        }

        return response()->json([
            'tiers'       => $tiers,
            'total_users' => array_sum(array_column($tiers, 'count')),
        ]);
    }

    /**
     * [ADMIN] Lấy danh sách toàn bộ Voucher
     */
    public function adminIndex()
    {
        $vouchers = Voucher::withCount('users')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Voucher $v) => $this->formatVoucher($v));

        return response()->json(['data' => $vouchers]);
    }

    /**
     * [ADMIN] Tạo mới Voucher & tự động phân phối theo cấp bậc thành viên
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code'              => 'required|string|max:50|unique:vouchers,code',
            'name'              => 'nullable|string|max:255',
            'discount_type'     => ['nullable', Rule::in(['fixed', 'percent'])],
            'discount_value'    => 'required|numeric|min:1',
            'max_discount'      => 'nullable|numeric|min:0',
            'min_order_amount'  => 'nullable|numeric|min:0',
            'min_spent'         => 'nullable|numeric|min:0',
            'usage_limit'       => 'nullable|integer|min:0',
            'target_tiers'      => 'nullable|array',
            'target_tiers.*'    => 'integer|between:1,5',
            'distribution_mode' => ['nullable', Rule::in(['all_eligible', 'priority_high_tier', 'random'])],
            'start_date'        => 'nullable|date',
            'end_date'          => 'nullable|date|after_or_equal:start_date',
            'status'            => ['nullable', Rule::in(['active', 'inactive'])],
            'requirement'       => 'nullable|string|max:255',
        ]);

        $discountType = $validated['discount_type'] ?? 'fixed';
        if ($discountType === 'percent' && $validated['discount_value'] > 100) {
            return response()->json(['message' => 'Mức giảm phần trăm không được vượt quá 100%.'], 422);
        }

        $targetTiers = !empty($validated['target_tiers'])
            ? array_values(array_unique(array_map('intval', $validated['target_tiers'])))
            : null;

        $usageLimit = (int) ($validated['usage_limit'] ?? 0);
        $mode = $validated['distribution_mode'] ?? 'all_eligible';

        return DB::transaction(function () use ($validated, $discountType, $targetTiers, $usageLimit, $mode) {
            $voucher = Voucher::create([
                'code'              => strtoupper(trim($validated['code'])),
                'name'              => $validated['name'] ?? ('Ưu đãi ' . strtoupper(trim($validated['code']))),
                'discount_type'     => $discountType,
                'discount_amount'   => $validated['discount_value'],
                'max_discount'      => $discountType === 'percent' ? ($validated['max_discount'] ?? 0) : 0,
                'min_order_value'   => $validated['min_order_amount'] ?? 0,
                'min_spent'         => $validated['min_spent'] ?? 0,
                'membership_tier'   => $targetTiers ? min($targetTiers) : null,
                'target_tiers'      => $targetTiers,
                'distribution_mode' => $mode,
                'is_exclusive'      => false,
                'usage_limit'       => $usageLimit,
                'used_count'        => 0,
                'start_date'        => $validated['start_date'] ?? now()->startOfDay(),
                'expiration_date'   => isset($validated['end_date']) ? $validated['end_date'] . ' 23:59:59' : null,
                'status'            => $validated['status'] ?? 'active',
                'requirement'       => $validated['requirement'] ?? null,
            ]);

            $assignedCount = $this->distributeVoucherToUsers($voucher, $targetTiers, $usageLimit, $mode);

            $voucher->loadCount('users');
            $msg = $voucher->is_exclusive
                ? "Đã tạo voucher {$voucher->code} và phát độc quyền cho {$assignedCount} thành viên phù hợp."
                : "Đã tạo voucher {$voucher->code} thành công.";

            return response()->json([
                'message' => $msg,
                'data'    => $this->formatVoucher($voucher),
            ], 201);
        });
    }

    /**
     * Logic phân phối voucher tự động khi số lượng giới hạn < số thành viên đủ điều kiện
     */
    private function distributeVoucherToUsers(Voucher $voucher, ?array $targetTiers, int $usageLimit, string $mode): int
    {
        // Chế độ mở chung cho tất cả thành viên thuộc hạng đã chọn (ai dùng trước được trước)
        if ($mode === 'all_eligible' || $usageLimit <= 0) {
            $voucher->update(['is_exclusive' => false]);
            return 0;
        }

        $query = User::where('role', '!=', 'admin')
            ->where('status', 'active');

        if (!empty($targetTiers)) {
            $query->whereIn('membership_tier', $targetTiers);
        }

        if ((float) $voucher->min_spent > 0) {
            $query->where('total_spent', '>=', (float) $voucher->min_spent);
        }

        if ($mode === 'priority_high_tier') {
            // Ưu tiên từ cấp cao nhất (5 -> 1), cùng cấp ưu tiên người chi tiêu tích lũy nhiều hơn
            $query->orderByDesc('membership_tier')
                  ->orderByDesc('total_spent')
                  ->orderBy('id');
        } elseif ($mode === 'random') {
            $query->inRandomOrder();
        }

        $selectedUserIds = $query->limit($usageLimit)->pluck('id')->toArray();

        $voucher->update(['is_exclusive' => true]);

        if (!empty($selectedUserIds)) {
            $now = now();
            $pivotData = [];
            foreach ($selectedUserIds as $uid) {
                $pivotData[$uid] = ['assigned_at' => $now];
            }
            $voucher->users()->sync($pivotData);
        }

        return count($selectedUserIds);
    }

    /**
     * [ADMIN] Cập nhật Voucher
     */
    public function update(Request $request, $id)
    {
        $voucher = Voucher::findOrFail($id);

        $validated = $request->validate([
            'code'              => ['required', 'string', 'max:50', Rule::unique('vouchers', 'code')->ignore($voucher->id)],
            'name'              => 'nullable|string|max:255',
            'discount_type'     => ['nullable', Rule::in(['fixed', 'percent'])],
            'discount_value'    => 'required|numeric|min:1',
            'max_discount'      => 'nullable|numeric|min:0',
            'min_order_amount'  => 'nullable|numeric|min:0',
            'min_spent'         => 'nullable|numeric|min:0',
            'usage_limit'       => 'nullable|integer|min:0',
            'target_tiers'      => 'nullable|array',
            'target_tiers.*'    => 'integer|between:1,5',
            'distribution_mode' => ['nullable', Rule::in(['all_eligible', 'priority_high_tier', 'random'])],
            'start_date'        => 'nullable|date',
            'end_date'          => 'nullable|date',
            'status'            => ['nullable', Rule::in(['active', 'inactive'])],
            'requirement'       => 'nullable|string|max:255',
        ]);

        $discountType = $validated['discount_type'] ?? $voucher->discount_type ?? 'fixed';
        $targetTiers = array_key_exists('target_tiers', $validated)
            ? (!empty($validated['target_tiers']) ? array_values(array_unique(array_map('intval', $validated['target_tiers']))) : null)
            : $voucher->target_tiers;

        $voucher->update([
            'code'              => strtoupper(trim($validated['code'])),
            'name'              => $validated['name'] ?? $voucher->name,
            'discount_type'     => $discountType,
            'discount_amount'   => $validated['discount_value'],
            'max_discount'      => $discountType === 'percent' ? ($validated['max_discount'] ?? 0) : 0,
            'min_order_value'   => $validated['min_order_amount'] ?? $voucher->min_order_value,
            'min_spent'         => $validated['min_spent'] ?? $voucher->min_spent,
            'membership_tier'   => $targetTiers ? min($targetTiers) : null,
            'target_tiers'      => $targetTiers,
            'distribution_mode' => $validated['distribution_mode'] ?? $voucher->distribution_mode,
            'usage_limit'       => $validated['usage_limit'] ?? $voucher->usage_limit,
            'start_date'        => $validated['start_date'] ?? $voucher->start_date,
            'expiration_date'   => isset($validated['end_date']) ? $validated['end_date'] . ' 23:59:59' : $voucher->expiration_date,
            'status'            => $validated['status'] ?? $voucher->status,
            'requirement'       => $validated['requirement'] ?? $voucher->requirement,
        ]);

        $voucher->loadCount('users');

        return response()->json([
            'message' => "Đã cập nhật voucher {$voucher->code}.",
            'data'    => $this->formatVoucher($voucher),
        ]);
    }

    /**
     * [ADMIN] Xóa Voucher
     */
    public function destroy($id)
    {
        $voucher = Voucher::findOrFail($id);
        $voucher->delete();

        return response()->json(['message' => 'Đã xóa voucher thành công.']);
    }

    /**
     * [CUSTOMER] Lấy danh sách voucher khả dụng cho tài khoản đang đăng nhập
     */
    public function availableForUser(Request $request)
    {
        $user = $request->user();
        $subtotal = (float) $request->query('subtotal', 0);

        $vouchers = Voucher::available()
            ->orderByDesc('discount_amount')
            ->get()
            ->filter(function (Voucher $v) use ($user) {
                // Nếu hết lượt sử dụng thì ẩn khỏi ví khách hàng
                if ($v->usage_limit > 0 && $v->used_count >= $v->usage_limit) {
                    return false;
                }
                // Nếu là voucher phát độc quyền (Ưu tiên cấp cao / Random) thì chỉ hiện cho người có tên
                if ($v->is_exclusive) {
                    return $v->users()
                        ->where('users.id', $user->id)
                        ->whereNull('user_vouchers.used_at')
                        ->exists();
                }
                // Nếu có giới hạn hạng thành viên thì chỉ hiện cho đúng hạng
                if (is_array($v->target_tiers) && count($v->target_tiers) > 0) {
                    return in_array((int) $user->membership_tier, array_map('intval', $v->target_tiers), true);
                }
                if (!is_null($v->membership_tier) && (int) $user->membership_tier < (int) $v->membership_tier) {
                    return false;
                }
                return true;
            })
            ->values()
            ->map(function (Voucher $v) use ($user, $subtotal) {
                $check = $v->validateForUser($user, $subtotal > 0 ? $subtotal : (float) $v->min_order_value);
                $data = $this->formatVoucher($v);
                $data['can_apply'] = $check['valid'];
                $data['reason'] = $check['valid'] ? null : $check['message'];
                $data['estimated_discount'] = $subtotal > 0 ? $v->calculateDiscount($subtotal) : 0;
                return $data;
            });

        return response()->json(['data' => $vouchers]);
    }

    /**
     * [CUSTOMER] Kiểm tra & tính thử số tiền giảm khi nhập mã tại Giỏ hàng / Checkout
     */
    public function apply(Request $request)
    {
        $request->validate([
            'code'     => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $code = strtoupper(trim($request->input('code')));
        $subtotal = (float) $request->input('subtotal');
        $user = $request->user();

        $voucher = Voucher::where('code', $code)->first();
        if (!$voucher) {
            return response()->json(['message' => 'Mã giảm giá không tồn tại.'], 404);
        }

        $check = $voucher->validateForUser($user, $subtotal);
        if (!$check['valid']) {
            return response()->json(['message' => $check['message']], 422);
        }

        $discountAmount = $voucher->calculateDiscount($subtotal);

        return response()->json([
            'message'         => $check['message'],
            'voucher'         => $this->formatVoucher($voucher),
            'discount_amount' => $discountAmount,
            'final_subtotal'  => max(0, $subtotal - $discountAmount),
        ]);
    }
}