<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdminProductRequest;
use App\Services\AdminProductService;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    public function __construct(private AdminProductService $products)
    {
    }

    public function index(Request $request)
    {
        $paginator = $this->products->paginate(
            $request->only(['keyword', 'category_id', 'status', 'stock_status'])
        );

        return response()->json(array_merge(
            $paginator->toArray(),
            ['stock_alerts' => $this->products->getStockAlerts()]
        ));
    }

    public function show(int $id)
    {
        return response()->json($this->products->find($id));
    }

    public function store(AdminProductRequest $request)
    {
        $product = $this->products->create($request->validated(), $request->file('image'));

        return response()->json($product, 201);
    }

    public function update(AdminProductRequest $request, int $id)
    {
        $product = $this->products->update($id, $request->validated(), $request->file('image'));

        return response()->json($product);
    }

    public function toggleStatus(int $id)
    {
        return response()->json($this->products->toggleStatus($id));
    }

    public function destroy(int $id)
    {
        $type = $this->products->delete($id);

        return response()->json([
            'message' => $type === 'soft'
                ? 'Sản phẩm đã có trong đơn hàng nên được ẩn (xóa mềm).'
                : 'Đã xóa sản phẩm.',
        ]);
    }
}