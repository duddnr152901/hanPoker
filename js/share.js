// ── PC방 토글 이미지 상태 (백엔드 연동용) ──
function setPcRoomToggleState(isPcRoom) {
  var toggleBtn = document.getElementById('pcRoomToggle');
  if (!toggleBtn) { return; }
  var toggleImg = toggleBtn.querySelector('.toggle-btn__img');
  if (!toggleImg) { return; }
  var isOn = Boolean(isPcRoom);
  toggleBtn.dataset.state = isOn ? 'on' : 'off';
  toggleImg.src = isOn ? 'images/off=on.png' : 'images/off=off.png';
  toggleImg.alt = isOn ? 'PC방 모드 ON' : 'PC방 모드 OFF';
}

// 기본값 OFF (백엔드에서 접속 상태 확인 후 setPcRoomToggleState 호출)
setPcRoomToggleState(false);

// ── 공유하기: 설정 / 토스트 / 모달 / SNS 핸들러 ──
// [BACKEND] 배포 시 아래 값들을 실제 값으로 교체하세요.
var SHARE_CONFIG = {
  title: '한게임포커x피카플레이 프로모션',
  description: '한게임포커x피카플레이 미션 참여해서 최대 13,000마일리지 받아가세요!',
  kakaoKey: 'd1c0c39f4dbac0062bf36527a3021357',                 // Kakao Developers JavaScript 키
  ogImage: window.SHARE_META && window.SHARE_META.ogImage ? window.SHARE_META.ogImage : ''         // 공유 썸네일 절대 URL (권장 1200x630)
};

var copyToast = document.getElementById('copyToast');
var copyToastTimer = null;
var DEFAULT_TOAST_MSG = '클립보드에 복사되었습니다.';
function showCopyToast(msg) {
  if (!copyToast) { return; }
  copyToast.textContent = msg || DEFAULT_TOAST_MSG;
  copyToast.classList.add('is-visible');
  if (copyToastTimer) { clearTimeout(copyToastTimer); }
  copyToastTimer = setTimeout(function() {
    copyToast.classList.remove('is-visible');
  }, 2200);
}
function fallbackCopyText(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  var copied = false;
  try {
    copied = document.execCommand('copy');
  } catch (e) {}
  document.body.removeChild(textarea);
  return copied;
}
function copyUrlWithToast(url, toastMsg) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(function() {
      showCopyToast(toastMsg);
    }).catch(function() {
      if (fallbackCopyText(url)) { showCopyToast(toastMsg); }
    });
  } else if (fallbackCopyText(url)) {
    showCopyToast(toastMsg);
  }
}

// Kakao SDK 초기화
(function initKakao() {
  if (!window.Kakao || !SHARE_CONFIG.kakaoKey) { return; }
  if (Kakao.isInitialized && Kakao.isInitialized()) { return; }
  try { Kakao.init(SHARE_CONFIG.kakaoKey); } catch (e) {}
})();

// 공유 모달 열기/닫기
var shareModal = document.getElementById('shareModal');
var shareModalClose = document.getElementById('shareModalClose');
var lastShareTrigger = null;
function openShareModal(trigger) {
  if (!shareModal) { return; }
  lastShareTrigger = trigger || null;
  shareModal.classList.add('is-open');
  shareModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (shareModalClose) { shareModalClose.focus(); }
}
function closeShareModal() {
  if (!shareModal) { return; }
  shareModal.classList.remove('is-open');
  shareModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastShareTrigger && lastShareTrigger.focus) { lastShareTrigger.focus(); }
}
if (shareModal) {
  shareModal.addEventListener('click', function(e) {
    if (e.target === shareModal) { closeShareModal(); }
  });
}
if (shareModalClose) {
  shareModalClose.addEventListener('click', closeShareModal);
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && shareModal && shareModal.classList.contains('is-open')) {
    closeShareModal();
  }
});

// SNS별 공유 동작
function openPopup(url) {
  var w = 600, h = 600;
  var left = (window.screen.width  - w) / 2;
  var top  = (window.screen.height - h) / 2;
  window.open(url, '_blank', 'width=' + w + ',height=' + h + ',left=' + left + ',top=' + top + ',noopener');
}
function shareFacebook() {
  var u = encodeURIComponent(window.location.href);
  openPopup('https://www.facebook.com/sharer/sharer.php?u=' + u);
}
function shareTwitter() {
  var u = encodeURIComponent(window.location.href);
  var t = encodeURIComponent(SHARE_CONFIG.title);
  openPopup('https://twitter.com/intent/tweet?url=' + u + '&text=' + t);
}
function shareNaver() {
  var u = encodeURIComponent(window.location.href);
  var t = encodeURIComponent(SHARE_CONFIG.title);
  openPopup('https://share.naver.com/web/shareView?url=' + u + '&title=' + t);
}
function shareKakao() {
  if (!window.Kakao || !Kakao.Share) { return; }
  if (!Kakao.isInitialized || !Kakao.isInitialized()) { return; }
  try {
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: SHARE_CONFIG.title,
        description: SHARE_CONFIG.description,
        imageUrl: SHARE_CONFIG.ogImage,
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href
        }
      },
      buttons: [{
        title: '자세히 보기',
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href
        }
      }]
    });
  } catch (e) {}
}
function shareInstagram() {
  // 인스타그램은 웹 URL 공유 API를 제공하지 않으므로 URL 복사 + 안내
  copyUrlWithToast(window.location.href, 'URL이 복사되었습니다. 인스타그램에 붙여넣어 주세요.');
}
function shareCopy() {
  copyUrlWithToast(window.location.href, '클립보드에 복사되었습니다.');
}
var SHARE_HANDLERS = {
  kakao:     shareKakao,
  facebook:  shareFacebook,
  twitter:   shareTwitter,
  naver:     shareNaver,
  instagram: shareInstagram,
  copy:      shareCopy
};
if (shareModal) {
  shareModal.addEventListener('click', function(e) {
    var target = e.target.closest ? e.target.closest('[data-share]') : null;
    if (!target) { return; }
    var type = target.getAttribute('data-share');
    var handler = SHARE_HANDLERS[type];
    if (typeof handler === 'function') {
      handler();
      // 카카오톡은 자체 팝업이 뜨므로 모달은 닫고, 나머지는 약간의 시각적 피드백 후 닫기
      closeShareModal();
    }
  });
}

var btnShare = document.getElementById('btnShare');
if (btnShare) {
  btnShare.addEventListener('click', function() { openShareModal(btnShare); });
}
var btnShareFloating = document.getElementById('btnShareFloating');
if (btnShareFloating) {
  btnShareFloating.addEventListener('click', function() { openShareModal(btnShareFloating); });
}
var btnScrollTop = document.getElementById('btnScrollTop');
if (btnScrollTop) {
  btnScrollTop.addEventListener('click', function (e) {
    e.preventDefault();
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var behavior = reduce ? 'auto' : 'smooth';
    // sticky 헤더(#top)에 scrollIntoView 하면 이미 보이는 요소로 판단해 스크롤이 안 올라가는 경우가 있음
    try {
      window.scrollTo({ top: 0, left: 0, behavior: behavior });
    } catch (err) {
      (document.scrollingElement || document.documentElement).scrollTop = 0;
      document.body.scrollTop = 0;
    }
  });
}
