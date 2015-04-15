var webAudioAPI = require('web-audio-api');
var AudioContext = webAudioAPI.AudioContext;
var context = new AudioContext();
var XMLHttpRequest = require("xhr2").XMLHttpRequest;
var width = 700; // hardcoded, but it will be a parameter

function loadBuffer(context, path, cb) {
    var request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      context.decodeAudioData(request.response, function(theBuffer) {
        cb(null, theBuffer);
      }, function(err) {
        cb(err);
      });
    }
    request.send();
}

function getPeaks(audioBuffer, length) {
    var buffer = audioBuffer;
    var sampleSize = buffer.length / length;
    var sampleStep = ~~(sampleSize / 10) || 1;
    var channels = buffer.numberOfChannels;
    var peaks = new Float32Array(length);

    for (var c = 0; c < channels; c++) {
        var chan = buffer.getChannelData(c);
        for (var i = 0; i < length; i++) {
            var start = ~~(i * sampleSize);
            var end = ~~(start + sampleSize);
            var max = 0;
            for (var j = start; j < end; j += sampleStep) {
                var value = chan[j];
                if (value > max) {
                    max = value;
                // faster than Math.abs
                } else if (-value > max) {
                    max = -value;
                }
            }
            if (c == 0 || max > peaks[i]) {
                peaks[i] = max;
            }
        }
    }
    
    return peaks;
}

// var path = 'https://audio.dentalmarketing.net/RE94fc9e7d51c0ecf9ede3669582c0167a.mp3';
var path = 'http://freedownloads.last.fm/download/378349157/After%2BThe%2BRain.mp3';
var buffer, peaks;

var cb = function callback(err, loadedBuffer) {
    buffer = loadedBuffer;
    peaks = getPeaks(buffer, width);
    console.log(peaks);
};

loadBuffer(context, path, cb);
