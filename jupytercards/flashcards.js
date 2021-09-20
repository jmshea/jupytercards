
function jaxify(string) {
    var mystring = string;

    count = 0;
    var loc = mystring.search(/([^\\]|^)(\$)/);

    count2 = 0;
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

function flip(ths) {
    console.log(ths);
    console.log(ths.id);
    ths.classList.toggle("flip"); 
    var next=document.getElementById(ths.id+'-next');
    next.style.pointerEvents='none';
    next.classList.add('flipped');
    setTimeout(reenableNext, 700, next);
}

function reenableNext(next) {
    next.style.pointerEvents='auto';
}



function slide2(containerId) {
    var container = document.getElementById(containerId);
    var next=document.getElementById(containerId+'-next');
    var frontcard = container.children[0];
    var backcard = container.children[1];
    container.style.pointerEvents='none';
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


function checkFlip(containerId) {
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
    setTimeout(cleanup, 600, container, frontcard, backcard, next);
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
        next.innerHTML="Reload \\(\\circlearrowleft\\) ";
    }
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    next.style.pointerEvents='auto';
    container.style.pointerEvents='auto';
    next.classList.remove('hide');


}


function createOneCard  (mydiv, frontCard, cards, cardnum) {
    colors=[
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
    front.className='front card';

    var frontSpan= document.createElement('span');
    frontSpan.className='cardtext';
    frontSpan.innerHTML=jaxify(cards[cardnum]['front']);
    //frontSpan.textContent=jaxify(cards[cardnum]['front']);
    front.style.background='var(' + colors[cardnum % colors.length] + ')';


    front.append(frontSpan);

    flipper.append(front);

    var back = document.createElement('div');
    back.className='back card';

    var backSpan= document.createElement('span');
    backSpan.className='cardtext';
    backSpan.innerHTML=jaxify(cards[cardnum]['back']);
    back.append(backSpan);

    flipper.append(back);

    return flipper;

}





function createCards(id) {
    console.log(id);
    
    var mydiv=document.getElementById(id);
    
    var cards=eval('cards'+id);
    mydiv.dataset.cardnum=0;
    mydiv.dataset.numCards=cards.length;

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

    return flipper;
}




