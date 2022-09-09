
function jaxify(string) {
    var mystring = string;
    console.log(mystring);

    var count = 0;
    var loc = mystring.search(/([^\\]|^)(\$)/);

    var count2 = 0;
    var loc2 = mystring.search(/([^\\]|^)(\$\$)/);

    //console.log(loc);

    while ((loc >= 0) || (loc2 >= 0)) {

        /* Have to replace all the double $$ first with current implementation */
        if (loc2 >= 0) {
            if (count2 % 2 == 0) {
                mystring = mystring.replace(/([^\\]|^)(\$\$)/, "$1\\[");
            } else {
                mystring = mystring.replace(/([^\\]|^)(\$\$)/, "$1\\]");
            }
            count2++;
        } else {
            if (count % 2 == 0) {
                mystring = mystring.replace(/([^\\]|^)(\$)/, "$1\\(");
            } else {
                mystring = mystring.replace(/([^\\]|^)(\$)/, "$1\\)");
            }
            count++;
        }
        loc = mystring.search(/([^\\]|^)(\$)/);
        loc2 = mystring.search(/([^\\]|^)(\$\$)/);
        //console.log(mystring,", loc:",loc,", loc2:",loc2);
    }

    //console.log(mystring);
    return mystring;
}

window.flipCard = function flipCard(ths) {
    console.log(ths);
    console.log(ths.id);
    ths.classList.toggle("flip"); 
    var next=document.getElementById(ths.id+'-next');
    next.style.pointerEvents='none';
    /* ths.blur(); */
    next.classList.add('flipped');
    if (typeof MathJax != 'undefined') {
        var version = MathJax.version;
        console.log('MathJax version', version);
        if (version[0] == "2") {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        } else if (version[0] == "3") {
            MathJax.typeset([ths]);
        }
    } else {
        console.log('MathJax not detected');
    }


    setTimeout(reenableNext, 600, ths, next);
}

window.checkKey = function checkKey(container, event) {
    event.stopPropagation();
    /*
    console.log(container);
    console.log(event.key);
    console.log(event.code);
    */
    /* JMS:  Working here*/
    var next=document.getElementById(container.id+'-next');
    /* Only react if not already sliding */
    if (! next.classList.contains("hide")) {
        if ((event.key == "j") || (event.key == "Enter") || (event.key == "ArrowRight")) {
            window.checkFlip(container.id);
        }
        if (event.key == " ") {
            window.flipCard(container);
        }
    }
    event.preventDefault();
}


function reenableNext(ths, next) {
    next.style.pointerEvents='auto';
    /* ths.tabIndex= 0;*/
    /* ths.focus(); */
}



function slide2(containerId) {
    var container = document.getElementById(containerId);
    var next=document.getElementById(containerId+'-next');
    var frontcard = container.children[0];
    var backcard = container.children[1];
    container.style.pointerEvents='none';
    /* container.removeAttribute("tabindex");*/
    /* container.blur(); */
    //backcard.style.pointerEvents='none';
    next.style.pointerEvents='none';
    next.classList.remove('flipped');
    next.classList.add('hide');

    //container.classList.add("prepare");
    
    container.className="flip-container slide";
    backcard.parentElement.removeChild(frontcard);
    backcard.parentElement.appendChild(frontcard);
    setTimeout(slideback, 600, container, frontcard, backcard, next);
    
}


window.checkFlip = function checkFlip(containerId) {
    var container = document.getElementById(containerId);


    if (container.classList.contains('flip')) {
        container.classList.remove('flip');
        setTimeout(slide2, 600, containerId);
    } 
    else {
        slide2(containerId);
    }
}


function slideback(container, frontcard, backcard, next) {
    container.className="flip-container slideback";
    setTimeout(cleanup, 550, container, frontcard, backcard, next);
}

