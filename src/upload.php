<?php
 $GLOBALS['temp'] = './temp/';
 $GLOBALS['done'] = './done/';
 switch ($_POST['action']) {
  case 'new':
   echo NewFile();
   break;
  case 'add':
   echo Add($_POST['filename']);
   break;
  case 'done':
   echo Done($_POST['original'], $_POST['new']);
   break;
 }
 
 function NewFile() {
  $name = sha1(microtime(true) . rand(0, 10000000000000000000000000));
  $file = $GLOBALS['temp'] . $name;
  if (!file_exists($file)) {
   if (is_writable($GLOBALS['temp'])) {
    touch($file);
    return json_encode(array('error' => 0, 'message' => $name));
   } else return json_encode(array('error' => 2, 'message' => 'Cannot create new file.'));
  } else return json_encode(array('error' => 1, 'message' => 'This file already exists.'));
 }
 
 function Add($filename) {
  if (file_exists($GLOBALS['temp'] . $filename)) {
   $data = fopen($_FILES['files']['tmp_name'], 'r');
   file_put_contents($GLOBALS['temp'] . $filename, $data, FILE_APPEND);
   return json_encode(array('error' => 0, 'message' => 'OK'));
  } else return json_encode(array('error' => 1, 'message' => 'File does not exist.'));
 }
 
 function Done($original, $new) {
  if (file_exists($GLOBALS['temp'] . $original)) {
   if (is_file($GLOBALS['temp'] . $original)) {
    if (is_writable($GLOBALS['done'])) {
     if (!file_exists($GLOBALS['done'] . $new)) {
      rename($GLOBALS['temp'] . $original, $GLOBALS['done'] . $new);
      return json_encode(array('error' => 0, 'message' => 'OK'));
     } else return json_encode(array('error' => 3, 'message' => 'Cannot write file, because it already exists in destination directory.'));
    } else return json_encode(array('error' => 3, 'message' => 'Cannot move uploaded file to destination directory.'));
   } else return json_encode(array('error' => 2, 'message' => 'Specified file name is not a file, but directory.'));
  } else return json_encode(array('error' => 1, 'message' => 'File does not exist.'));
 }
?>
