(function () {
  'use strict';
  var DATA = JSON.parse(document.getElementById('card-data').textContent);
  var $ = function (id) { return document.getElementById(id); };
  var card = $('card'), frame = $('frame'), msg = $('msg'), sender = $('sender'), statusEl = $('status');
  var who = 'practitioner', dirty = false;

  // The link is this page's own folder, so it works on any domain. Nothing is hard-coded.
  var folder = new URL('./', window.location.href).href;

  function slugify(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+/, '').slice(0, 30).replace(/-+$/, '');
  }
  function currentName() { return who === 'practitioner' ? '' : sender.value.trim().slice(0, 40); }
  function currentLink() {
    var slug = slugify(currentName());
    return slug ? folder + '?ref=' + slug : folder;
  }
  function say(t) { statusEl.textContent = ''; setTimeout(function () { statusEl.textContent = t; }, 30); }
  function fullText() { return msg.value.trim() + '\n\n' + currentLink(); }

  // --- scaling: the card is 540px wide by design, shown scaled to fit
  function fit() {
    var w = frame.clientWidth, s = Math.min(1, w / 540);
    card.style.transform = s < 1 ? 'scale(' + s + ')' : '';
    frame.style.height = Math.ceil(card.offsetHeight * s) + 'px';
  }

  // --- QR
  function renderQr(link) {
    var box = $('qr');
    if (typeof qrcode !== 'function') { box.innerHTML = '<small>QR code unavailable. Use the link.</small>'; return; }
    try {
      var q = qrcode(0, 'M'); q.addData(link); q.make();
      box.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
      var svg = box.querySelector('svg');
      if (svg) { svg.setAttribute('width', '126'); svg.setAttribute('height', '126'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'QR code for ' + link); svg.setAttribute('shape-rendering', 'crispEdges'); }
    } catch (e) { box.innerHTML = '<small>QR code unavailable. Use the link.</small>'; }
  }

  function render() {
    var name = currentName(), link = currentLink();
    $('card-tag').textContent = name ? 'Referred by ' + name : DATA.tagline;
    $('card-link').textContent = link.replace(/^https?:\/\//, '');
    renderQr(link);
    $('wa-send').href = 'https://wa.me/?text=' + encodeURIComponent(fullText());
    fit();
  }

  function setWho(v) {
    who = v;
    var needs = v !== 'practitioner';
    $('name-field').hidden = !needs;
    $('sender-label').textContent = v === 'business' ? 'Your business name' : 'Your name';
    if (!dirty) msg.value = DATA.messages[v];
    render();
  }

  Array.prototype.forEach.call(document.querySelectorAll('input[name=who]'), function (r) {
    r.addEventListener('change', function () { if (r.checked) setWho(r.value); });
  });
  sender.addEventListener('input', render);
  msg.addEventListener('input', function () { dirty = true; $('wa-send').href = 'https://wa.me/?text=' + encodeURIComponent(fullText()); });
  $('wa-send').addEventListener('click', function () { $('wa-send').href = 'https://wa.me/?text=' + encodeURIComponent(fullText()); say('Opening WhatsApp with your message.'); });
  if (window.ResizeObserver) new ResizeObserver(fit).observe(frame); else window.addEventListener('resize', fit);

  // --- copy
  function showFallback(text) {
    var fb = $('fallback'), t = $('fb-text');
    fb.hidden = false; t.value = text; t.focus(); t.select();
    say('Copy is blocked here. The text is selected below. Copy it from there.');
  }
  $('copy').addEventListener('click', function () {
    var text = fullText();
    function legacy() {
      try {
        var t = $('fb-text'); $('fallback').hidden = false; t.value = text; t.select();
        if (document.execCommand && document.execCommand('copy')) { $('fallback').hidden = true; say('Message copied.'); return; }
      } catch (e) {}
      showFallback(text);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { $('fallback').hidden = true; say('Message copied.'); }, legacy);
    } else { legacy(); }
  });

  // --- save as picture (1080px wide: 540px card at 2x)
  function fileName() { return (slugify(currentName()) || slugify(DATA.shortName) || 'intro') + '-card.png'; }
  $('save').addEventListener('click', function () {
    if (typeof html2canvas !== 'function') { say('Saving a picture is not available right now. Take a screenshot of the card instead.'); return; }
    var btn = $('save'); btn.disabled = true; say('Making your picture...');
    var stage = document.createElement('div'); stage.className = 'export-stage'; stage.setAttribute('aria-hidden', 'true');
    var clone = card.cloneNode(true); clone.removeAttribute('id'); clone.style.transform = 'none'; stage.appendChild(clone);
    document.body.appendChild(stage);
    var fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    fonts.then(function () {
      return html2canvas(clone, { scale: 2, width: 540, backgroundColor: null, useCORS: true, logging: false });
    }).then(function (canvas) {
      return new Promise(function (res, rej) { canvas.toBlob(function (b) { b ? res(b) : rej(new Error('no blob')); }, 'image/png'); });
    }).then(function (blob) {
      var file = new File([blob], fileName(), { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        return navigator.share({ files: [file], text: fullText() }).then(function () { say('Shared.'); }, function (e) {
          if (e && e.name === 'AbortError') { say('Sharing cancelled. Your picture was not sent.'); } else { download(blob); }
        });
      }
      download(blob);
    }).catch(function () { say('Could not make the picture. Take a screenshot of the card instead.'); })
      .then(function () { document.body.removeChild(stage); btn.disabled = false; });
  });
  function download(blob) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fileName();
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    say('Picture saved as ' + fileName() + '.');
  }

  // Scripts with "defer" have run (or failed) by DOMContentLoaded, so the QR and picture tools are known by now.
  function start() { setWho(DATA.mode === 'intro' ? 'practitioner' : 'client'); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
