/* 소상공인 AI 홍보마케팅 교육 — 신청 폼·내비게이션 동작
   서버 없이 동작합니다. 신청 내용은 문자(SMS) 메시지로 전달됩니다.
   전화번호를 바꿀 때는 아래 PHONE 값과 index.html의 tel:/sms: 링크를 함께 수정하세요. */
(function () {
  'use strict';

  var PHONE = '010-8366-8536';

  /* ---------- 모바일 메뉴 ---------- */
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  if (navToggle && nav) {
    var setNav = function (open) {
      nav.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    };
    navToggle.addEventListener('click', function () {
      setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setNav(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setNav(false);
    });
  }

  /* ---------- 스크롤 등장 효과 ---------- */
  var reveals = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reveals.length && !reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    reveals.forEach(function (el) { el.classList.add('pre'); io.observe(el); });
  }

  /* ---------- 단체 과정 버튼 → 신청 구분 자동 선택 ---------- */
  var pickGroup = document.querySelector('[data-pick-group]');
  if (pickGroup) {
    pickGroup.addEventListener('click', function () {
      var r = document.querySelector('input[name=type][value="단체"]');
      if (r) r.checked = true;
    });
  }

  /* ---------- 공유하기 ---------- */
  var shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var data = {
        title: '소상공인 AI 홍보마케팅 교육',
        text: '요즘 잘되는 가게, 다 이걸 씁니다 — 소상공인 AI 홍보마케팅 실습 교육',
        url: location.href.split('#')[0]
      };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
      } else {
        copyText(data.url, shareBtn, '주소가 복사됐습니다', '사장님께 알리기');
      }
    });
  }

  /* ---------- 카카오톡 친구 추가 ----------
     카카오톡은 "ID로 친구 추가"를 여는 공개 링크를 제공하지 않습니다.
     그래서 ID를 클립보드에 복사한 뒤 앱만 열어주고, 붙여넣기는 사용자가 합니다.
     PC에서는 앱이 없으므로 복사까지만 하고 안내 문구를 띄웁니다. */
  var kakaoBtn = document.getElementById('kakaoBtn');
  if (kakaoBtn) {
    kakaoBtn.addEventListener('click', function () {
      var id = document.getElementById('kakaoId').textContent.trim();
      var msg = document.getElementById('kakaoMsg');
      copyText(id, null, null, null);
      if (msg) msg.classList.add('show');
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        setTimeout(function () { location.href = 'kakaotalk://'; }, 250);
      }
    });
  }

  /* ---------- 신청 폼이 보이면 하단 고정 버튼 감추기 ---------- */
  var sticky = document.querySelector('.sticky');
  var applySec = document.getElementById('apply');
  if (sticky && applySec && 'IntersectionObserver' in window) {
    // 신청 섹션은 화면보다 길어 비율 기준은 신뢰할 수 없다.
    // 섹션이 화면 아래에서 120px 이상 올라오면 숨긴다.
    new IntersectionObserver(function (entries) {
      sticky.classList.toggle('hide', entries[0].isIntersecting);
    }, { threshold: 0, rootMargin: '0px 0px -120px 0px' }).observe(applySec);
  }

  /* ---------- 신청 폼 ---------- */
  var form = document.getElementById('form');
  if (!form) return;

  var done = document.getElementById('done');
  var msgEl = document.getElementById('msg');
  var phone = document.getElementById('phone');

  phone.addEventListener('input', function () {
    var d = this.value.replace(/\D/g, '').slice(0, 11);
    this.value = d.length > 7 ? d.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3')
      : d.length > 3 ? d.replace(/(\d{3})(\d+)/, '$1-$2') : d;
  });

  var val = function (id) { return (document.getElementById(id).value || '').trim(); };

  function setError(id, bad) {
    var field = document.getElementById(id);
    var err = document.getElementById('err-' + id);
    if (err) err.hidden = !bad;
    if (field) {
      field.classList.toggle('bad', !!bad);
      field.setAttribute('aria-invalid', bad ? 'true' : 'false');
    }
    return bad;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var bad = [];
    if (setError('name', !val('name'))) bad.push('name');
    if (setError('phone', val('phone').replace(/\D/g, '').length < 10)) bad.push('phone');
    if (setError('biz', !val('biz'))) bad.push('biz');
    var agree = document.getElementById('agree');
    var agreeErr = document.getElementById('err-agree');
    if (agreeErr) agreeErr.hidden = agree.checked;
    if (!agree.checked) bad.push('agree');

    if (bad.length) {
      var first = document.getElementById(bad[0]);
      if (first) { first.focus(); first.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      return;
    }

    var type = form.querySelector('input[name=type]:checked').value;
    var lines = ['[소상공인 AI 홍보마케팅 교육 신청]', '구분: ' + type, '성함: ' + val('name'),
      '연락처: ' + val('phone'), '업종: ' + val('biz')];
    if (val('shop')) lines.push('상호: ' + val('shop'));
    if (val('area')) lines.push('지역·시기: ' + val('area'));
    if (val('memo')) lines.push('메모: ' + val('memo'));

    var text = lines.join('\n');
    msgEl.textContent = text;

    // iOS는 sms: 스킴에서 파라미터 구분자로 '&'를 사용합니다.
    var sep = /iPhone|iPad|Macintosh/.test(navigator.userAgent) ? '&' : '?';
    document.getElementById('smsBtn').href = 'sms:' + PHONE + sep + 'body=' + encodeURIComponent(text);

    done.classList.add('show');
    done.scrollIntoView({ behavior: 'smooth', block: 'center' });
    done.focus({ preventScroll: true });
  });

  document.getElementById('copyBtn').addEventListener('click', function () {
    copyText(msgEl.textContent, this, '복사됐습니다', '내용 복사');
  });

  function copyText(text, btn, okLabel, backLabel) {
    var restore = function () {
      if (!btn) return;
      btn.textContent = okLabel;
      setTimeout(function () { btn.textContent = backLabel; }, 2000);
    };
    var fallback = function () {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); restore(); } catch (err) { /* 복사 실패 시 조용히 무시 */ }
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(restore, fallback);
    } else {
      fallback();
    }
  }
})();
