<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Đăng nhập</title>
</head>
<body>
    <h1>Đăng nhập</h1>

    <form method="POST" action="{{ route('login') }}">
        @csrf

        <div>
            <label for="email">Email</label>
            <input type="email" id="email" name="email" value="{{ old('email') }}" autocomplete="email">
            @error('email') <p style="color:red">{{ $message }}</p> @enderror
        </div>

        <div>
            <label for="password">Mật khẩu</label>
            <input type="password" id="password" name="password" autocomplete="current-password">
            @error('password') <p style="color:red">{{ $message }}</p> @enderror
        </div>

        <div>
            <label><input type="checkbox" name="remember" value="1"> Ghi nhớ đăng nhập</label>
        </div>

        <button type="submit">Đăng nhập</button>
    </form>
</body>
</html>