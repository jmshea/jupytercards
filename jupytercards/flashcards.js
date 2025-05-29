
function jaxify(string) {
    var mystring = string;
    //console.log(mystring);

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

/**
 * Set active topics on a flashcard container and re-render cards.
 * @param {string|Element} idOrElem - The container's id or the DOM element.
 * @param {string|string[]} topics - Topic or array of topics to filter by.
 */
window.setTopics = function(idOrElem, topics) {
    var mydiv = (typeof idOrElem === 'string') ? document.getElementById(idOrElem) : idOrElem;
    if (!mydiv) return;
    // Normalize topics to array
    var topicsArr = Array.isArray(topics) ? topics : (typeof topics === 'string' ? [topics] : []);
    mydiv.dataset.topics = JSON.stringify(topicsArr);
    // Re-render cards
    createCards(mydiv.id);
};

window.flipCard = function flipCard(ths) {
    //console.log(ths);
    //console.log(ths.id);
    ths.classList.toggle("flip"); 
    ths.focus();
    var next=document.getElementById(ths.id+'-next');
    next.style.pointerEvents='none';
    /* ths.blur(); */
    next.classList.add('flipped');
    if (typeof MathJax != 'undefined') {
        var version = MathJax.version;
        //console.log('MathJax version', version);
        if (version[0] == "2") {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        } else if (version[0] == "3") {
            MathJax.typeset([ths]);
        }
    } else {
        //console.log('MathJax not detected');
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

    let cardOrder = JSON.parse(container.dataset.cardOrder);

    //var cards=eval('cards'+container.id);
    var cards=JSON.parse(container.dataset.cards);

    var flipper=createOneCard(container, false, cards, cardOrder[cardnum], cardnum);
    container.append(flipper);
    cardnum= (cardnum+1) % parseInt(container.dataset.numCards);
    if ((cardnum == 0) && (container.dataset.shuffleCards == "true")) {
        cardOrder = randomOrderArray(parseInt(container.dataset.numCards));
        container.dataset.cardOrder = JSON.stringify(cardOrder);
        //console.log(cardOrder);
    }

    container.dataset.cardnum=cardnum;
    if (cardnum != 1){
        next.innerHTML="Next >";
    } else {
        //next.innerHTML="Reload \\(\\circlearrowleft\\) ";
        next.innerHTML = 'Reload <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 25 26"><use xlink:href="#reload-icon"/></svg>';
        if (typeof MathJax != 'undefined') {
            var version = MathJax.version;
            //console.log('MathJax version', version);
            if (version[0] == "2") {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
            } else if (version[0] == "3") {
                MathJax.typeset([next]);
            }
        } else {
            //console.log('MathJax not detected');
        }


    }

    if (typeof MathJax != 'undefined') {
        var version = MathJax.version;
        //console.log('MathJax version', version);
        if (version[0] == "2") {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        } else if (version[0] == "3") {
            MathJax.typeset();
        }
    } else {
        //console.log('MathJax not detected');
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


function createOneCard  (mydiv, frontCard, cards, cardnum, seq) {
    /*
    var colors=eval('frontColors'+mydiv.id);
    var backColors=eval('backColors'+mydiv.id);
    var textColors=eval('textColors'+mydiv.id);
    */
    var colors = JSON.parse(mydiv.dataset.frontColors);
    var backColors = JSON.parse(mydiv.dataset.backColors);
    var textColors = JSON.parse(mydiv.dataset.textColors);

    //console.log(backColors)

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
    frontSpan.style.color=textColors[seq % textColors.length];
    //frontSpan.textContent=jaxify(cards[cardnum]['front']);
    //front.style.background='var(' + colors[cardnum % colors.length] + ')';
    front.style.background=colors[seq % colors.length];
    front.append(frontSpan);

    // Add check mark symbol for card known
    var knownSpan= document.createElement('span');
    knownSpan.className = 'flashcardKnown';
    knownSpan.innerHTML= '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 25 26"><use xlink:href="#check-mark"/></svg>';
    front.append(knownSpan);

    // Add x mark symbol for card not known
    var notKnownSpan= document.createElement('span');
    notKnownSpan.className = 'flashcardNotKnown';
    notKnownSpan.innerHTML= '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 25 26"><use xlink:href="#x-mark"/></svg>';
    front.append(notKnownSpan);




    flipper.append(front);

    var back = document.createElement('div');
    back.className='back flashcard';
    back.style.background=backColors[seq % backColors.length];

    var backSpan= document.createElement('span');
    backSpan.className='flashcardtext';
    backSpan.innerHTML=jaxify(cards[cardnum]['back']);
    backSpan.style.color=textColors[seq % textColors.length];
    back.append(backSpan);

    flipper.append(back);

    return flipper;

}

function randomOrderArray(N) {
    // Create an array with numbers from 0 to N-1
    let arr = Array.from({ length: N }, (_, index) => index);

    // Shuffle the array using Fisher-Yates algorithm
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

function createStructuredData(mydiv, cards, title, subject) {
    var structuredData = {
        "@context": "https://schema.org/",
        "@type": "Quiz",
        "about": {
            "@type": "Thing"
        },
        "educationalAlignment": [
            {
                "@type": "AlignmentObject",
                "alignmentType": "educationalSubject"
            }
        ],
        "hasPart": []
    };

    structuredData["about"]["name"] = title;
    structuredData["educationalAlignment"][0]["targetName"] = subject;

    for (var i=0; i<cards.length; i++) {
        var newPart = {
            "@context": "https://schema.org/",
            "@type": "Question",
            "eduQuestionType": "Flashcard",
            "acceptedAnswer": {
                "@type": "Answer",
            }
        };

        newPart["text"] = cards[i]["front"];
        newPart["acceptedAnswer"]["text"] = cards[i]["back"];

        structuredData["hasPart"].push(newPart);
    }
    /*console.log(structuredData);*/

    var el = document.createElement('script');
    el.type = 'application/ld+json';
    el.text = JSON.stringify(structuredData);

    mydiv.parentElement.appendChild(el);

}



function createCards(id) {
    var mydiv = document.getElementById(id);
    if (!mydiv) return;

    // Retrieve parameters from dataset
    var keyControl = mydiv.dataset.keyControl === 'true';
    var grabFocus = mydiv.dataset.grabFocus === 'true';
    var shuffleCards = mydiv.dataset.shuffleCards === 'true';
    var title = mydiv.dataset.title || '';
    var subject = mydiv.dataset.subject || '';
    var frontColors = JSON.parse(mydiv.dataset.frontColors || '[]');
    var backColors = JSON.parse(mydiv.dataset.backColors || '[]');
    var textColors = JSON.parse(mydiv.dataset.textColors || '[]');

    // Bootstrap topics: filter cards based on data-topics attribute
    var topics = [];
    if (mydiv.dataset.topics) {
        try {
            topics = JSON.parse(mydiv.dataset.topics);
        } catch (e) {
            topics = [mydiv.dataset.topics];
        }
    }

    // Initialize cards array from dataset
    var cards = JSON.parse(mydiv.dataset.cards || '[]');

    // Preserve full set of cards in dataset.fullCards
    var fullCards;
    if (mydiv.dataset.fullCards) {
        fullCards = JSON.parse(mydiv.dataset.fullCards);
    } else {
        fullCards = cards;
        mydiv.dataset.fullCards = JSON.stringify(fullCards);
    }

    // Filter cards by topics if provided
    if (topics.length > 0) {
        cards = fullCards.filter(function(card) {
            var t = card.topic;
            if (Array.isArray(t)) {
                return topics.some(function(topic) { return t.includes(topic); });
            }
            return topics.includes(t);
        });
    } else {
        cards = fullCards;
    }

    // Set up click and keyboard controls
    mydiv.onclick = function(){ window.flipCard(mydiv); };
    if (keyControl) {
        mydiv.onkeydown = function(event){ window.checkKey(mydiv, event); };
    }
    // Save parameters for dynamic topic changes
    mydiv.dataset.keyControl = keyControl;
    mydiv.dataset.grabFocus = grabFocus;
    mydiv.dataset.title = title;
    mydiv.dataset.subject = subject;
    /* mydiv.addEventListener('keydown', function(event){event.stopPropagation(); console.log(event); event.preventDefault();}, true); */
    /*mydiv.onkeypress = function(event){console.log(event); event.preventDefault();};*/

    //console.log(mydiv);

    // var cards=eval('cards'+id);
    // Store cards and color data in the container's dataset for later access in cleanup()
    mydiv.dataset.cards = JSON.stringify(cards);
    mydiv.dataset.frontColors = JSON.stringify(frontColors);
    mydiv.dataset.backColors = JSON.stringify(backColors);
    mydiv.dataset.textColors = JSON.stringify(textColors);

    mydiv.dataset.cardnum=0;
    mydiv.dataset.numCards=cards.length;

    mydiv.dataset.shuffleCards = shuffleCards;
    var cardOrder;
    if (shuffleCards == true){
        cardOrder = randomOrderArray(cards.length);
    } else {
        cardOrder = Array.from({ length: cards.length }, (_, index) => index);
    }
    mydiv.dataset.cardOrder = JSON.stringify(cardOrder);
    //console.log(mydiv.dataset.cardOrder);


    mydiv.addEventListener('swiped-left', function(e) {
        /*
          console.log(e.detail);
          console.log(id);
        */
        checkFlip(id);
    }, {once: true});

    if ((title!="") || (subject != "")){
        createStructuredData(mydiv, cards, title, subject);
    }

    var cardnum=0;

    for (var i=0; i<2; i++) {



        var flipper;
        if (i==0){
            flipper=createOneCard(mydiv, true, cards, cardOrder[cardnum], cardnum);
        }
        else {
            flipper=createOneCard(mydiv, false, cards, cardOrder[cardnum], cardnum);
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
                        if (MathJax.hasOwnProperty('typeset') ) {
                            MathJax.typeset([flipper]);
                        } else {
                            console.log('WARNING: Trying to force load MathJax 3');
                            window.MathJax = {
                                tex: {
                                    inlineMath: [['$', '$'], ['\\(', '\\)']]
                                },
                                svg: {
                                    fontCache: 'global'
                                }
                            };

                            (function () {
                                var script = document.createElement('script');
                                script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
                                script.async = true;
                                document.head.appendChild(script);
                            })();
                        }
                        MathJax.typeset([flipper]);
                    }
                }, 500);
            } else{
                console.log('MathJax version', version);
                if (version[0] == "2") {
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                } else if (version[0] == "3") {
                    if (version[0] == "2") {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                    } else if (version[0] == "3") {
                        if (MathJax.hasOwnProperty('typeset') ) {
                            MathJax.typeset([flipper]);
                        } else {
                            console.log('WARNING: Trying to force load MathJax 3');
                            window.MathJax = {
                                tex: {
                                    inlineMath: [['$', '$'], ['\\(', '\\)']]
                                },
                                svg: {
                                    fontCache: 'global'
                                }
                            };

                            (function () {
                                var script = document.createElement('script');
                                script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
                                script.async = true;
                                document.head.appendChild(script);
                            })();
                        }
                        MathJax.typeset([flipper]);
                    }
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

    if (grabFocus == true )
        mydiv.focus();

    return flipper;
}
// Helper to change topics and re-render flashcards dynamically
window.setTopics = function(idOrElem, topics) {
    var mydiv = (typeof idOrElem === 'string') ? document.getElementById(idOrElem) : idOrElem;
    if (!mydiv) return;
    var topicsArr = Array.isArray(topics) ? topics : (typeof topics === 'string' ? [topics] : []);
    mydiv.dataset.topics = JSON.stringify(topicsArr);
    createCards(mydiv.id);
};




