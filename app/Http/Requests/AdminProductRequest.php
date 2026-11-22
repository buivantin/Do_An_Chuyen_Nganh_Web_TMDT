<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // quyền admin đã kiểm tra ở middleware của route
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:255'],
            'author'      => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price'       => ['required', 'integer', 'min:1'],
            'stock'       => ['required', 'integer', 'min:0'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'status'      => ['required', 'in:active,hidden'],
            'image'       => ['nullable', 'file', 'mimes:jpg,jpeg,png', 'mimetypes:image/jpeg,image/png', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'        => 'Vui lòng nhập tên sách.',
            'price.required'       => 'Vui lòng nhập giá.',
            'price.min'            => 'Giá phải lớn hơn 0.',
            'stock.required'       => 'Vui lòng nhập tồn kho.',
            'stock.min'            => 'Tồn kho không được âm.',
            'category_id.required' => 'Vui lòng chọn danh mục.',
            'category_id.exists'   => 'Danh mục không tồn tại.',
            'status.in'            => 'Trạng thái chỉ được là active hoặc hidden.',
            'image.mimes'          => 'Ảnh chỉ nhận định dạng JPG hoặc PNG.',
            'image.mimetypes'      => 'Tệp tải lên không phải ảnh JPG hoặc PNG hợp lệ.',
            'image.max'            => 'Ảnh không được vượt quá 2 MB.',
        ];
    }
}
