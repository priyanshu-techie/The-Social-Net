function increaseLike(elem){
    let parent=elem.parentNode;
    let likeCount=parent.childNodes[3];
    let likes=Number(likeCount.innerText);

    if(elem.classList.contains('fa-regular')){
        elem.classList.remove('fa-regular');
        elem.classList.add('fa-solid');
        elem.style.color='#ff0000';
        likes++;
    }
    else{
        elem.classList.remove('fa-solid');
        elem.classList.add('fa-regular');
        elem.style.color='black';
        likes--;
    }
    likeCount.innerText=likes;
    }