/* Audio stays in memory, capped at thirty seconds. */
class PondrootRecorder extends AudioWorkletProcessor {
  count = 0;
  process(inputs) {
    const channel = inputs[0]?.[0];
    if (channel && this.count < sampleRate * 30) {
      const clip = channel.slice(0, Math.min(channel.length, sampleRate * 30 - this.count));
      this.count += clip.length;
      this.port.postMessage(clip, [clip.buffer]);
    }
    return true;
  }
}
registerProcessor('pondroot-recorder', PondrootRecorder);
