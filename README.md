# About Chunk upload

**Chunk upload** is a simple web software written in jQuery (client side) and PHP (server side) that helps you to send large files divided into chunks to your web server. This software is open source developed under [**Unlicense**](./LICENSE).

## Prerequisites
- Web server (Apache, Nginx or other)
- PHP 5+

## Features
- Very small code size
- Large files upload
- Multiple files upload
- Progress bar
- Download speed

## Installation
1. Upload the content of the "src" folder to your web server
2. Create "temp" and "done" folders in the same folder as source files and set the "777" right on both of them using:

```console
chmod 777 temp
chmod 777 done
```

3. Set the following values in your "php.ini" configuration file:

- upload_max_filesize = 30M
- post_max_size       = 40M
- memory_limit        = 512M
- max_execution_time  = 600

## Configuration
- You can set the chunk size in the "upload.js" file by editing the value "window.chunksize" at the beggining of this file. This size represents the number of bytes (default: 20971520 = 20 MB). This value has to be lower than the values of "upload_max_filesize" and "post_max_size" in your "php.ini" file.
- You can change "temp" and "done" folders in "upload.php" file ("temp" is for files that are being uploaded, "done" is for sucessfully uploaded files)

## Files description
- "index.html" - Chunk uploader index page
- "style.css" - Style sheet file for index page
- "upload.js" - Client side upload jQuery script
- "upload.php" - Server side upload PHP script
- "upload-template.html" - HTML template
