
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

window.resetDeleteList = function(container) {
    container.dataset.deleteList = JSON.stringify([]);
    // Clear persisted deleteList in localStorage if consented
    (function() {
        var storageSuffix = container.dataset.localStorageKey;
        if (!storageSuffix) {
            try {
                storageSuffix = JSON.parse(container.dataset.cards)[0]['front'] || 'flashcards';
            } catch (e) {
                storageSuffix = 'flashcards';
            }
        }
        var allowKey = 'jc-allow-storage-' + storageSuffix;
        var deleteKey = 'jc-deleteList-' + storageSuffix;
        if (window.localStorage && window.localStorage.getItem(allowKey) === 'true') {
            window.localStorage.removeItem(deleteKey);
        }
    })();

}

window.flipCard = function flipCard(ths) {

    var container = ths;
    //console.log(ths);
    //console.log(ths.id);
    if (container.firstChild.firstChild.classList.contains('complete')) {
        //console.log("Restarting flashcards");
        window.resetDeleteList(container);
        container.dataset.cardnum = 0;

        // Render cards
        container.innerHTML = '';
        createCards(container.id);
    } else {
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



function slide2(containerId, mode) {
    //console.log("Sliding container:", containerId, "with mode:", mode);
    var container = document.getElementById(containerId);
    var next=document.getElementById(containerId+'-next');
    var frontcard = container.children[0];
    var backcard = container.children[1];
    container.style.pointerEvents='none';
    var deleteList = JSON.parse(container.dataset.deleteList || '[]');
    if (mode == "known") {
        deleteList.push(JSON.parse(frontcard.dataset.seqNum));
        container.dataset.deleteList = JSON.stringify(deleteList);
        //console.log("deleteList", deleteList);
        // Persist deleteList in localStorage if consented
        (function() {
            var storageSuffix = container.dataset.localStorageKey;
            if (!storageSuffix) {
                try {
                    storageSuffix = JSON.parse(container.dataset.cards)[0]['front'] || 'flashcards';
                } catch (e) {
                    storageSuffix = 'flashcards';
                }
            }
            var allowKey = 'jc-allow-storage-' + storageSuffix;
            var deleteKey = 'jc-deleteList-' + storageSuffix;
            if (window.localStorage && window.localStorage.getItem(allowKey) === 'true') {
                window.localStorage.setItem(deleteKey, container.dataset.deleteList);
            }
        })();
    } else if (mode == "notKnown") {
        // Nothing to do for now
    }

    var numCards = container.dataset.numCards;


    if (deleteList.length < numCards) {

        // Hide the next button until done sliding
        next.style.pointerEvents='none';
        next.classList.remove('flipped');
        next.classList.add('hide');

        //container.classList.add("prepare");

        container.className="flip-container slide";

        backcard.parentElement.removeChild(frontcard);
        backcard.parentElement.appendChild(frontcard);

        setTimeout(slideback, 600, container, frontcard, backcard, next, mode);
    } else {
        frontcard.innerHTML = '';
        frontcard.classname = 'front complete';
        var msg = document.createElement('div');
        //msg.className = 'front flashcard complete';
        msg.className = 'front complete';
        var span = document.createElement('span');
        span.className = 'flashcardtext complete';
        //span.style.color = 'black';
        span.textContent = 'You have learned all of the flashcards! Click to start over.';
        msg.appendChild(span);
        frontcard.appendChild(msg);
        container.style.pointerEvents='auto';

    }
}


window.checkFlip = function checkFlip(containerId) {
    var container = document.getElementById(containerId);

if (container.classList.contains('flip')) {
        container.classList.remove('flip');
            setTimeout(slide2, 600, containerId, 'next');
    } else {
        slide2(containerId, 'next');
    }
}


function slideback(container, frontcard, backcard, next, mode) {
    container.className="flip-container slideback";
    setTimeout(cleanup, 550, container, frontcard, backcard, next, mode);
}

function cleanup(container, frontcard, backcard, next, mode) {

    var deleteList = JSON.parse(container.dataset.deleteList || '[]');

    container.removeChild(frontcard);
    backcard.className="flipper frontcard";
    container.className="flip-container";


    // Track the current index before increment
    var cardnum=parseInt(container.dataset.cardnum);

    let cardOrder = JSON.parse(container.dataset.cardOrder);

    var cards=JSON.parse(container.dataset.cards);
    var numCards = container.dataset.numCards;
    var cardsLeft = parseInt(container.dataset.numCards, 10) - deleteList.length;
    // check if this card's seqNum is in the deleteList
    while ( deleteList.includes(cardOrder[cardnum]) ) {
        cardnum = (cardnum + 1) % parseInt(numCards);
        //console.log("Skipping card number:", cardnum, "of", numCards);
    }

    var flipper=createOneCard(container, false, cards, cardOrder[cardnum], cardnum, cardsLeft);

    container.append(flipper);
    cardnum= (cardnum+1) % parseInt(numCards);
    //console.log("Next card number:", cardnum, "of", numCards);

    container.dataset.cardnum = cardnum;
    // Determine button label based on position in cycle
    if (cardsLeft > 1) {
        // On last card of cycle, show Reload; otherwise Next
        //if (currentIdx === cardsLeft - 1) {
        // JMS: This is currently broken when using known cards
        if (cardnum == 1 ) {
            next.innerHTML = 'Reload <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 25 26"><use xlink:href="#reload-icon"/></svg>';
        } else {
            next.innerHTML = 'Next >';
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
    // Hide Next when only one or no cards remain
    if (cardsLeft > 1) {
        next.classList.remove('hide');
        next.style.pointerEvents = 'auto';
    } else { // Hide the notKnown button if only one card left
        var notKnown = backcard.querySelector('.flashcardNotKnown');
        notKnown.classList.add('hide');
        notKnown.pointerEvents = 'none';
        //console.log(notKnown);
        //console.log(backcard.querySelector('.flashcardNotKnown'));
    }

    if (parseInt(container.dataset.numCards, 10) <= 1) {
        next.classList.add('hide');
        next.style.pointerEvents = 'none';
    }
    container.addEventListener('swiped-left', function(e) {
        /*
          console.log(e.detail);
          console.log(id);
        */
        checkFlip(container.id);
    }, {once: true });

}


function createOneCard  (mydiv, frontCard, cards, cardnum, seq) {

    var colors = JSON.parse(mydiv.dataset.frontColors);
    var backColors = JSON.parse(mydiv.dataset.backColors);
    var textColors = JSON.parse(mydiv.dataset.textColors);


    var flipper = document.createElement('div');
    flipper.dataset.seqNum = cards[cardnum]['seqNum'];

    // JMS: Can this be removed now? Should colors only depend on seqNum, so they are consistent?
    flipper.dataset.cardnum = cardnum;

    //console.log('Creating card', cardnum, 'with sequence', seq);
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
    // Hide known/not-known icons if disabled via known_widgets flag
    if (mydiv.dataset.knownWidgets === 'false') {
        knownSpan.style.display = 'none';
        knownSpan.style.pointerEvents = 'none';
        notKnownSpan.style.display = 'none';
        notKnownSpan.style.pointerEvents = 'none';
    }




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

    // Handle known click: remove card and advance or restart when done
    knownSpan.addEventListener('click', function(e) {
        e.stopPropagation();
        // Starting point -- just slide and then start to port this stuff over
        slide2(mydiv.id, 'known');

    });


    // Handle not-known click: just advance
    notKnownSpan.addEventListener('click', function(e) {
        e.stopPropagation();
        //window.checkFlip(mydiv.id);
        slide2(mydiv.id, 'notKnown');
    });

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


    // Bootstrap topics: filter cards based on data-topics attribute
    var topics = [];
    if (mydiv.dataset.topics) {
        try {
            topics = JSON.parse(mydiv.dataset.topics);
        } catch (e) {
            topics = [mydiv.dataset.topics];
        }
    }

    // Handle localStorage consent prompt
    var localStorageEnabled = mydiv.dataset.localStorage === 'true';
    if (localStorageEnabled) {
        var lsKey = mydiv.dataset.url || ''
        if (lsKey == '') {
            lsKey = fullCards[0]['front'] || 'flashcards';
        }

        if (topics && topics != []) {
            lsKey +='-' + mydiv.dataset.topics.replace(/[\[\]\"\'\s]/g, '');
        }
        console.log('LocalStorage key:', lsKey);
        mydiv.dataset.localStorageKey = lsKey;

        lsKey = 'jc-allow-storage-' + lsKey;
        //console.log('LocalStorage key:', lsKey);
        if (!window.localStorage.getItem(lsKey)) {
            var flipper = document.createElement('div');

            // JMS: Can this be removed now? Should colors only depend on seqNum, so they are consistent?
            flipper.dataset.cardnum = cardnum;

            flipper.className="flipper frontcard";    

            var front = document.createElement('div');
            front.className='front complete';


            var frontSpan= document.createElement('span');
            frontSpan.className='flashcardtext storage';
            frontSpan.innerHTML= 'Do you want to store information on your progress in learning these flashcards on your local machine?<br><br>' +
                '<div class="flashcard buttons">' + 
                '<button id="' + id + '-ls-yes" class="flashcard button">Yes</button> ' +
                '<button id="' + id + '-ls-no" class="flashcard button">No</button>' +
                '</div>';


            front.append(frontSpan);

            flipper.append(front);
            mydiv.append(flipper);

            document.getElementById(id + '-ls-yes').onclick = function(event) {
                window.localStorage.setItem(lsKey, 'true');
                mydiv.dataset.localStorage = 'false';
               
                var frontcard = mydiv.children[0];
                mydiv.removeChild(frontcard);

                createCards(id);
                event.preventDefault();
                event.stopPropagation();
            };
            document.getElementById(id + '-ls-no').onclick = function(event) {
                mydiv.dataset.localStorage = 'false';
                var frontcard = mydiv.children[0];
                mydiv.removeChild(frontcard);

                createCards(id);
                event.preventDefault();
                event.stopPropagation();
            };

            return;
        }
    }

    // Retrieve parameters from dataset
    var keyControl = mydiv.dataset.keyControl === 'true';
    var grabFocus = mydiv.dataset.grabFocus === 'true';
    var shuffleCards = mydiv.dataset.shuffleCards === 'true';
    var title = mydiv.dataset.title || '';
    var subject = mydiv.dataset.subject || '';
    var frontColors = JSON.parse(mydiv.dataset.frontColors || '[]');
    var backColors = JSON.parse(mydiv.dataset.backColors || '[]');
    var textColors = JSON.parse(mydiv.dataset.textColors || '[]');

    //console.log('Active topics:', topics);

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
    // Need to store the filtered cards in the dataset
    mydiv.dataset.cards = JSON.stringify(cards);

    // Set up click and keyboard controls
    mydiv.onclick = function(){ window.flipCard(mydiv); };
    if (keyControl) {
        mydiv.onkeydown = function(event){ window.checkKey(mydiv, event); };
    }

    // Initialize deleteList, possibly from localStorage
    var deleteList = [];
    (function() {
        // Compute storage suffix for keys
        var storageSuffix = mydiv.dataset.localStorageKey;
        var allowKey = 'jc-allow-storage-' + storageSuffix;
        var deleteKey = 'jc-deleteList-' + storageSuffix;
        if (window.localStorage && window.localStorage.getItem(allowKey) === 'true') {
            console.log('allowKey', window.localStorage.getItem(allowKey));
            try {
                deleteList = JSON.parse(window.localStorage.getItem(deleteKey) || '[]');
                console.log('Loaded deleteList from localStorage:', deleteList);
            } catch (e) {
                deleteList = [];
            }
        }
        mydiv.dataset.deleteList = JSON.stringify(deleteList);
    })();
    console.log('deleteList: ', deleteList);

    // Store cards and color data in the container's dataset for later access in cleanup()
    /*
    mydiv.dataset.frontColors = JSON.stringify(frontColors);
    mydiv.dataset.backColors = JSON.stringify(backColors);
    mydiv.dataset.textColors = JSON.stringify(textColors);
    */

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
    var numCards = cards.length;

    var cardsLeft = numCards - deleteList.length;

    if (cardsLeft == 0) {
        window.resetDeleteList(mydiv);
        deleteList =[];
        cardsLeft = cards.length;
    }



    var flipper;
    console.log('Creating cards for container:', mydiv.id, 'with', cardsLeft, 'cards left.');
    for (var i=0; i<Math.min(cardsLeft,2); i++) {

        if (i==0){
            while ( deleteList.includes(cardOrder[cardnum]) ) {
                cardnum = (cardnum + 1) % parseInt(numCards);
                //console.log("Skipping card number:", cardnum, "of", numCards);
            }
            flipper=createOneCard(mydiv, true, cards, cardOrder[cardnum], cardnum);
        }
        else {
            while ( deleteList.includes(cardOrder[cardnum]) ) {
                cardnum = (cardnum + 1) % parseInt(numCards);
                //console.log("Skipping card number:", cardnum, "of", numCards);
            }
            flipper=createOneCard(mydiv, false, cards, cardOrder[cardnum], cardnum);
        }

        if (cardsLeft == 1) {
            var notKnown = flipper.querySelector('.flashcardNotKnown');
            notKnown.classList.add('hide');
            notKnown.pointerEvents = 'none';
            //console.log(notKnown);
            //console.log(backcard.querySelector('.flashcardNotKnown'));
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
    //console.log('cardsLeft = ', cardsLeft);
    if (cardsLeft==1) {
        next.style.pointerEvents='none';
        next.classList.add('hide');
        var notKnown = flipper.querySelector('.flashcardNotKnown');
        notKnown.classList.add('hide');
        notKnown.pointerEvents = 'none';
    } else {
        next.innerHTML="Next >";
        next.style.pointerEvents='auto';
        next.classList.remove('hide');
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




