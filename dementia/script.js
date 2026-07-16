/* =====================================
   BibleVerse
   script.js
   Part 1 / 3

   Daily Verse Engine
===================================== */



// ===============================
// Global Variables
// ===============================


let bibleData = [];

let todayQueue = [];

let currentVerse = null;

let favoriteList = [];





// LocalStorage Keys


const STORAGE = {


    date:"bible_today_date",


    queue:"bible_today_queue",


    count:"bible_read_count",


    favorites:"bible_favorites"


};








// ===============================
// Start Application
// ===============================


document.addEventListener(
"DOMContentLoaded",
()=>{


    init();


});









async function init(){



    try{


        showLoading();



        await loadBible();



        loadFavorites();



        setupToday();



        updateDate();



        displayVerse();



        setupEvents();



        hideLoading();



    }

    catch(error){


        console.error(
            "Bible loading error:",
            error
        );


    }



}








// ===============================
// Load Bible JSON
// ===============================


async function loadBible(){


    const response = await fetch(
        "bible.json"
    );


    bibleData =
    await response.json();



}








// ===============================
// Date System
// ===============================



function getToday(){


    const now =
    new Date();



    return (

        now.getFullYear()

        +

        "-"

        +

        String(
            now.getMonth()+1
        )
        .padStart(2,"0")

        +

        "-"

        +

        String(
            now.getDate()
        )
        .padStart(2,"0")

    );


}








function updateDate(){


    const element =
    document.getElementById(
        "todayDate"
    );


    const date =
    new Date();



    element.textContent =

    `${date.getFullYear()}年${
        date.getMonth()+1
    }月${
        date.getDate()
    }日`;



}








// ===============================
// Daily Queue
// ===============================



function setupToday(){



    const today =
    getToday();



    const savedDate =
    localStorage.getItem(
        STORAGE.date
    );




    // 新的一天


    if(savedDate !== today){



        createNewDay();



        localStorage.setItem(

            STORAGE.date,

            today

        );



    }

    else{


        restoreQueue();


    }



}








// 建立今日閱讀清單


function createNewDay(){



    let numbers =

    Array.from(

        {
            length:bibleData.length
        },

        (_,i)=>i

    );



    shuffle(numbers);



    todayQueue =
    numbers;



    saveQueue();



    localStorage.setItem(

        STORAGE.count,

        "0"

    );



}








// 恢復今日進度


function restoreQueue(){



    const saved =

    localStorage.getItem(

        STORAGE.queue

    );



    if(saved){



        todayQueue =

        JSON.parse(saved);



    }

    else{


        createNewDay();


    }



}








// 儲存 Queue


function saveQueue(){



    localStorage.setItem(

        STORAGE.queue,

        JSON.stringify(
            todayQueue
        )

    );



}








// ===============================
// Shuffle Algorithm
// Fisher-Yates
// ===============================


function shuffle(array){



    for(
        let i=array.length-1;
        i>0;
        i--
    ){



        const j =

        Math.floor(

            Math.random()

            *

            (i+1)

        );



        [
            array[i],
            array[j]

        ]

        =

        [
            array[j],
            array[i]

        ];



    }



    return array;



}
/* =====================================
   Verse Display & Interaction
   Part 2 / 3
===================================== */





// ===============================
// Display Verse
// ===============================


function displayVerse(){



    if(todayQueue.length === 0){



        createNewDay();



    }




    const index =

    todayQueue[0];



    currentVerse =

    bibleData[index];



    renderVerse(
        currentVerse
    );



    updateCount();



}









function renderVerse(data){



    const text =

    document.getElementById(
        "verseText"
    );



    const book =

    document.getElementById(
        "verseBook"
    );



    const chapter =

    document.getElementById(
        "verseChapter"
    );





    // 動畫重置


    text.classList.remove(
        "verse-change"
    );



    void text.offsetWidth;



    text.classList.add(
        "verse-change"
    );





    text.textContent =
    data.text;



    book.textContent =
    data.book;



    chapter.textContent =
    data.chapter;



}









// ===============================
// Next Verse
// ===============================


function nextVerse(){



    if(todayQueue.length===0){


        createNewDay();


    }




    // 移除目前經文


    todayQueue.shift();



    saveQueue();



    increaseCount();



    displayVerse();



}









// ===============================
// Reading Counter
// ===============================



function increaseCount(){



    let count =

    Number(

        localStorage.getItem(

            STORAGE.count

        )

        ||

        0

    );



    count++;



    localStorage.setItem(

        STORAGE.count,

        count

    );



}







function updateCount(){



    const count =

    localStorage.getItem(

        STORAGE.count

    )

    ||

    0;



    document
    .getElementById(
        "count"
    )
    .textContent = count;



}









// ===============================
// Events
// ===============================



function setupEvents(){



    const next =

    document.getElementById(
        "nextBtn"
    );



    next.addEventListener(

        "click",

        nextVerse

    );





    document

    .getElementById(
        "favoriteBtn"
    )

    .addEventListener(

        "click",

        toggleFavorite

    );





    document

    .getElementById(
        "shareBtn"
    )

    .addEventListener(

        "click",

        shareVerse

    );



}









