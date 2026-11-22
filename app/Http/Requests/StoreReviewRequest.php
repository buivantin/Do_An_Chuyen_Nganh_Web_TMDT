<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'rating'     => ['required', 'integer', 'min:1', 'max:5'],
            'comment'    => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Thiếu thông tin sản phẩm cần đánh giá.',
            'product_id.exists'   => 'Sản phẩm không tồn tại.',
            'rating.required'     => 'Vui lòng chọn số sao đánh giá (từ 1 đến 5 sao).',
            'rating.integer'      => 'Số sao đánh giá không hợp lệ.',
            'rating.min'          => 'Đánh giá tối thiểu là 1 sao.',
            'rating.max'          => 'Đánh giá tối đa là 5 sao.',
            'comment.max'         => 'Nội dung nhận xét tối đa 1000 ký tự.',
        ];
    }
}