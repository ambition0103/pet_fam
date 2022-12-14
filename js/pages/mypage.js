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
  getStorage,
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

  const storage = getStorage();

  let noImgUrl = "";
  await getDownloadURL(ref(storage, "imgfile/noImages.jfif"))
    .then((url) => {
      noImgUrl = url;
    })
    .catch((error) => {
      console.log(error);
      // Handle any errors
    });

  const commnetList = document.querySelector(".my-contents");
  commnetList.innerHTML = "";

  cmtObjList.forEach((cmtObj) => {
    const temp_html = `
        <img
          src="${cmtObj.commentImg ?? noImgUrl}"
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
              authService.currentUser.displayName ?? "????????? ??????"
            }</div>
          </div>
          <div></div>
          <div><button class="btn" onclick="openModal(event)" id=${
            cmtObj.id
          }>?????????</button></div>
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
  const topBtn = document.querySelector(".top-btn");

  delBtn.style.display = "inline-block";
  editConfirmBtn.style.display = "none";
  newPhotoIpt.style.display = "none";
  topBtn.style.display = "none";
  modal_container.style.zIndex = 50;
  modal_container.style.display = "flex";
  modal.style.display = "block";
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

    const storage = getStorage();
    let noImgUrl = "";
    await getDownloadURL(ref(storage, "imgfile/noImages.jfif"))
      .then((url) => {
        noImgUrl = url;
      })
      .catch((error) => {
        console.log(error);
        // Handle any errors
      });

    title.innerText = loc.title.stringValue;
    user.innerText = `- ${
      document.querySelector(".content-user-name").textContent
    } -`;
    text.innerText = loc.text.stringValue;
    id.innerText = target;

    img.src = loc.commentImg.stringValue ?? noImgUrl;
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
  const topBtn = document.querySelector(".top-btn");

  topBtn.style.display = "block";
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
    alert("????????? 1?????? ?????? 10?????? ????????? ???????????????");
    newPhotoIpt.style.display = "flex";
    titleIpt.focus();
    return;
  } else if (newText.length > 60 || newText.length < 1) {
    alert("????????? 1?????? ?????? 60?????? ????????? ???????????????");
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
    const topBtn = document.querySelector(".top-btn");

    modal_container.style.zIndex = 0;
    modal_container.classList.remove("open-modal");
    modal.style.display = "none";
    document.querySelector("body").style.overflowY = "scroll";
    topBtn.style.display = "block";
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
    alert("????????? ????????? ?????? ???????????????!");
    title.focus();
    return;
  } else if (title.value.length > 10) {
    alert("????????? 10?????? ????????? ???????????????");
    title.focus();
    return;
  } else if (text.value.length > 60) {
    alert("????????? 30?????? ????????? ???????????????");
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

  const theFile = event.target.files[0]; // file ??????
  const reader = new FileReader();
  reader.readAsDataURL(theFile); // file ????????? ??????????????? ?????? ??? ?????? data URL??? ??????.

  reader.onloadend = (finishedEvent) => {
    // ??????????????? ??????????????? data URL??? ?????? ????????? ????????? ???
    const contentimgDataUrl = finishedEvent.currentTarget.result;

    localStorage.setItem("contentimgDataUrl", contentimgDataUrl);
    document.querySelector(".preview-photo").src = contentimgDataUrl;
  };
};

export const openPost = () => {
  document.querySelector(".post-new-comment").style.display = "flex";
  document.querySelector(".close-newpost-btn").style.display = "inline-block";
  document.querySelector(".new-post-btn").style.display = "none";
};

export const closePost = () => {
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

  const theFile = event.target.files[0]; // file ??????
  const reader = new FileReader();
  reader.readAsDataURL(theFile); // file ????????? ??????????????? ?????? ??? ?????? data URL??? ??????.

  reader.onloadend = (finishedEvent) => {
    // ??????????????? ??????????????? data URL??? ?????? ????????? ????????? ???
    const changePostImg = finishedEvent.currentTarget.result;

    localStorage.setItem("changePostImg", changePostImg);
    document.querySelector(".modal-photo").src = "";
    document.querySelector(".modal-photo").src = changePostImg;
  };
};

export const goToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export const changeUserProfileImg = async (event) => {
  event.preventDefault();
  const theFile = event.target.files[0]; // file ??????
  const reader = new FileReader();
  reader.readAsDataURL(theFile); // file ????????? ??????????????? ?????? ??? ?????? data URL??? ??????.

  reader.onloadend = (finishedEvent) => {
    // ??????????????? ??????????????? data URL??? ?????? ????????? ????????? ???
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
      alert("????????? ?????? ??????");
      window.location.hash = "#mypage";
    })
    .catch((error) => {
      alert("????????? ?????? ??????");
      console.log("error:", error);
    });
};

export const showTopBtn = () => {
  let top = window.scrollY;

  let topBtn = document.querySelector(".top-btn");
  if (topBtn) {
    if (top > 400) {
      topBtn.style.display = "inline-block";
    } else {
      topBtn.style.display = "none";
    }
  }
};

export const goToUsersCommentList = (event) => {
  let usersIcon = event.target.parentNode.children[0].src;
  let usersNickname = event.target.parentNode.children[1].textContent;
  let userUid = event.target.dataset.uid;

  localStorage.setItem("usersIcon", usersIcon);
  localStorage.setItem("usersNickname", usersNickname);
  localStorage.setItem("usersUid", userUid);
  showUsersCommentList();
};

export const showUsersCommentList = async (event) => {
  let usersIcon = localStorage.getItem("usersIcon");
  let usersNickname = localStorage.getItem("usersNickname");
  let usersUid = localStorage.getItem("usersUid");

  if (usersUid === authService.currentUser.uid) {
    window.location.hash = "#mypage";
  } else {
    window.location.hash = "#users";
    let cmtObjList = [];

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
      if (("commentObj", commentObj.creatorId === usersUid)) {
        cmtObjList.push(commentObj);
      }
    });

    const storage = getStorage();

    let noImgUrl = "";
    await getDownloadURL(ref(storage, "imgfile/noImages.jfif"))
      .then((url) => {
        noImgUrl = url;
      })
      .catch((error) => {
        console.log(error);
      });

    const commnetList = document.querySelector(".my-contents");
    commnetList.innerHTML = "";

    cmtObjList.forEach((cmtObj) => {
      const temp_html = `
          <img
            src="${cmtObj.commentImg ?? noImgUrl}"
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
                  src="${usersIcon ?? "/assets/blankProfile.webp"}"
                  alt=""
                />
              </div>
              <div class="content-user-name">${
                usersNickname ?? "????????? ??????"
              }</div>
            </div>
            <div></div>
            <div><button class="btn" onclick="openModal(event)" id=${
              cmtObj.id
            }>?????????</button></div>
        </div>`;
      const div = document.createElement("div");
      div.classList.add("my-content");
      div.innerHTML = temp_html;
      commnetList.appendChild(div);
    });
  }
};
