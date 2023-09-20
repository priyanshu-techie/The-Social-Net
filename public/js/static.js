async function increaseLike(elem){
    let parent=elem.parentNode;
    let likeCount=parent.childNodes[3];
    let likes=Number(likeCount.innerText);
    let postId =parent.dataset.id

    // if not liked then :
    if(elem.classList.contains('fa-regular')){
        // frontend part
        elem.classList.remove('fa-regular');
        elem.classList.remove('text-dark');
        elem.classList.add('fa-solid');
        likes++;
        try{
            await fetch(`/user/likePost/${postId}`,{ method:"PUT" } );
        }
        // if error occoured, discard the process
        catch(e){
            console.error(e);
            return;
        }
    }
    // if want to undo the like:
    else{
        elem.classList.remove('fa-solid');
        elem.classList.add('fa-regular');
        elem.classList.add('text-dark');
        likes--;
        try{
            await fetch(`/user/unLikePost/${postId}`,{ method:"PUT" } );
        }
        // if error occoured, discard the process
        catch(e){
            console.error(e);
            return;
        }
    }
    likeCount.innerText=likes;
}

async function deletePost(elem){
    let yesOrNo= confirm("Are you sure you want to delete the post??");
    if( !yesOrNo ) return;
    const parent=elem.parentNode
    const postId =parent.dataset.id
    try {
        await fetch(`/user/deletePost/${postId}`,{method:"delete"})
        window.location.href='/user/feed';
    } catch (e) {
        console.error(e);
    }
    
}

async function addComment(){
    const input = document.getElementById('commentBox');
    const commentsContainer = document.getElementById('commentsContainer');
    const comment = input.value;
    // if the comment is empty with just spaces then return
    if(comment.replace(/\s/g, '') === "") {input.value=""; return;}

    const postId = input.parentElement.dataset.id;
    try {
        await fetch('/user/post/comment',{
            method:'post',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                comment:comment,
                postId: postId
                // the user who made the comment, this info the server can have from req.user 
            })
        })
        input.value="";
        
        // pushing the comment to the frontend
        const response = await fetch('/user/post/comment/getCommenterDetails'); // get details from current logged in user , caz he/she is only making the comment 
        const data =await response.json();

        let newDiv = document.createElement('div');
        newDiv.innerHTML= `
                    <div style="font-size: 0.7rem;"> <img src="${data.profilePic}" style="width:1em; margin-right: 1em;">${data.userId}</div> 
                    <p>${comment} </p>
        `
        commentsContainer.appendChild(newDiv);
    } catch (err) {
        console.error(err);
    }
    // frontend me commnet push kro 
}

