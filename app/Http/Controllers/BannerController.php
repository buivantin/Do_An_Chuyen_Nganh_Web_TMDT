<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class BannerController extends Controller
{
    /**
     * Format bản ghi Banner trả về đồng nhất cho cả Storefront và Admin
     */
    private function formatBanner(Banner $b): array
    {
        $product = $b->product;
        $productImage = $product?->image_path ?? $product?->image;

        return [
            'id'           => $b->id,
            'badge_text'   => $b->badge_text,
            'title'        => $b->title,
            'description'  => $b->description,
            'quote'        => $b->promo_label,
            'promo_label'  => $b->promo_label,
            'image'        => $b->image,
            'banner_image' => $b->image,
            'product_id'   => $b->product_id,
            'book_id'      => $b->product_id,
            'book_title'   => $product?->name ?? $product?->title,
            'book_author'  => $product?->author,
            'book_image'   => $productImage,
            'sort_order'   => (int) ($b->sort_order ?? 0),
            'status'       => $b->status ?: 'active',
        ];
    }

    /**
     * Public API: Danh sách banner đang hiển thị trên trang chủ
     */
    public function index()
    {
        $banners = Banner::with('product')
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Banner $b) => $this->formatBanner($b));

        return response()->json(['data' => $banners]);
    }

    /**
     * Admin API: Toàn bộ danh sách banner (kể cả đang ẩn)
     */
    public function adminIndex()
    {
        $banners = Banner::with('product')
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Banner $b) => $this->formatBanner($b));

        return response()->json(['data' => $banners]);
    }

    /**
     * Admin API: Thêm banner mới (hỗ trợ upload file ảnh hoặc URL)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'badge_text'   => 'nullable|string|max:255',
            'quote'        => 'nullable|string|max:500',
            'promo_label'  => 'nullable|string|max:500',
            'description'  => 'nullable|string|max:2000',
            'product_id'   => 'nullable|integer|exists:products,id',
            'book_id'      => 'nullable|integer|exists:products,id',
            'sort_order'   => 'nullable|integer|min:0',
            'status'       => 'nullable|in:active,inactive',
            'image_file'   => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'banner_image' => 'nullable|string|max:1000',
            'image'        => 'nullable|string|max:1000',
        ]);

        $imagePath = $this->handleImageUpload($request, null);

        $banner = Banner::create([
            'badge_text'  => $validated['badge_text'] ?? 'Ấn phẩm & Trích dẫn nổi bật',
            'title'       => trim($validated['title']),
            'description' => $validated['description'] ?? null,
            'promo_label' => $validated['quote'] ?? $validated['promo_label'] ?? null,
            'image'       => $imagePath,
            'product_id'  => $validated['product_id'] ?? $validated['book_id'] ?? null,
            'sort_order'  => (int) ($validated['sort_order'] ?? 0),
            'status'      => $validated['status'] ?? 'active',
        ]);

        $banner->load('product');

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm banner quảng cáo mới!',
            'data'    => $this->formatBanner($banner),
        ], 201);
    }

    /**
     * Admin API: Cập nhật banner (hỗ trợ multipart/form-data qua POST _method=PUT hoặc PUT)
     */
    public function update(Request $request, int $id)
    {
        $banner = Banner::findOrFail($id);

        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'badge_text'   => 'nullable|string|max:255',
            'quote'        => 'nullable|string|max:500',
            'promo_label'  => 'nullable|string|max:500',
            'description'  => 'nullable|string|max:2000',
            'product_id'   => 'nullable|integer|exists:products,id',
            'book_id'      => 'nullable|integer|exists:products,id',
            'sort_order'   => 'nullable|integer|min:0',
            'status'       => 'nullable|in:active,inactive',
            'image_file'   => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'banner_image' => 'nullable|string|max:1000',
            'image'        => 'nullable|string|max:1000',
        ]);

        $imagePath = $this->handleImageUpload($request, $banner->image);

        $banner->update([
            'badge_text'  => $validated['badge_text'] ?? $banner->badge_text,
            'title'       => trim($validated['title']),
            'description' => $validated['description'] ?? null,
            'promo_label' => $validated['quote'] ?? $validated['promo_label'] ?? null,
            'image'       => $imagePath,
            'product_id'  => $request->has('product_id') || $request->has('book_id')
                ? ($validated['product_id'] ?? $validated['book_id'] ?? null)
                : $banner->product_id,
            'sort_order'  => $request->has('sort_order')
                ? (int) ($validated['sort_order'] ?? 0)
                : $banner->sort_order,
            'status'      => $validated['status'] ?? $banner->status,
        ]);

        $banner->load('product');

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật banner quảng cáo!',
            'data'    => $this->formatBanner($banner),
        ]);
    }

    /**
     * Admin API: Bật / tắt nhanh trạng thái hiển thị banner
     */
    public function toggleStatus(int $id)
    {
        $banner = Banner::findOrFail($id);
        $banner->status = $banner->status === 'active' ? 'inactive' : 'active';
        $banner->save();
        $banner->load('product');

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật trạng thái hiển thị banner.',
            'data'    => $this->formatBanner($banner),
        ]);
    }

    /**
     * Admin API: Xóa banner và dọn dẹp file ảnh local nếu có
     */
    public function destroy(int $id)
    {
        $banner = Banner::findOrFail($id);

        if ($banner->image && str_starts_with($banner->image, '/imgs/banners/')) {
            $localFile = public_path(ltrim($banner->image, '/'));
            if (File::exists($localFile)) {
                File::delete($localFile);
            }
        }

        $banner->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa banner quảng cáo.',
        ]);
    }

    /**
     * Lưu file ảnh vào public/imgs/banners/ hoặc giữ URL/đường dẫn hiện tại
     */
    private function handleImageUpload(Request $request, ?string $currentImage): ?string
    {
        if ($request->hasFile('image_file') && $request->file('image_file')->isValid()) {
            $dir = public_path('imgs/banners');
            if (!File::exists($dir)) {
                File::makeDirectory($dir, 0755, true);
            }

            if ($currentImage && str_starts_with($currentImage, '/imgs/banners/')) {
                $oldFile = public_path(ltrim($currentImage, '/'));
                if (File::exists($oldFile)) {
                    File::delete($oldFile);
                }
            }

            $file = $request->file('image_file');
            $ext = strtolower($file->getClientOriginalExtension() ?: 'jpg');
            $filename = 'banner_' . now()->format('YmdHis') . '_' . Str::random(6) . '.' . $ext;
            $file->move($dir, $filename);

            return '/imgs/banners/' . $filename;
        }

        $manualUrl = trim((string) ($request->input('banner_image') ?? $request->input('image') ?? ''));
        return $manualUrl !== '' ? $manualUrl : $currentImage;
    }
}