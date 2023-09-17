async function increaseLike(elem){
    let parent=elem.parentNode;
    let likeCount=parent.childNodes[3];
    let likes=Number(likeCount.innerText);
    let postId =parent.dataset.id

    // if not liked then :
    if(elem.classList.contains('fa-regular')){
        // frontend part
        elem.classList.remove('fa-regular');
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