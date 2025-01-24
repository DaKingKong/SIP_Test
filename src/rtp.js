// filepath: server.js
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const { spawn } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');
const ip = '127.0.0.1';
const port = 8000;

server.on('error', (err) => {
  console.log(`Server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`Server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  // Process the RTP packet here
});

server.on('listening', () => {
  const address = server.address();
  console.log(`Server listening ${address.address}:${address.port}`);
});

server.bind(port, ip); // Bind to port 8000 for RTP

// Use ffmpeg to send audio stream to the RTP server
// const ffmpegProcess = spawn(ffmpeg, [
//   '-re',
//   '-i', path.resolve('./src/audio/test.wav'), // Replace with your actual audio file
//   '-f', 'rtp',
//   `rtp://${ip}:${port}`
// ]);

// ffmpegProcess.stdout.on('data', (data) => {
//   console.log(`FFmpeg stdout: ${data}`);
// });

// ffmpegProcess.stderr.on('data', (data) => {
//   console.error(`FFmpeg stderr: ${data}`);
// });

// ffmpegProcess.on('close', (code) => {
//   console.log(`FFmpeg process exited with code ${code}`);
// });