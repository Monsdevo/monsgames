<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim(htmlspecialchars($_POST["email"]));
    $password = trim(htmlspecialchars($_POST["password"]));

    if (empty($email) || empty($password)) {
        die("Email veya şifre boş olamaz.");
    }

    $file = "users.txt";

    if (!file_exists($file)) {
        die("Kullanıcı verisi bulunamadı.");
    }

    // **Sadece izin verilen kullanıcılar**
    $allowedUsers = [
        "admin@monsgms.com",
        "kaanyilmaz@me.com",
        "drkaanyilmaz@gmail.com",
        "kaan_y@hotmail.com",
        "Erbilaysun@hotmail.com"
    ];

    $users = file($file, FILE_IGNORE_NEW_LINES);
    $userFound = false;

    foreach ($users as $user) {
        list($name, $storedEmail, $storedPassword) = explode(":", $user);

        if ($storedEmail == $email && $storedPassword == $password) {
            if (!in_array($email, $allowedUsers)) {
                header("Location: eyefind/index.html");
            }
            $_SESSION["user"] = $name; 
            $userFound = true;
            break;
        }
    }

    if ($userFound) {
        header("Location: happybirtday.html");
        exit();
    } else {
        header("Location: login.html"); 
        exit();
    }
}
?>
