<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require("apikey.php");

$clientData = json_decode(file_get_contents('php://input'), true);

$text = $clientData['text'];

$data = [
    'prompt' => $text,
    'n' => 1,
    'size' => '1024x1024'
];

$url = 'https://api.openai.com/v1/images/generations';
$headers = array(
    'Content-Type: application/json',
    'Authorization: Bearer ' . $api_key
);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
curl_close($ch);

$responseData = json_decode($response, true);

$newState = [
    'img_url' => $responseData['data'][0]['url'], // Extract the image URL
];

if ($newState['img_url'] == null) {
    $newState['err'] = 'Error getting image URL: ' . $response;
}

echo json_encode($newState);
