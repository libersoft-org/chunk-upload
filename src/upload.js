window.part = 0;
window.chunksize = 20971520;
window.sizeuploaded = 0;
window.totalElapsedTime = 0;
window.totalLoaded = 0;
window.uploaders = [];

LoadUploaderTemplate();

$('#files').on('change', function() {
 $('#uploaders').empty();
 window.uploaders = [];
 for (var i = 0; i < this.files.length; i++) {
  AddUploader(this.files[i]);
 }
});

$('#upload').click(function() {
 StartUpload(window.uploaders.shift());
 $('#files-buttons').hide();
});

function AddUploader(file) {
 var uploader = $('<div>' + window.tmplUploader + '</div>').clone();
 $('#uploaders').append(uploader);
 uploader.find('.filename').text(file.name);
 var stateHTML = '<tr><td>Status:</td><td class="status" style="color: #DD6000;">In queue ...</td></tr>';
 stateHTML += '<tr><td>File size:</td><td>' + HumanSize(file.size) + '</td></tr>';
 uploader.find('.state').html(stateHTML);
 window.uploaders.push({
  ui: uploader,
  file: file
 });
}

function StartUpload(uploader) {
 window.currentUi = uploader['ui'];
 window.currentFile = uploader['file'];
 $.ajax({
  url: 'upload.php',
  type: 'POST',
  data: { 'action': 'new' },
  success: function(data) {
   var result = jQuery.parseJSON(data);
   if (result.error == 0) {
    window.part = 0;
    window.sizeuploaded = 0;
    window.totalElapsedTime = 0;
    window.totalLoaded = 0;
    var blob = GetBlob();
    Add(result.message, blob);
   } else {
    window.currentUi.find('.status').css('color', '#FF0000');
    window.currentUi.find('.status').text('Error: ' + result.message);
   }
  }
 });
}

function Add(filename, blob) {
 var startTime = new Date().getTime();
 var fd = new FormData();
 fd.append('files', blob);
 fd.append('action', 'add');
 fd.append('filename', filename);
 $.ajax({
  contentType: false,
  processData: false,
  url: 'upload.php',
  type: 'POST',
  data: fd,
  xhr: function() {
   var myXhr = $.ajaxSettings.xhr();
   if (myXhr.upload) {
    myXhr.upload.addEventListener('progress', function(e) {
     if (e.lengthComputable) {
      window.sizeuploaded = (window.part * window.chunksize) + e.loaded;
      var percent = window.currentFile.size != 0 ? (100 / window.currentFile.size) * window.sizeuploaded : 0;
      if (percent > 100) percent = 100;
      window.currentUi.find('.progress-state').css('width', percent + '%');
      window.currentUi.find('.percent').text(Math.round(percent) + ' %');
      var elapsedTime = (new Date().getTime()) - startTime;
      window.totalElapsedTime += elapsedTime;
      window.totalLoaded += e.loaded;
      var stateHTML = '<tr><td>Status:</td><td class="status" style="color: #0000FF;">Uploading ...</td></tr>';
      stateHTML += '<tr><td>Uploaded:</td><td>' + (window.sizeuploaded <= window.currentFile.size ? HumanSize(window.sizeuploaded) : HumanSize(window.currentFile.size)) + ' / ' + HumanSize(window.currentFile.size) + '</td></tr>';
      stateHTML += '<tr><td>Current speed:</td><td>' + HumanSize((e.loaded / elapsedTime) * 1000) + ' / s</td></tr>';
      stateHTML += '<tr><td>Average speed:</td><td>' + HumanSize((totalLoaded / totalElapsedTime) * 1000) + ' / s</td></tr>';
      window.currentUi.find('.state').html(stateHTML);
     }
    }, false);
   }
   return myXhr;
  },
  success: function(data) {
   var result = jQuery.parseJSON(data);
   if (result.error == 0) {
    window.part++;
    var blob = GetBlob();
    if (blob.size != 0) Add(filename, blob);
    else Done(filename, window.currentUi.find('.filename').text());
   } else {
    window.currentUi.find('.status').css('color', '#FF0000');
    window.currentUi.find('.status').text('Error: ' + result.message);
   }
  }
 });
}

function GetBlob() {
 return window.currentFile.slice(window.part * window.chunksize, (window.part + 1) * window.chunksize);
}

function Done(originalFile, newFile) {
 
 $.ajax({
  url: 'upload.php',
  type: 'POST',
  data: {
   action: 'done',
   original: originalFile,
   new: newFile
  },
  success: function(data) {
   var result = jQuery.parseJSON(data);
   if (result.error == 0) {
    window.currentUi.find('.status').css('color', '#009000');
    window.currentUi.find('.status').text('Done.');
    var uploader = window.uploaders.shift();
    if (uploader) StartUpload(uploader);
   } else {
    window.currentUi.find('.status').css('color', '#FF0000');
    window.currentUi.find('.status').text('Error: ' + result.message);
   }
  }
 });
}

function HumanSize(bytes) {
 var type = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
 var i = 0;
 while (bytes >= 1024) {
  bytes /= 1024;
  i++;
 }
 return (Math.round(bytes * 100) / 100) + ' ' + type[i] + 'B';
}

function LoadUploaderTemplate() {
 $.ajax({
  url: 'upload-template.html',
  success: function(data) {
   window.tmplUploader = data;
  }
 });
}
