<?php 

if(isset($_POST['name']) && isset($_POST['email']) && isset($_POST['message'])){
	
	$name = $_POST['first-name'];
	$email = $_POST['email'];
	$to = "ameziane.allioui@gmail.com";
	$subject = "Portfolio : mail de ".$name;
	$message = $_POST['message'];

	ini_set("SMTP","aspmx.l.google.com");
	$headers = "MIME-Version: 1.0" . "\r\n";
	$headers .= "Content-type: text/html; charset=iso-8859-1" . "\r\n";
	$headers .= "From: ".$email."". "\r\n";

	if(mail($to, $subject, $message, $headers )){
		$response = 'Your message has been sent successfully !';
	}else{
		$response = 'Your message hasn\'t been sent. Please verify that you have correctly fill the form.';
	}

}else{
	$response = 'Your message hasn\'t been sent. Please verify that you have correctly fill the form.';
}

echo json_encode(['response' => $response]);

?>