<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlaceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $merged = [];

        if ($this->has('phone') && is_string($this->phone)) {
            $merged['phone'] = preg_replace('/\s+/', '', $this->phone);
        }

        if ($this->has('payment_method') && is_string($this->payment_method)) {
            $merged['payment_method'] = strtolower(trim($this->payment_method));
        }

        if (!empty($merged)) {
            $this->merge($merged);
        }
    }

    public function rules(): array
    {
        return [
            'receiver_name'   => ['required', 'string', 'max:100'],
            'phone'           => ['required', 'regex:/^0\d{9}$/'],
            'email'           => ['nullable', 'email', 'max:255'],
            'address'         => ['required', 'string', 'max:500'],
            'payment_method'  => ['required', 'string', 'in:cod,vnpay,momo'],
            'shipping_method' => ['nullable', 'string', 'in:standard,express'],
            'shipping_fee'    => ['nullable', 'numeric', 'min:0'],
            'note'            => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'receiver_name.required'  => 'Vui lòng nhập tên người nhận.',
            'receiver_name.max'       => 'Tên người nhận tối đa 100 ký tự.',
            'phone.required'          => 'Vui lòng nhập số điện thoại.',
            'phone.regex'             => 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.',
            'email.email'             => 'Địa chỉ email không hợp lệ.',
            'address.required'        => 'Vui lòng nhập địa chỉ nhận hàng.',
            'address.max'             => 'Địa chỉ quá dài (tối đa 500 ký tự).',
            'payment_method.required' => 'Vui lòng chọn phương thức thanh toán.',
            'payment_method.in'       => 'Phương thức thanh toán không hợp lệ (chỉ hỗ trợ COD, VNPay hoặc MoMo).',
            'shipping_method.in'      => 'Phương thức vận chuyển không hợp lệ.',
            'note.max'                => 'Ghi chú tối đa 1000 ký tự.',
        ];
    }
}