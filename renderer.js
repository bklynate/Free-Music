const fs = require('fs');
const path = require('path');
const request = require('request');
const open = require('open');
const ffmetadata = require("ffmetadata");
const YoutubeMp3Downloader = require('youtube-mp3-downloader');


$(document).ready(function(){
  
  $("#trackInput").focus();

  $("#search").click(function(e){
    e.preventDefault()
    $("#copyright").remove()
    var query = $("#trackInput").val();
    $(".results").html("");
    $("#trackInput").val("")
    $(".results").html(`
        <div id="loadingGif" style="width: 100%; margin-top: 50px;">
          <div style="width: 201px; margin: auto; opacity: 0.3;">
            <img src="loading.gif" class="img-responsive" />
          </div>
        </div>
      `)



 	request('https://www.googleapis.com/youtube/v3/search?q='+query+'&part=snippet&maxResults=50&topicId=/m/04rlf&type=video&key=AIzaSyDQX7BTPgUldYCJeRAuwTgFiGD9uH-I-LA', function(err, data){
 	   if(err) return console.log(err);
 	   var songs = JSON.parse(data.body).items;
 	   var songList = [];
 	   for(let i in songs){
 	     var name = songs[i].snippet.title.split('-');
 	     if(name.length > 1) {
 	       var song = {
 	         title: songs[i].snippet.title,
 	         id: songs[i].id.videoId
 	       }
 	       songList.push(song);
 	     }
 	   }
 	   data = songList
 	   console.log(data)
 	   $("#loadingGif").fadeOut(500, function(){
 	   	$(".results").html("<div id='resultPanel' style='display: none'></div>")
 	   	for(i in data){
 	   	  $("#resultPanel").append(`<div class='resultTab'>
 	   	    <span data-id='`+data[i].id+`' data-title='`+data[i].title+`' data-toggle='modal'
 	   	     data-target='#myModal' class='glyphicon glyphicon-download icon-right'></span>
 	   	    `+data[i].title+`
 	   	    </div>`)
 	   	}
 	   	$('#resultPanel').fadeIn(500)
 	   })
	
 	});
    return false;
  })


  $("body").on("click", ".icon-right", function(){
    var track = $(this).data('title').split("-");
    var artist = track[0] ? track[0].trim() : "";
    var title = track[1] ? track[1].trim() : "";

    $("#artistInput").val(artist);
    $("#trackInput2").val(title);
    $("#submit2").attr("data-idtarget", $(this).data('id'))
    
  })

  
  $("#submit2").click(function(){


    $('#progressModal').modal({
      backdrop: 'static',
      keyboard: false
    }); 

	var id = $(this).attr('data-idtarget'),
	    artist = $('#artistInput').val(),
	    title = $('#trackInput2').val(),
	    album = $('#albumInput').val(),
	    track = artist + ' - ' + title + '.mp3';
	
	
	process.env['PATH'] = '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin'
	//Configure YoutubeMp3Downloader with your settings 
	var YD = new YoutubeMp3Downloader({
	    "ffmpegPath": path.join(__dirname + "/ffmpeg"),        // Where is the FFmpeg binary located? 
	    "outputPath": path.join(__dirname + "/Music"),                // Where should the downloaded and encoded files be stored? 
	    "youtubeVideoQuality": "highest",       // What video quality should be used? 
	    "queueParallelism": 2,                  // How many parallel downloads/encodes should be started? 
	    "progressTimeout": 2000                 // How long should be the interval of the progress reports 
	});
	 
	//Download video and save as MP3 file 
	YD.download(id, track);
	 
	YD.on("finished", function(data) {
	  var songInfo = { artist, title, album }
	
	  $("#downProgress").attr("aria-valuenow", "0").attr("style", "width: 0%;");
	  $("#progressModal").modal("hide");
	
	    ffmetadata.write(path.join(__dirname + ('/Music/' + track)) , songInfo, function(err){
	        if(err) console.log(err);
	        open(path.join(__dirname + ('/Music/' + track)));
	    })
	
	});
	 
	YD.on("error", function(error) {
	    console.log(error)
	});
	 
	YD.on("progress", function(progressO) {
	  console.log(progressO)
	  $('#downProgress').show()
	  var progress = parseInt(progressO.progress.percentage)
	  $('#downProgress').css('width', progress +'%').attr('aria-valuenow', progress);
	})

  })
})

$('.jumbotron').slideToggle()

setTimeout(function(){
  $('.container-fluid').fadeIn(2000)
  $('#loadingScreen').fadeOut(1000, function(){
    $("#mainLogo").fadeIn(1000)
    $('.jumbotron').slideToggle(1000)
    $('.main-content').fadeIn(500)
  })
  
}, 3000);
 





