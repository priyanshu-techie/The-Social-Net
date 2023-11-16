async function increaseLike(elem) {
    let parent = elem.parentNode;
    let likeCount = parent.childNodes[3];
    let likes = Number(likeCount.innerText);
    let postId = parent.dataset.id

    // if not liked then :
    if (elem.classList.contains('fa-regular')) {
        // frontend part
        elem.classList.remove('fa-regular');
        elem.classList.remove('text-dark');
        elem.classList.add('fa-solid');
        likes++;
        try {
            await fetch(`/user/post/likeIt/${postId}`, { method: "PUT" });
        }
        // if error occoured, discard the process
        catch (e) {
            console.error(e);
            return;
        }
    }
    // if want to undo the like:
    else {
        elem.classList.remove('fa-solid');
        elem.classList.add('fa-regular');
        elem.classList.add('text-dark');
        likes--;
        try {
            await fetch(`/user/post/unlikeIt/${postId}`, { method: "PUT" });
        }
        // if error occoured, discard the process
        catch (e) {
            console.error(e);
            return;
        }
    }
    likeCount.innerText = likes;
}

async function deletePost(elem) {
    let yesOrNo = confirm("Are you sure you want to delete the post??");
    if (!yesOrNo) return;
    const parent = elem.parentNode
    const postId = parent.dataset.id
    try {
        await fetch(`/user/post/deleteIt/${postId}`, { method: "delete" })
        window.location.href = '/user/feed';
    } catch (e) {
        console.error(e);
    }

}

async function addComment() {
    const input = document.getElementById('commentBox');
    const commentsContainer = document.getElementById('commentsContainer');
    const comment = input.value;
    // if the comment is empty with just spaces then return
    if (comment.replace(/\s/g, '') === "") { input.value = ""; return; }
    input.value = "";

    const postId = input.parentElement.dataset.id;
    
    try {
        const response1= await fetch('/user/post/comment', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                comment: comment,
                postId: postId
                // the user who made the comment, this info the server can have from req.user 
            })
        });
        const commentIdJson = await response1.json();
        const commentId = commentIdJson.commId;

        // pushing the comment to the frontend
        const response2 = await fetch('/user/post/comment/getCommenterDetails'); // get details from current logged in user , caz he/she is only making the comment 
        const data = await response2.json();
        
        let newDiv = document.createElement('div');
        newDiv.innerHTML = `
                    <a href="/user/profile/${data.id}">
                        <div style="font-size: 0.7rem;"> 
                            <img src="${data.profilePic}" style="width:1em; margin-right: 1em;">
                            ${data.userId}
                        </div> 
                    </a> 
                    <p>${comment} </p>
                    <p data-id="${commentId}"> 
                        <i class="fa-regular fa-heart" style="cursor: pointer;" onclick="increaseCommentLike(this)"></i> 
                        <span> 0 </span>
                        <i class="fa-solid fa-trash text-primary" style="cursor:pointer;" onclick="deleteComment(this)"></i>
                    </p>   
        `
        commentsContainer.appendChild(newDiv);
    } catch (err) {
        console.error(err);
    }
    // frontend me commnet push kro 
}

async function increaseCommentLike(elem) {
    let parent = elem.parentNode;
    let likeCount = parent.childNodes[3];
    let likes = Number(likeCount.innerText);
    let commentId = parent.dataset.id

    // if not liked then :
    if (elem.classList.contains('fa-regular')) {
        // frontend part
        elem.classList.remove('fa-regular');
        elem.classList.add('fa-solid');
        elem.style.color = "#ff0000"
        likes++;
        try {
            await fetch(`/user/post/comment/likeComment/${commentId}`, { method: "PUT" });
        }
        // if error occoured, discard the process
        catch (e) {
            console.error(e);
            return;
        }
    }
    // if want to undo the like:
    else {
        elem.classList.remove('fa-solid');
        elem.classList.add('fa-regular');
        elem.style.color = "black";
        likes--;
        try {
            await fetch(`/user/post/comment/unLikeComment/${commentId}`, { method: "PUT" });
        }
        // if error occoured, discard the process
        catch (e) {
            console.error(e);
            return;
        }
    }
    likeCount.innerText = likes;
}


async function deleteComment(elem) {
    let parent = elem.parentNode;
    let commentId = parent.dataset.id;
    let commentBox = parent.parentNode;

    try {
        await fetch(`/user/post/comment/deleteComment/${commentId}`, { method: 'Delete' });
        commentBox.remove();
    } catch (error) {
        console.log('failed to delete! try again');
    }
}

async function handleImageCompress(event) {
    const imageFile = event.target.files[0];
    console.log(`originalFile size: ${imageFile.size / 1024 / 1024} MB`);
    const options = {
        maxSizeMB: 3,
        useWebWorker: true,
    }
    try {
        const compressedFile = await imageCompression(imageFile, options);
        console.log(`compressedFile size: ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB
        const originalFileName = imageFile.name;

        // Create a new File object with the compressed data and modified name
        const compressedBlob = new File([compressedFile], originalFileName, {
            type: compressedFile.type, // Preserve the original file type
            lastModified: Date.now(), // Set the last modified timestamp
        });

        // without using DataTransfer we can't assign comessed files directly to this elem
        let compressedFileList = new DataTransfer(); // this is used to hold the data
        compressedFileList.items.add(compressedBlob);
        // Replace the original file with the compressed file
        event.target.files = compressedFileList.files;
    } catch (error) {
        console.log(error);
    }

}