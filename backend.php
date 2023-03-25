<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require("apikey.php");

$clientData = json_decode(file_get_contents('php://input'), true);

$bot_definition = "";

$messages = [
    ['role' => 'system', 'content' => $clientData['scn']],
    ['role' => 'assistant', 'content' => $clientData['log']],
    ['role' => 'user', 'content' => $clientData['act']]
];

$data = [
    'messages' => $messages,
    'model' => 'gpt-3.5-turbo',
];

$url = 'https://api.openai.com/v1/chat/completions';
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
    'txt' => $responseData['choices'][0]['message']['content'], // Extract the AI's message
];

// error handling
if($newState['txt'] == null) {
    $newState['err'] = json_encode($messages) . '\n\n' . $response;
}

echo json_encode($newState);
