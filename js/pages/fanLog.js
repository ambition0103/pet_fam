import {
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  orderBy,
  query,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";
import { dbService, authService, storageService } from "../firebase.js";
import {
  ref,
  uploadString,
  getDownloadURL,
  getStorage,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-storage.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

export const save_comment = async (event) => {
  event.preventDefault();

  const imgRef = ref(
    storageService,
    `${authService.currentUser.uid}/${uuidv4()}`
  );
  // 프로필 이미지 dataUrl을 Storage에 업로드 후 다운로드 링크를 받아서 photoURL에 저장.
  const imgDataUrl2 = localStorage.getItem("petImgDataUrl");
  let downloadUrl;
  if (imgDataUrl2) {
    const response = await uploadString(imgRef, imgDataUrl2, "data_url");
    downloadUrl = await getDownloadURL(response.ref);
  }


  const comment = document.getElementById("comment");
  const title = document.getElementById("title");

  const { uid, photoURL, displayName } = authService.currentUser;
  try {
    await addDoc(collection(dbService, "comments"), {
      title: title.value,
      text: comment.value,
      createdAt: Date.now(),
      creatorId: uid,
      profileImg: photoURL,
      nickname: displayName,
      commentImg: downloadUrl ?? null,
    });
    comment.value = "";
    title.value = "";
    getCommentList();
  } catch (error) {
    alert(error);
    console.log("error in addDoc:", error);
  }
};

// 업로드할 파일을 url버전으로 바꿔준 후에 localStorage에 저장해주는 함수  
export const onimgChange = (event) => {
  const theFile = event.target.files[0]; // file 객체
  const reader = new FileReader();
  reader.readAsDataURL(theFile); // file 객체를 브라우저가 읽을 수 있는 data URL로 읽음.
  reader.onloadend = (finishedEvent) => {
    // 파일리더가 파일객체를 data URL로 변환 작업을 끝났을 때
    const imgDataUrl = finishedEvent.currentTarget.result;
    localStorage.setItem("petImgDataUrl", imgDataUrl);
  };
};

export const onEditing = (event) => {
  // 수정버튼 클릭
  event.preventDefault();
  const udBtns = document.querySelectorAll(".editBtn, .deleteBtn");
  udBtns.forEach((udBtn) => (udBtn.disabled = "true"));

  const cardBody = event.target.parentNode.parentNode;
  const commentText = cardBody.children[0].children[1];
  const commentInputP = cardBody.children[0].children[3];

  commentText.classList.add("noDisplay");
  commentInputP.classList.add("d-flex");
  commentInputP.classList.remove("noDisplay");
  commentInputP.children[1].focus();
};

export const update_comment = async (event) => {
  event.preventDefault();

  console.log("event.target.parentNode.", event.target.parentNode)

  const newComment = event.target.parentNode.children[0].value;
  const id = event.target.parentNode.id;
  const newtitle = event.target.parentNode.children[1].value;
  console.log("newComment", newComment)
  console.log("newtitle", newtitle)

  const parentNode = event.target.parentNode.parentNode;
  const commentText = parentNode.children[0];
  commentText.classList.remove("noDisplay");
  const commentInputP = parentNode.children[1];
  commentInputP.classList.remove("d-flex");
  commentInputP.classList.add("noDisplay");

  const commentRef = doc(dbService, "comments", id);
  try {
    await updateDoc(commentRef, { text: newComment });
    getCommentList();
  } catch (error) {
    alert(error);
  }
};

export const delete_comment = async (event) => {
  event.preventDefault();
  const id = event.target.name;
  const ok = window.confirm("해당 응원글을 정말 삭제하시겠습니까?");
  if (ok) {
    try {
      await deleteDoc(doc(dbService, "comments", id));
      getCommentList();
    } catch (error) {
      alert(error);
    }
  }
};



export const getCommentList = async () => {

  const storage = getStorage();
  let noImgUrl = "";
  await getDownloadURL(ref(storage, 'imgfile/noImages.jfif'))
    .then((url) => {
      noImgUrl = url;
    })
    .catch((error) => {
      console.log(error)
      // Handle any errors
    });
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
    cmtObjList.push(commentObj);
  });
  const commnetList = document.getElementById("comment-list");
  const currentUid = authService.currentUser.uid;
  const imgButton = document.getElementById("image");
  imgButton.value = "";
  commnetList.innerHTML = "";
  cmtObjList.forEach((cmtObj) => {
    if (cmtObj.commentImg === undefined || cmtObj.commentImg === null) {
      cmtObj.commentImg = noImgUrl;
    }
    const isOwner = currentUid === cmtObj.creatorId;
    const temp_html = `<div class="card commentCard">
          <div class="card-body">
              <blockquote class="blockquote mb-0">
              <p>${cmtObj.title}</p>
                  <p class="commentText">${cmtObj.text}</p>
                  <p> <img class="cmtImg" width="100px" height="100px" src="${cmtObj.commentImg
      }" alt="" /></p>
                  <p id="${cmtObj.id
      }" class="noDisplay"><input class="newCmtInput" type="text" maxlength="30" /><button class="updateBtn" onclick="update_comment(event)">완료</button></p>
                  <footer class="quote-footer"><div>BY&nbsp;&nbsp;<img class="cmtImg" width="50px" height="50px" src="${cmtObj.profileImg
      }" alt="profileImg" /><span>${cmtObj.nickname ?? "닉네임 없음"
      }</span></div><div class="cmtAt">${new Date(cmtObj.createdAt)
        .toString()
        .slice(0, 25)}</div></footer>
              </blockquote>
              <div class="${isOwner ? "updateBtns" : "noDisplay"}">
                   <button onclick="onEditing(event)" class="editBtn btn btn-dark">수정</button>
                <button name="${cmtObj.id
      }" onclick="delete_comment(event)" class="deleteBtn btn btn-dark">삭제</button>
              </div>            
            </div>
     </div>`;
    const div = document.createElement("div");
    div.classList.add("mycards");
    div.innerHTML = temp_html;
    commnetList.appendChild(div);
  });
};
