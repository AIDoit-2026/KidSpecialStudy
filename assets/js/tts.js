/* 语音朗读：优先 speechSynthesis（zh-CN），无中文语音时静默降级 */
(function (w) {
  'use strict';

  var synth = w.speechSynthesis || null;
  var voices = [];
  var zhVoice = null;
  var ready = false;

  function pickVoice() {
    if (!synth) return;
    voices = synth.getVoices() || [];
    // zhVoice = voices.filter(function (v) { return /zh[-_]CN|Chinese|中文|普通话/i.test(v.lang + ' ' + v.name); })[0]
    //   || voices.filter(function (v) { return /^zh/i.test(v.lang); })[0] || null;
    // zhVoice = voices.filter(function (v) { return /zh[-_]CN|Taiwan/i.test(v.lang + ' ' + v.name); })[0]
    zhVoice = voices.find(function (v) { return v.name === 'Microsoft Xiaoyi Online (Natural) - Chinese (Mainland)'; }) || null;
    ready = true;
  }

  if (synth) {
    pickVoice();
    if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = pickVoice;
  }

  function enabled() {
    var s = w.Store && w.Store.settings ? w.Store.settings() : { tts: true };
    return s.tts !== false;
  }

  function available() {
    if (!synth) return false;
    if (!ready) pickVoice();
    return !!zhVoice || (voices.length === 0 && /^zh/i.test(navigator.language || ''));
  }

  function speak(text, opts) {
    opts = opts || {};
    if (!text || !synth) return false;
    if (!opts.force && !enabled()) return false;
    try {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'zh-CN';
      u.rate = opts.rate || 0.9;
      u.pitch = 1.05;
      if (zhVoice) u.voice = zhVoice;
      synth.speak(u);
      return true;
    } catch (e) { return false; }
  }

  function stop() { try { if (synth) synth.cancel(); } catch (e) { } }

  function test() { return speak('小兔子乖乖，把门儿开开。', { force: true }); }

  w.TTS = { speak: speak, stop: stop, available: available, enabled: enabled, test: test };
})(window);
