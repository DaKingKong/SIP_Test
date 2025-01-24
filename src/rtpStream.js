const { spawn } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');

// Use ffmpeg to send audio stream to the RTP server
const ffmpegProcess = spawn(ffmpeg, [
    '-re',
    '-i', path.resolve('./src/audio/test.wav'), // Replace with your actual audio file
    '-f', 'rtp',
    `rtp://18.214.210.103:8000`
]);

ffmpegProcess.stdout.on('data', (data) => {
    console.log(`FFmpeg stdout: ${data}`);
});

ffmpegProcess.stderr.on('data', (data) => {
    console.error(`FFmpeg stderr: ${data}`);
});

ffmpegProcess.on('close', (code) => {
    console.log(`FFmpeg process exited with code ${code}`);
});