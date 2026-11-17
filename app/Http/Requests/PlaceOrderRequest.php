<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PlaceOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'address' => ['required', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return ['address.required' => 'Vui lòng nhập địa chỉ nhận hàng.'];
    }
}