/* 导出 / 导入：JSON 全量、CSV 流水、ZIP（自实现 store 模式） */
(function (w) {
  'use strict';

  /* ---------- CRC32 ---------- */
  var crcTable = (function () {
    var t = new Uint32Array(256);
    for (var i = 0; i < 256; i++) {
      var c = i;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function u16(n) { return [n & 0xFF, (n >>> 8) & 0xFF]; }
  function u32(n) { return [n & 0xFF, (n >>> 8) & 0xFF, (n >>> 16) & 0xFF, (n >>> 24) & 0xFF]; }

  function encodeName(name) {
    // UTF-8 编码（文件名可能含中文）
    return new TextEncoder().encode(name);
  }

  function buildZip(entries) {
    var chunks = [];
    var central = [];
    var offset = 0;

    entries.forEach(function (e) {
      var nameBytes = encodeName(e.name);
      var data = e.data instanceof Uint8Array ? e.data : new Uint8Array(e.data);
      var crc = crc32(data);
      var local = [].concat(
        u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0),
        u32(crc), u32(data.length), u32(data.length),
        u16(nameBytes.length), u16(0)
      );
      chunks.push(new Uint8Array(local));
      chunks.push(nameBytes);
      chunks.push(data);

      central.push({
        crc: crc, size: data.length, nameBytes: nameBytes, offset: offset
      });
      offset += local.length + nameBytes.length + data.length;
    });

    var cdStart = offset, cdSize = 0;
    central.forEach(function (c) {
      var head = [].concat(
        u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0),
        u32(c.crc), u32(c.size), u32(c.size),
        u16(c.nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(c.offset)
      );
      chunks.push(new Uint8Array(head));
      chunks.push(c.nameBytes);
      cdSize += head.length + c.nameBytes.length;
    });

    chunks.push(new Uint8Array([].concat(
      u32(0x06054b50), u16(0), u16(0), u16(central.length), u16(central.length),
      u32(cdSize), u32(cdStart), u16(0)
    )));

    return new Blob(chunks, { type: 'application/zip' });
  }

  /* ---------- 下载 ---------- */
  function download(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 400);
  }

  function stamp() {
    var d = new Date();
    return d.getFullYear() + U.pad(d.getMonth() + 1) + U.pad(d.getDate());
  }

  function kidName() {
    var k = w.Store.kids.active();
    return k ? k.name : '孩子';
  }

  /* ---------- JSON ---------- */
  function exportJSON() {
    var payload = w.Store.exportAll();
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    download(blob, '每日一练_' + kidName() + '_' + stamp() + '.json');
    w.Store.saveSettings({ lastExportAt: Date.now() });
    return true;
  }

  /* ---------- CSV ---------- */
  function exportCSV() {
    var days = w.Store.days();
    var writing = w.Store.writingList();
    var attempts = w.Store.attempts();
    var rows = [['日期', '场次', '类型', '题数', '答对', '正确率', '用时(分钟)', '写字字数', '写字均分', '状态']];

    Object.keys(days).sort().forEach(function (d) {
      (days[d].plan || []).forEach(function (s, i) {
        var total = (s.items.chars || []).length + (s.items.pinyin || []).length + (s.items.math || []).length;
        var wr = writing.filter(function (x) { return x.date === d && (x.slot || 0) === i; })[0];
        var avg = '';
        if (wr && wr.scores) {
          avg = ((wr.scores.stroke + wr.scores.structure + wr.scores.clean + wr.scores.complete) / 4).toFixed(2);
        }
        rows.push([
          d, i + 1, s.type === 'catchup' ? '补练' : (s.type === 'extra' ? '加练' : '新内容'),
          total, s.correct || 0,
          total ? Math.round((s.correct || 0) / total * 100) + '%' : '',
          s.ms ? (s.ms / 60000).toFixed(1) : '',
          (wr && wr.chars ? wr.chars.length : 0),
          avg,
          s.status === 'done' ? '完成' : '未完成'
        ]);
      });
    });

    var csv = rows.map(function (r) {
      return r.map(function (c) {
        var s = String(c === undefined || c === null ? '' : c);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(',');
    }).join('\r\n');

    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    download(blob, '每日一练_' + kidName() + '_打卡记录_' + stamp() + '.csv');
    return true;
  }

  /* ---------- ZIP ---------- */
  function exportZIP(onProgress) {
    var kid = w.Store.kids.active();
    if (!kid) return Promise.reject(new Error('没有孩子档案'));
    var payload = w.Store.exportAll();
    return w.Store.photoAll(kid.id).then(function (photos) {
      var entries = [];
      entries.push({
        name: '每日一练_' + kid.name + '.json',
        data: new TextEncoder().encode(JSON.stringify(payload, null, 2))
      });
      entries.push({
        name: 'README.txt',
        data: new TextEncoder().encode(
          '宝贝每日一练 · 备份包\n导出时间：' + new Date().toLocaleString('zh-CN') + '\n' +
          '孩子：' + kid.name + '\n\n' +
          'photos/ 目录下是各天的作业照片，文件名格式 YYYY-MM-DD_场次.jpg\n' +
          '还原方法：打开应用 → 家长中心 → 数据 → 导入 JSON（用压缩包里的 json 文件）\n'
        )
      });

      var idx = 0;
      function step() {
        if (idx >= photos.length) {
          var blob = buildZip(entries);
          download(blob, '每日一练_' + kid.name + '_作业照片_' + stamp() + '.zip');
          w.Store.saveSettings({ lastExportAt: Date.now() });
          return Promise.resolve(true);
        }
        var p = photos[idx++];
        return Promise.resolve(p.blob instanceof Blob ? p.blob.arrayBuffer() : new ArrayBuffer(0))
          .then(function (buf) {
            entries.push({
              name: 'photos/' + p.date + '_' + (p.slot || 0) + '.jpg',
              data: new Uint8Array(buf)
            });
            if (onProgress) onProgress(idx, photos.length);
            return step();
          });
      }
      return step();
    });
  }

  /* ---------- 导入 ---------- */
  function importJSON(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var payload = JSON.parse(fr.result);
          if (!payload || !payload.kids) { reject(new Error('这不是本应用的备份文件')); return; }
          var report = w.Store.importAll(payload);
          resolve(report);
        } catch (e) { reject(e); }
      };
      fr.onerror = function () { reject(new Error('文件读取失败')); };
      fr.readAsText(file);
    });
  }

  w.Exporter = {
    exportJSON: exportJSON, exportCSV: exportCSV, exportZIP: exportZIP,
    importJSON: importJSON, buildZip: buildZip, download: download, crc32: crc32,
    lastExportAt: function () { return w.Store.settings().lastExportAt || null; }
  };
})(window);
