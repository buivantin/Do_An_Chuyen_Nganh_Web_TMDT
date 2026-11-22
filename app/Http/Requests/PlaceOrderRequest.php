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
            'receiver_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'regex:/^0\d{9}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'receiver_name.required' => 'Vui lòng nhập tên người nhận.',
            'phone.required'         => 'Vui lòng nhập số điện thoại.',
            'phone.regex'            => 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.',
            'address.required'       => 'Vui lòng nhập địa chỉ nhận hàng.',
            'address.max'            => 'Địa chỉ quá dài (tối đa 500 ký tự).',
        ];
    }
}