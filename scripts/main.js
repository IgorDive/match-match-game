class ModelGame {
    constructor(option) {
        if (!window.localStorage.topTenResults) {
            window.localStorage.topTenResults = "[[],[],[]]";
        }

        this._view = null;
        this._arrOfCards = [];
        this._images = option.images;
        this._shirts = option.shirts; 
        this._difficulties = option.difficulties;
        this._currentShirt = this._shirts[0];
        this._currentDifficulty = this._difficulties[0];   
        this._arrOfAttempts = [];
        this._startTime = null;
        this._timeOfGame = null;
        this._personData = null;
        this._topTenResults = JSON.parse( window.localStorage.topTenResults );
        this._currentTopTenResults = this._topTenResults[0];
        this._innerHTMLTopTenResults = null;
    }

    start(view) {
        this._view = view;
    }

    createArrOfCards() {

        let imagesBase = [...this._images];
        let imagesFirstHalf = [];
        let randomImage = () => imagesBase.splice( Math.floor( Math.random() * imagesBase.length ), 1 );
        
        for (let i = 0; i < this._currentDifficulty[0] * this._currentDifficulty[1] / 2; i++) {
            imagesFirstHalf.push(randomImage()[0]);
        }

        imagesBase = imagesFirstHalf.concat(imagesFirstHalf);

        for (let i = 0; i < this._currentDifficulty[0] * this._currentDifficulty[1]; i++) {
            let card = new Card(this._currentShirt, randomImage()[0], String(i));
            this._arrOfCards.push(card);
        }

        this.update();
    }

    changeDifficulty(index) {
        this._currentDifficulty = this._difficulties[index];
        this._currentTopTenResults = this._topTenResults[index];
    }

    changeShirt(index) {
        this._currentShirt = this._shirts[index];
    }

    clearView() {
        if (this._view) {
            this._view.reset();
        } else {
            throw new Error('view do not exist');
        }
    }

    showTopTenResults() {
        this._innerHTMLTopTenResults = `<div class="cards-row">${this._currentTopTenResults.reduce( (prevItem, item, i) => {
            return `${prevItem}<br>${i + 1}.${item[0]} ${item[1]}` 
        }, `Your time (complexity: ${this._currentDifficulty[0]} x ${this._currentDifficulty[1]})  is (ms): ${this._timeOfGame}`)}</div>`;
        this._view.showResults();
    }

    update(index) {
        if (this._view) {
            this._view.refresh(index);
        } else {
            throw new Error('view do not exist');
        }
    }

    launch() {
        this._arrOfCards = [];         
        this._arrOfAttempts = [];
        this._startTime = null;
        this._timeOfGame = null;
        this._personData = null;

        this.clearView();

        let firstName = prompt('Input your first name', 'anonimous').toLowerCase() || 'anonimous';
        let lastName = prompt('Input your last name', 'anonimous').toLowerCase() || 'anonimous';
        let email = prompt('Input your email', 'unknown').toLowerCase() || 'unknown';
        
        this._personData = `${firstName} ${lastName} ${email}, time (ms):`;
        this._startTime = Date.now();

        this.createArrOfCards();
    }

    changeItem(index) {
        let card = this._arrOfCards[index];
        
        if (card._class === 'card face' || this._arrOfAttempts.length === 2) return;
        
        card._class = 'card face';
        this._arrOfAttempts.push(card); 
        this.update(index);
        if (this._arrOfAttempts.length === 2) {
            setTimeout(() => this.checkPair(), 1100);
        }
    }

    checkPair() {
        if (this._arrOfAttempts[0]._image === this._arrOfAttempts[1]._image) {
            this._arrOfAttempts[0]._opacity = 0;
            this.update(this._arrOfAttempts[0]._index);
            this._arrOfAttempts[1]._opacity = 0;
            this.update(this._arrOfAttempts[1]._index);
            this._arrOfAttempts = [];
            if ( this.checkFinishGame() ) this.finishGame();
        } else {
            this._arrOfAttempts[0]._class = 'card';
            this.update(this._arrOfAttempts[0]._index);
            this._arrOfAttempts[1]._class = 'card';
            this.update(this._arrOfAttempts[1]._index);
            this._arrOfAttempts = [];
        }
    }

    checkFinishGame() {
        return this._arrOfCards.every( elem => !elem._opacity );
    }

    finishGame() {
        this._timeOfGame = Date.now() - this._startTime;

        this._currentTopTenResults.push([this._personData, this._timeOfGame]);

        if (this._currentTopTenResults.length !== 1) {
            this._currentTopTenResults.sort( (a, b) => a[1] - b[1] );
        }

        if (this._currentTopTenResults.length > 10) {
            this._currentTopTenResults.splice(10);
        }

        window.localStorage.topTenResults = JSON.stringify(this._topTenResults);

        this.clearView();
        this.showTopTenResults();
    }
}


