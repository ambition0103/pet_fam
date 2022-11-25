import {
  collection,
  orderBy,
  query,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";
import { dbService, authService, storageService } from "../firebase.js";
import {
  ref,
  uploadString,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-storage.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";
import { updateProfile } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";

export const printMyCommentList = async () => {
  localStorage.removeItem("setNewProFileImg");
  localStorage.removeItem("contentimgDataUrl");
  let cmtObjList = [];
  const currentUid = authService.currentUser.uid;

  const q = query(
    collection(dbService, "comments"),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const commentObj = {
      id: doc.id,
      ...doc.data(),
    };
    if (("commentObj", commentObj.creatorId === currentUid)) {
      cmtObjList.push(commentObj);
    }
  });
  const commnetList = document.querySelector(".my-contents");
  commnetList.innerHTML = "";

  cmtObjList.forEach((cmtObj) => {
    const temp_html = `
        <img
          src="${
            cmtObj.commentImg ??
            "https://jmva.or.jp/wp-content/uploads/2018/07/noimage.png"
          }"
          class="content"
        />
        <div class="my-content-info">
          <div class="my-content-title">${cmtObj.title}</div>
          <div class="my-content-desc">${cmtObj.text}</div>
        </div>
        <div class="my-content-header">
          <div class="my-content-container">
            <div class="content-user-icon">
              <img
                src="${
                  authService.currentUser.photoURL ??
                  "/assets/blankProfile.webp"
                }"
                alt=""
              />
            </div>
            <div class="content-user-name">${
              authService.currentUser.displayName ?? "닉네임 없음"
            }</div>
          </div>
          <div></div>
          <div><button class="btn" onclick="openModal(event)" id=${
            cmtObj.id
          }>더보기</button></div>
      </div>`;
    const div = document.createElement("div");
    div.classList.add("my-content");
    div.innerHTML = temp_html;
    commnetList.appendChild(div);
  });
};

export const openModal = async (event) => {
  event.preventDefault();

  const target = event.target.id;
  const modal = document.querySelector(".contents-modal");
  const modal_container = document.querySelector(".content-modal-container");
  const delBtn = document.querySelector(".modal-del-btn");
  const editConfirmBtn = document.querySelector(".modal-edit-confirm-btn");
  const newPhotoIpt = document.querySelector(".add-new-photo");
  const modalBg = document.querySelector(".content-modal-container");

  delBtn.style.display = "inline-block";
  modal_container.style.zIndex = 50;
  modal_container.style.display = "flex";
  modal.style.display = "block";
  editConfirmBtn.style.display = "none";
  newPhotoIpt.style.display = "none";
  modalBg.classList.add("open-modal");
  document.querySelector("body").style.overflowY = "hidden";

  try {
    let commentRef = await getDoc(doc(dbService, "comments", target));
    let loc = commentRef._document.data.value.mapValue.fields;

    const img = document.querySelector(".modal-photo");
    const title = document.querySelector(".modal-title");
    const text = document.querySelector(".modal-text");
    const user = document.querySelector(".modal-user");
    const id = document.querySelector(".modal-date");

    title.innerText = loc.title.stringValue;
    user.innerText = `- ${authService.currentUser.displayName} -`;
    text.innerText = loc.text.stringValue;
    id.innerText = target;

    img.src =
      loc.commentImg.stringValue ??
      "https://jmva.or.jp/wp-content/uploads/2018/07/noimage.png";
  } catch (error) {
    alert(error);
  }
};

export const closeModal = (event) => {
  event.preventDefault();
  const modal = document.querySelector(".contents-modal");
  const modal_container = document.querySelector(".content-modal-container");

  modal_container.style.zIndex = 0;
  modal.style.display = "none";
  modal_container.style.display = "none";

  const title = document.querySelector(".modal-title");
  const text = document.querySelector(".modal-text");
  const user = document.querySelector(".modal-user");

  title.innerText = "";
  user.innerText = "";
  text.innerText = "";

  const titleIpt = document.querySelector(".modal-title-ipt");
  const textIpt = document.querySelector(".modal-text-ipt");
  const newPhotoIpt = document.querySelector(".add-new-photo");

  title.style.display = "block";
  text.style.display = "block";
  titleIpt.style.display = "none";
  textIpt.style.display = "none";

  const editBtn = document.querySelector(".modal-edit-btn");
  const editConfirmBtn = document.querySelector(".modal-edit-confirm-btn");

  editConfirmBtn.style.display = "none";
  editBtn.style.display = "inline-block";

  const modalBg = document.querySelector(".content-modal-container");

  modalBg.classList.remove("open-modal");
  document.querySelector("body").style.overflowY = "scroll";

  document.querySelector(".modal-photo").src =
    "https://jmva.or.jp/wp-content/uploads/2018/07/noimage.png";
  newPhotoIpt.value = "";
};

export const modalOpenEdit = (event) => {
  event.preventDefault();

  const title = document.querySelector(".modal-title");
  const text = document.querySelector(".modal-text");

  const titleIpt = document.querySelector(".modal-title-ipt");
  const textIpt = document.querySelector(".modal-text-ipt");
  const newPhotoIpt = document.querySelector(".add-new-photo");

  const titleText = title.textContent;
  const textText = text.textContent;

  title.style.display = "none";
  text.style.display = "none";
  titleIpt.style.display = "block";
  textIpt.style.display = "block";

  newPhotoIpt.style.display = "inline-block";

  titleIpt.value = titleText;
  textIpt.value = textText;

  const editConfirmBtn = document.querySelector(".modal-edit-confirm-btn");
  const editBtn = document.querySelector(".modal-edit-btn");
  const delBtn = document.querySelector(".modal-del-btn");

  editConfirmBtn.style.display = "inline-block";
  editBtn.style.display = "none";
  delBtn.style.display = "none";
};

export const modalEdit = async (event) => {
  event.preventDefault();

  const title = document.querySelector(".modal-title");
  const text = document.querySelector(".modal-text");

  const titleIpt = document.querySelector(".modal-title-ipt");
  const textIpt = document.querySelector(".modal-text-ipt");
  const newPhotoIpt = document.querySelector(".add-new-photo");

  const editBtn = document.querySelector(".modal-edit-btn");
  const delBtn = document.querySelector(".modal-del-btn");
  const editConfirmBtn = document.querySelector(".modal-edit-confirm-btn");

  const newTitle = titleIpt.value;
  const newText = textIpt.value;

  const target = document.querySelector(".modal-date").textContent;
  let commentRef = await doc(dbService, "comments", target);

  newPhotoIpt.style.display = "none";

  if (newTitle.length > 10 || newTitle.length < 1) {
    alert("제목은 1글자 이상 10글자 이하로 적어주세요");
    newPhotoIpt.style.display = "flex";
    titleIpt.focus();
    return;
  } else if (newText.length > 60 || newText.length < 1) {
    alert("내용은 1글자 이상 60글자 이하로 적어주세요");
    newPhotoIpt.style.display = "flex";
    textIpt.focus();
    return;
  } else {
    if (localStorage.changePostImg !== undefined) {
      const imgRef = ref(
        storageService,
        `${authService.currentUser.uid}/${uuidv4()}`
      );

      const changePostImg = localStorage.getItem("changePostImg");
      let downloadUrl;
      if (changePostImg) {
        const response = await uploadString(imgRef, changePostImg, "data_url");
        downloadUrl = await getDownloadURL(response.ref);
      }

      try {
        await updateDoc(commentRef, {
          text: newText,
          title: newTitle,
          commentImg: changePostImg,
        });

        titleIpt.style.display = "none";
        textIpt.style.display = "none";
        newPhotoIpt.style.display = "none";

        title.style.display = "block";
        text.style.display = "inline-block";

        title.innerText = newTitle;
        text.innerText = newText;

        editBtn.style.display = "inline-block";
        delBtn.style.display = "inline-block";
        editConfirmBtn.style.display = "none";

        localStorage.removeItem("changePostImg");

        printMyCommentList();
      } catch (error) {
        alert(error);
      }
    } else {
      try {
        await updateDoc(commentRef, { text: newText, title: newTitle });

        titleIpt.style.display = "none";
        textIpt.style.display = "none";

        title.style.display = "block";
        text.style.display = "block";

        title.innerText = newTitle;
        text.innerText = newText;

        editBtn.style.display = "inline-block";
        delBtn.style.display = "inline-block";
        editConfirmBtn.style.display = "none";

        printMyCommentList();
      } catch (error) {
        alert(error);
      }
    }
  }
};

export const modalDel = async (event) => {
  event.preventDefault();
  const target = document.querySelector(".modal-date").textContent;
  try {
    await deleteDoc(doc(dbService, "comments", target));
    const modal = document.querySelector(".contents-modal");
    const modal_container = document.querySelector(".content-modal-container");
    modal_container.style.zIndex = 0;
    modal.style.display = "none";
    document.querySelector("body").style.overflowY = "scroll";
    printMyCommentList();
  } catch (error) {
    alert(error);
  }
};

export const createNewComment = async (event) => {
  event.preventDefault();

  const imgRef = ref(
    storageService,
    `${authService.currentUser.uid}/${uuidv4()}`
  );

  const contentimgDataUrl = localStorage.getItem("contentimgDataUrl");
  let downloadUrl;
  if (contentimgDataUrl) {
    const response = await uploadString(imgRef, contentimgDataUrl, "data_url");
    downloadUrl = await getDownloadURL(response.ref);
  }
  const title = document.querySelector(".new-comment-title");
  const text = document.querySelector(".new-comment-text");
  const { uid } = authService.currentUser;

  if (title.value === "" || text.value === "") {
    alert("제목과 내용을 모두 적어주세요!");
    title.focus();
    return;
  } else if (title.value.length > 10) {
    alert("제목은 10글자 이하로 적어주세요");
    title.focus();
    return;
  } else if (text.value.length > 60) {
    alert("내용은 30글자 이하로 적어주세요");
    text.focus();
    return;
  } else {
    try {
      await addDoc(collection(dbService, "comments"), {
        title: title.value,
        text: text.value,
        createdAt: Date.now(),
        creatorId: uid,
        profileImg: authService.currentUser.photoURL,
        nickname: authService.currentUser.displayName,
        commentImg: downloadUrl ?? null,
      });
      printMyCommentList();
      title.value = "";
      text.value = "";
      document.querySelector(".preview-photo").src =
        "https://jmva.or.jp/wp-content/uploads/2018/07/noimage.png";
      document.querySelector("#new-comment-photo").value = "";
      localStorage.removeItem("contentimgDataUrl");
      document.querySelector(".post-new-comment").style.display = "none";
    } catch (error) {
      alert(error);
    }
  }
};

export const onPhotoUploaded = async (event) => {
  event.preventDefault();

  const theFile = event.target.files[0]; // file 객체
  const reader = new FileReader();
  reader.readAsDataURL(theFile); // file 객체를 브라우저가 읽을 수 있는 data URL로 읽음.

  reader.onloadend = (finishedEvent) => {
    // 파일리더가 파일객체를 data URL로 변환 작업을 끝났을 때
    const contentimgDataUrl = finishedEvent.currentTarget.result;

    localStorage.setItem("contentimgDataUrl", contentimgDataUrl);
    document.querySelector(".preview-photo").src = contentimgDataUrl;
  };
};

export const openPost = (event) => {
  document.querySelector(".post-new-comment").style.display = "flex";
  document.querySelector(".close-newpost-btn").style.display = "inline-block";
  document.querySelector(".new-post-btn").style.display = "none";
};

export const closePost = (event) => {
  document.querySelector(".post-new-comment").style.display = "none";
  document.querySelector(".close-newpost-btn").style.display = "none";
  document.querySelector(".new-post-btn").style.display = "inline-block";
  document.querySelector(".new-comment-photo").value = "";
  document.querySelector(".new-comment-title").value = "";
  document.querySelector(".new-comment-text").value = "";
  localStorage.removeItem("contentimgDataUrl");
  localStorage.removeItem("changePostImg");
};

export const changePostImg = (event) => {
  event.preventDefault();

  const theFile = event.target.files[0]; // file 객체
  const reader = new FileReader();
  reader.readAsDataURL(theFile); // file 객체를 브라우저가 읽을 수 있는 data URL로 읽음.

  reader.onloadend = (finishedEvent) => {
    // 파일리더가 파일객체를 data URL로 변환 작업을 끝났을 때
    const changePostImg = finishedEvent.currentTarget.result;

    localStorage.setItem("changePostImg", changePostImg);
    document.querySelector(".modal-photo").src = "";
    document.querySelector(".modal-photo").src = changePostImg;
  };
};

export const goToTop = (event) => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export const changeUserProfileImg = async (event) => {
  event.preventDefault();
  const theFile = event.target.files[0]; // file 객체
  const reader = new FileReader();
  reader.readAsDataURL(theFile); // file 객체를 브라우저가 읽을 수 있는 data URL로 읽음.

  reader.onloadend = (finishedEvent) => {
    // 파일리더가 파일객체를 data URL로 변환 작업을 끝났을 때
    const setNewProFileImg = finishedEvent.currentTarget.result;

    localStorage.setItem("setNewProFileImg", setNewProFileImg);
    document.querySelector(".preview-user-icon > img").src = setNewProFileImg;
  };
};

export const onChangeProfile = async (event) => {
  event.preventDefault();
  document.querySelector(".submit-change-profile").disabled = true;

  let currentNickName = authService.currentUser.displayName;
  let currentProfileImg = authService.currentUser.photoURL;
  const imgRef = ref(
    storageService,
    `${authService.currentUser.uid}/${uuidv4()}`
  );
  const contentimgDataUrl = localStorage.getItem("setNewProFileImg");
  const newNickname = document.querySelector(".new-user-nickname").value;

  let downloadUrl;
  if (contentimgDataUrl) {
    const response = await uploadString(imgRef, contentimgDataUrl, "data_url");
    downloadUrl = await getDownloadURL(response.ref);
  }
  await updateProfile(authService.currentUser, {
    displayName: newNickname ? newNickname : currentNickName,
    photoURL: downloadUrl ? downloadUrl : currentProfileImg,
  })
    .then(() => {
      printMyCommentList();
      localStorage.removeItem("setNewProFileImg");
      alert("프로필 수정 완료");
      window.location.hash = "#mypage";
    })
    .catch((error) => {
      alert("프로필 수정 실패");
      console.log("error:", error);
    });
};
