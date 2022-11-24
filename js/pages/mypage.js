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
import { db, authService, storageService } from "../firebase.js";
import {
  ref,
  getStorage,
  uploadString,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-storage.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";
import { onFileChange } from "./profile.js";

export const printMyCommentList = async () => {
  let cmtObjList = [];
  const currentUid = authService.currentUser.uid;

  const q = query(collection(db, "comments"), orderBy("createdAt", "desc"));
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
          <div><button onclick="openModal(event)" id=${
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
  console.log(target);
  const modal = document.querySelector(".contents-modal");
  const modal_container = document.querySelector(".content-modal-container");
  const delBtn = document.querySelector(".modal-del-btn");
  delBtn.style.display = "inline-block";
  modal_container.style.zIndex = 50;
  modal.style.display = "block";
  try {
    let commentRef = await getDoc(doc(db, "comments", target));
    let loc = commentRef._document.data.value.mapValue.fields;

    const title = document.querySelector(".modal-title");
    const text = document.querySelector(".modal-text");
    const user = document.querySelector(".modal-user");
    const id = document.querySelector(".modal-date");

    title.innerText = loc.title.stringValue;
    user.innerText = `- ${authService.currentUser.displayName} -`;
    text.innerText = loc.text.stringValue;
    id.innerText = target;
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

  const title = document.querySelector(".modal-title");
  const text = document.querySelector(".modal-text");
  const user = document.querySelector(".modal-user");

  title.innerText = "";
  user.innerText = "";
  text.innerText = "";

  const titleIpt = document.querySelector(".modal-title-ipt");
  const textIpt = document.querySelector(".modal-text-ipt");

  title.style.display = "block";
  text.style.display = "block";
  titleIpt.style.display = "none";
  textIpt.style.display = "none";

  const editBtn = document.querySelector(".modal-edit-btn");
  const editConfirmBtn = document.querySelector(".modal-edit-confirm-btn");

  editConfirmBtn.style.display = "none";
  editBtn.style.display = "inline-block";
};

export const modalOpenEdit = (event) => {
  event.preventDefault();

  const title = document.querySelector(".modal-title");
  const text = document.querySelector(".modal-text");

  const titleIpt = document.querySelector(".modal-title-ipt");
  const textIpt = document.querySelector(".modal-text-ipt");

  const titleText = title.textContent;
  const textText = text.textContent;

  title.style.display = "none";
  text.style.display = "none";
  titleIpt.style.display = "block";
  textIpt.style.display = "block";

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

  const editBtn = document.querySelector(".modal-edit-btn");
  const delBtn = document.querySelector(".modal-del-btn");
  const editConfirmBtn = document.querySelector(".modal-edit-confirm-btn");

  editBtn.style.display = "inline-block";
  delBtn.style.display = "inline-block";
  editConfirmBtn.style.display = "none";

  const newTitle = titleIpt.value;
  const newText = textIpt.value;

  const target = document.querySelector(".modal-date").textContent;
  let commentRef = await doc(db, "comments", target);

  try {
    await updateDoc(commentRef, { text: newText, title: newTitle });

    titleIpt.style.display = "none";
    textIpt.style.display = "none";

    title.style.display = "inline-block";
    text.style.display = "inline-block";

    title.innerText = newTitle;
    text.innerText = newText;
    printMyCommentList();
  } catch (error) {
    alert(error);
  }
};

export const modalDel = async (event) => {
  event.preventDefault();
  const target = document.querySelector(".modal-date").textContent;
  //   const ok = window.confirm("해당 응원글을 정말 삭제하시겠습니까?");
  console.log(target);
  try {
    let a = await deleteDoc(doc(db, "comments", target));
    console.log(a);
    const modal = document.querySelector(".contents-modal");
    const modal_container = document.querySelector(".content-modal-container");

    modal_container.style.zIndex = 0;
    modal.style.display = "none";
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
  const text = document.querySelector(".new-comment-title");
  const title = document.querySelector(".new-comment-text");
  const { uid } = authService.currentUser;

  try {
    await addDoc(collection(db, "comments"), {
      title: title.value,
      text: text.value,
      createdAt: Date.now(),
      creatorId: uid,
      profileImg: authService.currentUser.photoURL,
      nickname: authService.currentUser.displayName,
      commentImg: downloadUrl,
    });
    printMyCommentList();
    title.value = "";
    text.value = "";
    document.querySelector(".preview-photo").src =
      "https://jmva.or.jp/wp-content/uploads/2018/07/noimage.png";
    document.querySelector(".new-comment-photo").value = "";
  } catch (error) {
    alert(error);
    console.log("error in addDoc:", error);
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
