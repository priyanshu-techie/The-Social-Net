const likeButton=document.getElementById('likeButton')
const likeCount=document.getElementById('likeCount')

likeButton.onclick=function (){
    likeButton.classList.remove('fa-regular')
    likeButton.classList.add('fa-solid')
    likeButton.classList.add('redcolor')
    let count=Number(likeCount.innerText);
    count++;
    likeCount.innerText=count;
}