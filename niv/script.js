/* =====================================
   BibleLight
   script.js
   Part 1 / 3

   Daily Scripture Engine
===================================== */



// ===============================
// Global Data
// ===============================


let bibleData = [];

let todayQueue = [];

let currentVerse = null;



const STORAGE = {


    date:
    "biblelight_date",


    queue:
    "biblelight_queue",


    count:
    "biblelight_count"


};









// ===============================
// Start
// ===============================


document.addEventListener(

"DOMContentLoaded",

()=>{


    init();


}

);









async function init(){



    try{


        await loadBible();



        setupDailySystem();



        updateDate();



        showVerse();



        setupEvents();



    }


    catch(error){


        console.error(

            "Bible data error:",

            error

        );


    }


}









// ===============================
// Load Bible Data
// ===============================



async function loadBible(){



    const response =

    await fetch(

        "bible.json"

    );



    bibleData =

    await response.json();



}









// ===============================
// Date
// ===============================



function getToday(){



    const date =

    new Date();



    return (

        date.getFullYear()

        +

        "-"

        +

        String(

            date.getMonth()+1

        )

        .padStart(2,"0")

        +

        "-"

        +

        String(

            date.getDate()

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


    `${date.getFullYear()}年

    ${date.getMonth()+1}月

    ${date.getDate()}日`;



}









// ===============================
// Daily Queue System
// ===============================



function setupDailySystem(){



    const today =

    getToday();




    const savedDate =

    localStorage.getItem(

        STORAGE.date

    );







    // 新的一天


    if(savedDate !== today){



        createNewQueue();



        localStorage.setItem(

            STORAGE.date,

            today

        );



    }


    else{


        restoreQueue();



    }



}









// ===============================
// Create Random Queue
// ===============================



function createNewQueue(){



    let list =

    Array.from(

        {

            length:

            bibleData.length

        },


        (_,index)=>index


    );





    shuffle(list);





    todayQueue = list;





    saveQueue();





    localStorage.setItem(

        STORAGE.count,

        "0"

    );



}









// ===============================
// Restore Queue
// ===============================



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


        createNewQueue();


    }



}









// ===============================
// Save Queue
// ===============================



function saveQueue(){



    localStorage.setItem(

        STORAGE.queue,


        JSON.stringify(

            todayQueue

        )


    );


}









// ===============================
// Shuffle
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


        ] = [


            array[j],

            array[i]


        ];



    }



    return array;



}/* =====================================
   BibleLight
   script.js
   Part 2 / 3

   Reading Interaction
===================================== */





// ===============================
// Display Current Verse
// ===============================


function showVerse(){



    if(todayQueue.length === 0){



        createNewQueue();



    }





    const index =

    todayQueue[0];





    currentVerse =

    bibleData[index];





    renderVerse(

        currentVerse

    );





    updateReadingCount();



}









// ===============================
// Render Verse
// ===============================



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







    // 重新觸發動畫


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



    if(todayQueue.length === 0){



        createNewQueue();



    }





    // 移除已閱讀


    todayQueue.shift();





    saveQueue();





    increaseReadingCount();





    showVerse();



}









// ===============================
// Reading Count
// ===============================



function increaseReadingCount(){



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









function updateReadingCount(){



    const count =

    localStorage.getItem(

        STORAGE.count

    )

    ||

    0;





    document.getElementById(

        "readingCount"

    )

    .textContent = count;



}









// ===============================
// Button Events
// ===============================



function setupEvents(){



    document

    .getElementById(

        "nextVerse"

    )

    .addEventListener(

        "click",

        nextVerse

    );







    document

    .getElementById(

        "shareVerse"

    )

    .addEventListener(

        "click",

        shareVerse

    );



}









// ===============================
// Share Verse
// ===============================



async function shareVerse(){



    if(!currentVerse){

        return;

    }





    const content =



`${currentVerse.text}


— ${currentVerse.book}

${currentVerse.chapter}`;







    if(

        navigator.share

    ){



        try{


            await navigator.share({


                title:

                "每日經文",


                text:

                content



            });



        }


        catch(error){



            console.log(

                "Share cancelled"

            );


        }




    }



    else{



        await navigator.clipboard.writeText(

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



}/* =====================================
   BibleLight
   script.js
   Part 3 / 3

   Final Experience Layer
===================================== */





// ===============================
// Swipe Gesture
// ===============================


let touchStartX = 0;

let touchEndX = 0;





document.addEventListener(

"touchstart",

(event)=>{


    touchStartX =

    event.changedTouches[0]
    .screenX;



},

{
    passive:true
}

);








document.addEventListener(

"touchend",

(event)=>{


    touchEndX =

    event.changedTouches[0]
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





    const threshold = 80;






    // 左滑：下一節


    if(

        distance < -threshold

    ){



        nextVerse();



    }



}









// ===============================
// Keyboard Support
// ===============================


document.addEventListener(

"keydown",

(event)=>{



    if(

        event.code === "Space"

    ){



        nextVerse();



    }



}

);









// ===============================
// Daily Devotion
// ===============================


let devotionData = [];





async function loadDevotion(){



    try{


        const response =

        await fetch(

            "devotion.json"

        );



        devotionData =

        await response.json();



        showTodayDevotion();



    }



    catch(error){



        console.log(

            "No devotion data"

        );



    }



}









function showTodayDevotion(){



    if(

        devotionData.length === 0

    ){

        return;

    }





    const day =

    getDayOfYear();





    const devotion =

    devotionData[

        (day - 1)

        %

        devotionData.length

    ];





    console.log(

        "今日靈修:",

        devotion

    );



}









// ===============================
// Day Number
// ===============================



function getDayOfYear(){



    const now =

    new Date();



    const start =

    new Date(

        now.getFullYear(),

        0,

        0

    );



    const diff =

    now - start;



    return Math.floor(

        diff /

        (1000*60*60*24)

    );



}









// ===============================
// Midnight Refresh
// ===============================



function checkNewDay(){



    const saved =

    localStorage.getItem(

        STORAGE.date

    );



    const today =

    getToday();





    if(saved !== today){



        createNewQueue();



        localStorage.setItem(

            STORAGE.date,

            today

        );



        showVerse();



    }



}









setInterval(

()=>{


    checkNewDay();



},

60000

);









// ===============================
// Save Before Leave
// ===============================



window.addEventListener(

"beforeunload",

()=>{


    saveQueue();



}

);









// ===============================
// Storage Protection
// ===============================



function checkStorage(){



    try{


        localStorage.setItem(

            "test",

            "ok"

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
// Global Error Protection
// ===============================



window.addEventListener(

"error",

(error)=>{



    console.error(

        "BibleLight Error:",

        error.message

    );



}

);









// ===============================
// Start Extra Features
// ===============================



checkStorage();



loadDevotion();
