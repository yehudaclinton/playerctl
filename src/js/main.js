import { runSSHCommand } from './ssh.js';

// Wait for HTML to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const sshBtn = document.getElementById('sshBtn');
  const playPause = document.getElementById('playPause');
  const stopin5 = document.getElementById('stopin5');
  const lock = document.getElementById('lock');
  const next = document.getElementById('next');
  const outputBox = document.getElementById('output');

  const volSlider = document.getElementById('volume');
  const volDisplay = document.getElementById('vol-display');

  async function toggleBtn(btn) {
    const playStatus = (await runSSHCommand('playerctl status')).trim();
    btn.textContent = (playStatus === 'Playing') ? '⏸ Pause' : '▶ Play'; 
  }

  sshBtn.addEventListener('click', async () => {
    console.log('metadata '+this);
    outputBox.textContent = "Running metadata...";
    try {
      const result = await runSSHCommand('playerctl metadata');
      outputBox.textContent = result;
    } catch (e) { outputBox.textContent = "Error: " + e.message; }
  });

  playPause.addEventListener('click', async () => {
    outputBox.textContent = "playpause...";
    try {
      await runSSHCommand('playerctl play-pause');
      toggleBtn(playPause);
    } catch (e) { outputBox.textContent = "Error: " + e.message; }
  });

  stopin5.addEventListener('click', async () => {
    outputBox.textContent = "Stopping in 5 minutes...";
    try {
      const result = await runSSHCommand('sleep 500 && playerctl stop');
      outputBox.textContent = "Stopped: " + result;
    } catch (e) { outputBox.textContent = "Error: " + e.message; }
  });

  lock.addEventListener('click', async () => {
    outputBox.textContent = "Locking...";
    try {
      const status = await runSSHCommand('gnome-screensaver-command -q');
      outputBox.textContent += "\nstatus: " + status;
      if (status.includes('active')) {
        outputBox.textContent += "\n if";
        await runSSHCommand('gnome-screensaver-command -l');
        lock.textContent = '🔓 Unlock';
      } else {
        outputBox.textContent += "\n else";
        await runSSHCommand('gnome-screensaver-command -d');
        lock.textContent = '🔒 lock';
      }
    } catch (e) { outputBox.textContent = "Error: " + e.message; }
  });

  next.addEventListener('click', async () => {
    outputBox.textContent = "next...";
    try {
      const result = await runSSHCommand('playerctl next');
      outputBox.textContent = result;
      result = await runSSHCommand('playerctl metadata');
      outputBox.textContent = result;
    } catch (e) { outputBox.textContent = "Error: " + e.message; }
  });

    //////////////////////// volume ////////////////////////
  async function updateVolumeUI() {
    try {
      const vol = await runSSHCommand('wpctl get-volume @DEFAULT_AUDIO_SINK@');
      // output is "Volume: 0.50" — grab the number after the space
      const percent = Math.round(parseFloat(vol.trim().split(' ')[1]) * 100);
      volSlider.value = percent;
      volDisplay.textContent = percent;
    } catch (e) {
      console.error("Vol fetch error:", e);
    }
  }

  volSlider.addEventListener('input', async () => {
    const percent = volSlider.value;
    volDisplay.textContent = percent;
    // Convert percent to 0.0-1.0 scale for playerctl
    // const level = (percent / 100).toFixed(2); 
    try {
      await runSSHCommand(`wpctl set-volume @DEFAULT_AUDIO_SINK@ ${percent}%`); //playerctl volume ${level}
    } catch (e) {
      console.error("Vol set error:", e);
    }
  });

  updateVolumeUI();

});   