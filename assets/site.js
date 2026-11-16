/* Coach Gopi site: enquiry forms (emailed to Gopi) and simple conversion events. */
(function () {
  'use strict';
  var MAIL = 'https://formsubmit.co/ajax/gopinath1996@gmail.com';
  var WA = '919879298039';

  function track(name) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: name });
      if (typeof window.gtag === 'function') { window.gtag('event', name); }
    } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-track]') : null;
    if (a) { track(a.getAttribute('data-track')); }
  });

  var params = new URLSearchParams(window.location.search);
  Array.prototype.forEach.call(document.querySelectorAll('form[data-enquiry]'), function (form) {
    var status = form.querySelector('.form-status');
    var btn = form.querySelector('button[type=submit]');
    var pre = params.get('service');
    var sel = form.querySelector('select[name=service]');
    if (pre && sel) { for (var i = 0; i < sel.options.length; i++) { if (sel.options[i].getAttribute('data-key') === pre) { sel.selectedIndex = i; } } }

    function say(msg, bad) { status.textContent = msg; status.className = 'form-status' + (bad ? ' err' : ''); }
    function label(el) { var l = form.querySelector('label[for="' + el.id + '"]'); return l ? l.textContent.trim() : el.name; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('.hp') && form.querySelector('.hp').value) { return; }
      var fields = form.querySelectorAll('input[name],select[name],textarea[name]');
      var payload = {}, lines = [], missing = null;
      Array.prototype.forEach.call(fields, function (el) {
        if (el.classList.contains('hp')) { return; }
        var v = el.value.trim();
        if (el.required && !v && !missing) { missing = el; }
        if (v) { payload[el.name] = v; lines.push(label(el) + ': ' + v); }
      });
      if (missing) { say('Please fill in: ' + label(missing) + '.', true); missing.focus(); return; }
      var kind = form.getAttribute('data-enquiry');
      var who = payload.name || payload.contact_person || 'a visitor';
      payload._subject = 'New ' + kind + ' enquiry from ' + who + ' (coach-gopi.com)';
      payload._template = 'table';
      payload._captcha = 'false';
      if (payload.email) { payload._replyto = payload.email; }
      var text = 'Hi Gopi, ' + kind + ' enquiry.\n' + lines.join('\n');
      btn.disabled = true; say('Sending...');
      fetch(MAIL, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || j.success === 'false' || j.success === false) { throw new Error('x'); } }); })
        .then(function () {
          say('Thank you. Your enquiry has been emailed to Gopi, and he will reply to you.');
          track(form.getAttribute('data-event') || 'enquiry');
          form.reset();
        }, function () {
          status.className = 'form-status err';
          status.innerHTML = 'Sorry, the email did not go through. Please send it on WhatsApp instead: <a href="https://wa.me/' + WA + '?text=' + encodeURIComponent(text) + '" target="_blank" rel="noopener">Open WhatsApp</a>.';
        })
        .then(function () { btn.disabled = false; });
    });
  });
})();
