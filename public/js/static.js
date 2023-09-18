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
        await fetch(`/user/deletePost/${postId}`,{method:"post"})
        window.location.href='/user/feed';
    } catch (e) {
        console.error(e);
    }
    
}