function cleanup(container, frontcard, backcard, next) {
    container.removeChild(frontcard);
    backcard.className="flipper frontcard";
    container.className="flip-container";

    var cardnum=parseInt(container.dataset.cardnum);
    var cards=eval('cards'+container.id);
    var flipper=createOneCard(container, false, cards, cardnum);
    container.append(flipper);
    cardnum= (cardnum+1) % parseInt(container.dataset.numCards);
    container.dataset.cardnum=cardnum;
    if (cardnum != 1){
        next.innerHTML="Next >";
    } else {
        //next.innerHTML="Reload \\(\\circlearrowleft\\) ";
        next.innerHTML='Reload <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewbox="0 0 25 26"> <path d="M7,6a10,10,0,1,0,9,0" style="fill:none;stroke:black;stroke-width:2px" id="e2_circleArc"/> <line id="e3_line" x1="17" y1="6.5" x2="17.5" y2="15" style="stroke:black;fill:none;stroke-width:2px"/> <line id="e4_line" x1="16.5" y1="6.5" x2="26" y2="8" style="stroke:black;fill:none;stroke-width:2px"/> </svg> '
        if (typeof MathJax != 'undefined') {
            var version = MathJax.version;
            console.log('MathJax version', version);
            if (version[0] == "2") {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
            } else if (version[0] == "3") {
                MathJax.typeset([next]);
            }
        } else {
            console.log('MathJax not detected');
        }


    }

    if (typeof MathJax != 'undefined') {
        var version = MathJax.version;
        console.log('MathJax version', version);
        if (version[0] == "2") {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        } else if (version[0] == "3") {
            MathJax.typeset();
        }
    } else {
        console.log('MathJax not detected');
    }


    next.style.pointerEvents='auto';
    container.style.pointerEvents='auto';
    /* container.tabIndex= 0; */
    /* container.focus(); */
    next.classList.remove('hide');
    container.addEventListener('swiped-left', function(e) {
        /*
          console.log(e.detail);
          console.log(id);
        */
        checkFlip(container.id);
    }, {once: true });


}


function createOneCard  (mydiv, frontCard, cards, cardnum) {
    var colors=[
        '--asparagus',
        '--terra-cotta',
        '--cyan-process'
    ]

    var flipper = document.createElement('div');
    if (frontCard){
        flipper.className="flipper frontcard";    
    }
    else {
        flipper.className="flipper backcard";   
    }

    var front = document.createElement('div');
    front.className='front flashcard';

    var frontSpan= document.createElement('span');
    frontSpan.className='flashcardtext';
    frontSpan.innerHTML=jaxify(cards[cardnum]['front']);
    //frontSpan.textContent=jaxify(cards[cardnum]['front']);
    front.style.background='var(' + colors[cardnum % colors.length] + ')';


    front.append(frontSpan);
    flipper.append(front);

    var back = document.createElement('div');
    back.className='back flashcard';

    var backSpan= document.createElement('span');
    backSpan.className='flashcardtext';
    backSpan.innerHTML=jaxify(cards[cardnum]['back']);
    back.append(backSpan);

    flipper.append(back);

    return flipper;

}





function createCards(id, keyControl) {
    console.log(id);
    
    var mydiv=document.getElementById(id);
    /*mydiv.onclick = window.flipCard(mydiv);*/
    /*
    mydiv.addEventListener('click', function(){window.flipCard(mydiv);}, false);
    mydiv.addEventListener('keydown', function(event){window.checkKey(mydiv,event);}, true);
    */
    mydiv.onclick = function(){window.flipCard(mydiv);};
    console.log(keyControl);
    if (keyControl == "True"){
        mydiv.onkeydown = function(event){window.checkKey(mydiv,event);};
    }
    /* mydiv.addEventListener('keydown', function(event){event.stopPropagation(); console.log(event); event.preventDefault();}, true); */
    /*mydiv.onkeypress = function(event){console.log(event); event.preventDefault();};*/

    console.log(mydiv);
    
    var cards=eval('cards'+id);
    mydiv.dataset.cardnum=0;
    mydiv.dataset.numCards=cards.length;
    mydiv.addEventListener('swiped-left', function(e) {
        /*
          console.log(e.detail);
          console.log(id);
        */
        checkFlip(id);
    }, {once: true});

    var cardnum=0;
    
    for (var i=0; i<2; i++) {
    
        var flipper;
        if (i==0){
            flipper=createOneCard(mydiv, true, cards, cardnum);
        }
        else {
            flipper=createOneCard(mydiv, false, cards, cardnum);
        }

        mydiv.append(flipper);
        if (typeof MathJax != 'undefined') {
            var version = MathJax.version;
            if (typeof version == 'undefined') {
                setTimeout(function(){
                    var version = MathJax.version;
                    console.log('After sleep, MathJax version', version);
                    if (version[0] == "2") {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                    } else if (version[0] == "3") {
                        MathJax.typeset([flipper]);
                    }
                }, 500);
            } else{
                console.log('MathJax version', version);
                if (version[0] == "2") {
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                } else if (version[0] == "3") {
                    MathJax.typeset([flipper]);
                }
            }
        } else {
            console.log('MathJax not detected');
        }


        cardnum = (cardnum + 1) % mydiv.dataset.numCards;
    }
    mydiv.dataset.cardnum = cardnum;

    var next=document.getElementById(id+'-next');
    if (cards.length==1) {
        // Don't show next if no other cards!
        next.style.pointerEvents='none';
        next.classList.add('hide');
    } else {
        next.innerHTML="Next >";
    }

    mydiv.focus();

    return flipper;
}




