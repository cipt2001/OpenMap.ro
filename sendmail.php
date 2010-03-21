<?php
$to      = 'contact@openmap.ro';
$subject = $_POST['subiect'];
$message = $_POST['mesaj'];
$headers = 'From: ' . $_POST['nume'] . " <" . $_POST['email'] . ">\r\n" .
    'Reply-To: ' . $_POST['email'] . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

mail($to, $subject, $message, $headers);
?>