class Card {
    constructor(shirt, image, index) {
        this._shirt = shirt;
        this._image = image;
        this._index = index;
        this._class = 'card';
        this._opacity = 1;
    }
}


class ViewGame {
    constructor() {
        this._model = null;
        this._view = null;
        this._arrOfRenderedCard = [];
    }

    start(model, viewCards ) {
        this._model = model;
        this._view = viewCards;
    }

    reset() {
        let arrOfCardsRows = this._view.querySelectorAll('.cards-row');

        for (let i = 0; i < arrOfCardsRows.length; i++) {
            this._view.removeChild(arrOfCardsRows[i]);
        }

        this._arrOfRenderedCard = [];
    }

    showResults() {
        this._view.innerHTML = this._model._innerHTMLTopTenResults;
    }

    refresh(index) {
        if (index) {
            this._arrOfRenderedCard[index].className = this._model._arrOfCards[index]._class;
            this._arrOfRenderedCard[index].style.opacity = this._model._arrOfCards[index]._opacity;
        } else {
            let arrOfCards = this._model._arrOfCards;
            
            for (let i = 0; i < arrOfCards.length; i++) {
                let cardRender = document.createElement('div');
                let cardShirt = document.createElement('div');
                let cardImage = document.createElement('div');
                
                cardRender.className = arrOfCards[i]._class;
                cardRender.dataset.index = arrOfCards[i]._index;
                cardRender.style.opacity = arrOfCards[i]._opacity;
                cardShirt.className = 'shirt';
                cardShirt.style.cssText = `background: url(${arrOfCards[i]._shirt}) no-repeat 50% 50%;
                background-size: contain;`;
                cardImage.className = 'picture';
                cardImage.style.cssText = `background: url(${arrOfCards[i]._image}) no-repeat 50% 50%;
                background-size: contain;`;

                cardRender.appendChild(cardShirt);
                cardRender.appendChild(cardImage);
                this._arrOfRenderedCard.push(cardRender);

            }

            let tempArrOfRenderedCard = [...this._arrOfRenderedCard];

            for (let i = 0; i < this._model._currentDifficulty[1]; i++) {
                let cardsRow = document.createElement('div');
                
                cardsRow.className = 'cards-row';
                cardsRow.style.height = `${90 / this._model._currentDifficulty[1]}%`;
                
                for (let j = 0; j < this._model._currentDifficulty[0]; j++) {
                    cardsRow.appendChild(tempArrOfRenderedCard[j]);
                }

                tempArrOfRenderedCard.splice(0, this._model._currentDifficulty[0]);
                this._view.appendChild(cardsRow);
            }
        }
    }
}


class ControlGame {
    constructor() {
        this._view = null;
        this._model = null;
    }

    start(view, model) {
        this._view = view;
        this._model = model;

        this._view.addEventListener('click', this.handlerCard.bind(this), false);
        this._view.addEventListener('change', this.handlerMenu.bind(this), false);
    }

    handlerCard(e) {
        if (e.target.closest('.card')) {
            this._model.changeItem(e.target.closest('.card').dataset.index);
        }

        if (e.target.dataset.start) {
            this._model[e.target.dataset.start]();
        }
    }

    handlerMenu(e) {
        if (!e.target.value) return;

        if ( e.target.closest('.shirts') ) {
            this._model.changeShirt(e.target.value);
        }

        if ( e.target.closest('.difficulty') ) {
            this._model.changeDifficulty(e.target.value);
        }
    }
}


let modGame = new ModelGame({
    images: [
        'images/birthday.svg',
        'images/corn.svg',
        'images/fourleaves.svg',
        'images/goblet.svg',
        'images/ghost.svg',
        'images/guitar.svg',
        'images/halloween.svg',
        'images/newyear.svg',
        'images/pirate.svg',
        'images/smile.svg',
        'images/sphere.svg',
        'images/star.svg',
    ],
    shirts: [
        "images/saber.svg",
        "images/penguin.svg",
        "images/apple.svg",
    ],
    difficulties: [
        [5, 2],
        [6, 3],
        [8, 3],
    ],
});
let viewGame = new ViewGame();
let ctrlGame = new ControlGame();

viewGame.start(modGame, document.querySelector('.game-field'));
ctrlGame.start(document.querySelector('.game'), modGame);
modGame.start(viewGame);