// ===============================
// Favorite System
// ===============================


function loadFavorites(){



    favoriteList =

    JSON.parse(

        localStorage.getItem(

            STORAGE.favorites

        )

        ||

        "[]"

    );



}








function toggleFavorite(){



    if(!currentVerse)

    return;





    const id =

    bibleData.indexOf(
        currentVerse
    );





    const exists =

    favoriteList.includes(
        id
    );





    if(exists){



        favoriteList =

        favoriteList.filter(

            item=>

            item!==id

        );



        showToast(
            "已取消收藏"
        );



    }

    else{



        favoriteList.push(
            id
        );


        showToast(
            "已收藏經文"
        );


    }






    localStorage.setItem(

        STORAGE.favorites,

        JSON.stringify(
            favoriteList
        )

    );



    updateFavoriteButton();



}









function updateFavoriteButton(){



    const button =

    document.getElementById(

        "favoriteBtn"

    );



    const id =

    bibleData.indexOf(
        currentVerse
    );





    if(

        favoriteList.includes(id)

    ){



        button.classList.add(
            "favorite"
        );



        button.innerHTML =
        "♥ 已收藏";



    }

    else{


        button.classList.remove(
            "favorite"
        );



        button.innerHTML =
        "♡ 收藏";



    }



}









// ===============================
// Share
// ===============================



async function shareVerse(){



    if(!currentVerse)

    return;





    const content =



    `${currentVerse.text}



— ${currentVerse.book}

${currentVerse.chapter}`;







    if(
        navigator.share
    ){



        navigator.share({

            title:"每日經文",

            text:content

        });



    }

    else{


        navigator.clipboard.writeText(
            content
        );


        showToast(
            "經文已複製"
        );


    }



}









// ===============================
// Toast
// ===============================



let toastTimer;



function showToast(message){



    const toast =

    document.getElementById(
        "toast"
    );



    toast.textContent =
    message;



    toast.classList.add(
        "show"
    );




    clearTimeout(
        toastTimer
    );



    toastTimer =

    setTimeout(()=>{


        toast.classList.remove(
            "show"
        );


    },2000);



}
/* =====================================
   Mobile Experience & Final System
   Part 3 / 3
===================================== */





// ===============================
// Loading Control
// ===============================


function showLoading(){


    const loading =

    document.getElementById(
        "loading"
    );


    if(loading){


        loading.classList.remove(
            "hide"
        );


    }


}








function hideLoading(){



    const loading =

    document.getElementById(
        "loading"
    );



    if(loading){


        setTimeout(()=>{


            loading.classList.add(
                "hide"
            );



            document.body.classList.add(
                "loaded"
            );



        },500);



    }



}









// ===============================
// Swipe Gesture
// ===============================


let touchStartX = 0;

let touchEndX = 0;





document.addEventListener(

"touchstart",

(e)=>{


    touchStartX =

    e.changedTouches[0]
    .screenX;



},

{
    passive:true
}

);






document.addEventListener(

"touchend",

(e)=>{


    touchEndX =

    e.changedTouches[0]
    .screenX;



    handleSwipe();



},

{
    passive:true
}

);







function handleSwipe(){



    const distance =

    touchEndX -

    touchStartX;





    const limit = 80;





    // 左滑下一節


    if(
        distance < -limit
    ){



        nextVerse();



    }



}









// ===============================
// Keyboard Support
// Desktop
// ===============================


document.addEventListener(

"keydown",

(e)=>{


    if(
        e.code === "Space"
    ){


        nextVerse();


    }


}

);









// ===============================
// Prevent accidental refresh
// ===============================


window.addEventListener(

"beforeunload",

()=>{


    saveQueue();



}

);









// ===============================
// Favorite Button State Refresh
// ===============================


setInterval(()=>{


    if(currentVerse){


        updateFavoriteButton();



    }


},1000);









// ===============================
// Check Storage Safety
// ===============================



function checkStorage(){



    try{


        localStorage.setItem(
            "test",
            "1"
        );


        localStorage.removeItem(
            "test"
        );


        return true;



    }

    catch(error){



        console.warn(
            "LocalStorage unavailable"
        );


        return false;



    }



}









// ===============================
// PWA Install Ready
// ===============================


let deferredPrompt;




window.addEventListener(

"beforeinstallprompt",

(e)=>{


    e.preventDefault();


    deferredPrompt = e;



    console.log(
        "PWA install available"
    );


}

);








async function installApp(){



    if(!deferredPrompt){


        return;


    }



    deferredPrompt.prompt();



    await deferredPrompt.userChoice;



    deferredPrompt=null;



}









// ===============================
// Visibility Restore
// ===============================


document.addEventListener(

"visibilitychange",

()=>{



    if(
        document.visibilityState
        ===
        "visible"
    ){



        restoreQueue();



    }



}

);









// ===============================
// Error Handler
// ===============================


window.addEventListener(

"error",

(error)=>{


    console.error(

        "BibleVerse Error:",

        error.message

    );


}

);









// ===============================
// Start Check
// ===============================


checkStorage();
