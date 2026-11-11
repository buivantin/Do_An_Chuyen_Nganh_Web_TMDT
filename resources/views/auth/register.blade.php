<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Đăng ký</title>
</head>
<body>
    <h1>Đăng ký tài khoản</h1>

    @if (session('success'))
        <p style="color:green">{{ session('success') }}</p>
    @endif

    <form method="POST" action="{{ route('register') }}">
        @csrf

        <div>
            <label>Tên đăng nhập</label>
            <input type="text" name="username" value="{{ old('username') }}">
            @error('username') <p style="color:red">{{ $message }}</p> @enderror
        </div>

        <div>
            <label>Email</label>
            <input type="text" name="email" value="{{ old('email') }}">
            @error('email') <p style="color:red">{{ $message }}</p> @enderror
        </div>

        <div>
            <label>Mật khẩu</label>
            <input type="password" name="password">
            @error('password') <p style="color:red">{{ $message }}</p> @enderror
        </div>

        <div>
            <label>Nhập lại mật khẩu</label>
            <input type="password" name="password_confirmation">
        </div>

        <button type="submit">Đăng ký</button>
    </form>
</body>
</html>