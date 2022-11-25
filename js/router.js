import { authService } from "./firebase.js";

const routes = {
  404: "/pages/404.html",
  "/": "/pages/auth.html",
  fanLog: "/pages/fanLog.html",

  changeprofile: "/pages/profile.html",
  petlife: "/pages/petlife.html",
  intro: "/pages/intro.html",
  mypage: "/pages/mypage.html",
};
import { getCommentList } from "./pages/fanLog.js";
import { printMyCommentList } from "./pages/mypage.js";


export const handleLocation = async () => {
  let path = window.location.hash.replace("#", "");
  const pathName = window.location.pathname;

  // Live Server를 index.html에서 오픈할 경우
  if (pathName === "/index.html") {
    window.history.pushState({}, "", "/");
  }
  if (path.length == 0) {
    path = "/";
  }

  const route = routes[path] || routes[404];
  const html = await fetch(route).then((data) => data.text());
  document.getElementById("root").innerHTML = html;

  // 특정 화면 렌더링 되자마자 DOM 조작 처리
  if (path === "fanLog") {
    // 로그인한 회원의 프로필사진과 닉네임을 화면에 표시해줌.
    // document.getElementById("nickname").textContent =
    //   authService.currentUser.displayName ?? "닉네임 없음";

    document.getElementById("profileImg").src =
      authService.currentUser.photoURL ?? "../assets/blankProfile.webp";

  }
  if (path === "changeprofile") {
    // 프로필 관리 화면 일 때 현재 프로필 사진과 닉네임 할당
    document.querySelector(".preview-user-icon > img").src =
      authService.currentUser.photoURL ?? "/assets/blankProfile.webp";
    document.querySelector(".new-user-nickname").placeholder =
      authService.currentUser.displayName ?? "닉네임 없음";
  }

  if (path === "petlife") {
    // 로그인한 회원의 프로필사진과 닉네임을 화면에 표시해줌.
    // document.getElementById("nickname").textContent =
    //   authService.currentUser.displayName ?? "닉네임 없음";

    document.getElementById("profileImg").src =
      authService.currentUser.photoURL ?? "../assets/blankProfile.webp";

    document.getElementById("profileImg_writer").src =
      authService.currentUser.photoURL ?? "../assets/blankProfile.webp";
    getCommentList();
  }

  if (path === "mypage") {
    // 프로필 관리 화면 일 때 현재 프로필 사진과 닉네임 할당
    document.getElementById("profileImg").src =
      authService.currentUser.photoURL ?? "../assets/blankProfile.webp";
    document.querySelector(".user-name").textContent =
      authService.currentUser.displayName ?? "닉네임 없음";
    document.querySelector(".user-icon-img").src =
      authService.currentUser.photoURL ?? "../assets/blankProfile.webp";
    document.querySelector(".post-new-comment").style.display = "none";
    document.querySelector(".close-newpost-btn").style.display = "none";
    printMyCommentList();
  }

  if (path === "intro") {
    // 로그인한 회원의 프로필사진과 닉네임을 화면에 표시해줌.

    document.getElementById("profileImg").src =
      authService.currentUser.photoURL ?? "../assets/blankProfile.webp";

  }
};


export const goToProfile = () => {
  window.location.hash = "#profile";
};

export const goTopetlife = () => {
  window.location.hash = "#petlife";
};

export const goTointro = () => {
  window.location.hash = "#intro";
};

export const goTohome = () => {
  window.location.hash = "#fanLog";
};


export const goTomypage = () => {
  window.location.hash = "#mypage";
};

