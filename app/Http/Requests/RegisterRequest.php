<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'username' => trim((string) $this->username),
            'email'    => mb_strtolower(trim((string) $this->email)),
            'phone'    => $this->phone ? trim((string) $this->phone) : null,
        ]);
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'min:2', 'max:100', 'regex:/^[\p{L}\s]+$/u'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone'    => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8', 'max:64', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.required'  => 'Vui lòng nhập họ và tên.',
            'username.min'       => 'Họ và tên phải có ít nhất 2 ký tự.',
            'username.max'       => 'Họ và tên không được vượt quá 100 ký tự.',
            'username.regex'     => 'Họ và tên chỉ được gồm chữ cái và khoảng trắng.',

            'email.required'     => 'Vui lòng nhập email.',
            'email.email'        => 'Email không đúng định dạng.',
            'email.max'          => 'Email không được vượt quá 255 ký tự.',
            'email.unique'       => 'Email này đã được đăng ký.',

            'password.required'  => 'Vui lòng nhập mật khẩu.',
            'password.min'       => 'Mật khẩu phải có ít nhất 8 ký tự.',
            'password.max'       => 'Mật khẩu không được vượt quá 64 ký tự.',
            'password.confirmed' => 'Mật khẩu nhập lại không khớp.',
        ];
    }
}