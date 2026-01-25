<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Formdan gelen veriyi al ve temizle
    $name = trim($_POST["name"]);  // Kullanıcı adı
    $email = trim($_POST["email"]); // Email
    $password = trim($_POST["password"]); // Şifre

    // Boş alanları kontrol et
    if (empty($name) || empty($email) || empty($password)) {
        die("Name, Email veya şifre boş olamaz.");
    }

    // users.txt dosyasının adı
    $file = "users.txt";

    // Eğer dosya yoksa, oluşturuluyor
    if (!file_exists($file)) {
        // Dosya oluşturuluyor ve ilk satır ekleniyor
        file_put_contents($file, "");
    }

    // Kullanıcı verisini oluştur
    $data = "$name:$email:$password\n";

    // Dosyaya ekle (FILE_APPEND ile dosyanın sonuna yazılır)
    if (file_put_contents($file, $data, FILE_APPEND) === false) {
        die("Hata! Kullanıcı verisi kaydedilemedi.");
    }

    header("Location: loginregister.html");
}
?>
