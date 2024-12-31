const fs = require('fs');
const Speaker = require('speaker');
const audioStream = fs.createReadStream('./src/audio/test1.wav');

// Create a speaker instance
const speaker = new Speaker({
    channels: 2,          // 2 channels (stereo)
    bitDepth: 16,         // 16-bit samples
    sampleRate: 44100     // 44,100 Hz sample rate
});

// Pipe the audio stream to the speaker
audioStream.pipe(speaker);