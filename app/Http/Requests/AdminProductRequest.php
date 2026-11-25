<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isUpdating = $this->isMethod('PUT') || $this->isMethod('PATCH') || $this->route('id') !== null;

        return [
            'name'           => ['required', 'string', 'max:255'],
            'author'         => ['nullable', 'string', 'max:255'],
            'publisher'      => ['nullable', 'string', 'max:255'],
            'published_year' => ['nullable', 'integer', 'min:1000', 'max:2100'],
            'page_count'     => ['nullable', 'integer', 'min:1', 'max:50000'],
            'description'    => ['nullable', 'string'],
            'price'          => ['required', 'numeric', 'min:1'],
            'discount'       => ['nullable', 'integer', 'min:0', 'max:100'],
            'stock'          => ['required', 'integer', $isUpdating ? 'min:0' : 'min:1'],
            'category_id'    => ['required', 'integer', 'exists:categories,id'],
            'status'         => ['required', 'in:active,hidden'],
            'image'          => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png',
                'mimetypes:image/jpeg,image/png',
                'max:2048',
            ],
        ];
    }

    public function messages(): array
    {
        $isUpdating = $this->isMethod('PUT') || $this->isMethod('PATCH') || $this->route('id') !== null;

        return [
            'name.required'          => 'Vui lòng nhập tên sách.',
            'publisher.max'          => 'Tên nhà xuất bản không được vượt quá 255 ký tự.',
            'published_year.integer' => 'Năm xuất bản phải là số nguyên.',
            'published_year.min'     => 'Năm xuất bản không hợp lệ.',
            'published_year.max'     => 'Năm xuất bản không hợp lệ.',
            'page_count.integer'     => 'Số trang phải là số nguyên.',
            'page_count.min'         => 'Số trang phải lớn hơn 0.',
            'price.required'         => 'Vui lòng nhập giá.',
            'price.min'              => 'Giá phải lớn hơn 0.',
            'discount.integer'       => 'Phần trăm giảm giá phải là số nguyên.',
            'discount.min'           => 'Giảm giá không được nhỏ hơn 0%.',
            'discount.max'           => 'Giảm giá không được vượt quá 100%.',
            'stock.required'         => 'Vui lòng nhập tồn kho.',
            'stock.integer'          => 'Số lượng tồn kho phải là số nguyên.',
            'stock.min'              => $isUpdating
                ? 'Tồn kho không được âm.'
                : 'Khi thêm sách mới, số lượng tồn kho phải lớn hơn 0.',
            'category_id.required'   => 'Vui lòng chọn danh mục.',
            'category_id.exists'     => 'Danh mục không tồn tại.',
            'status.in'              => 'Trạng thái chỉ được là active hoặc hidden.',
            'image.mimes'            => 'Ảnh chỉ nhận định dạng JPG hoặc PNG.',
            'image.mimetypes'        => 'Tệp tải lên không phải ảnh JPG hoặc PNG hợp lệ.',
            'image.max'              => 'Ảnh không được vượt quá 2 MB.',
        ];
    }
}