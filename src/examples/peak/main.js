"use strict";

(() => {
    const s2 = new S2(document.querySelector("canvas"));

    const CLUB = 0;
    const SPADE = 1;
    const HEART = 2;
    const DIAMOND = 3;
    const BACK_BLACK = 0;
    const BACK_RED = 1;
    const CARDS_PER_SUIT = 13;
    const NUM_SUITS = 4;
    const CARDS_PER_DECK = CARDS_PER_SUIT * NUM_SUITS;
    const CARD_WIDTH = 73;
    const CARD_HEIGHT = 98;
    const SUITS = new Set([CLUB, SPADE, HEART, DIAMOND]);
    const BLACK_SUITS = new Set([CLUB, SPADE]);
    const RED_SUITS = new Set([HEART, DIAMOND]);
    const cardsSpriteSheet = new SpriteSheet(new Sprite("images/cards.png"), CARDS_PER_SUIT, NUM_SUITS, CARD_WIDTH, CARD_HEIGHT);
    const backSpriteSheet = new SpriteSheet(new Sprite("images/backs.png"), 2, 1, CARD_WIDTH, CARD_HEIGHT);



    class PeakGame extends Entity {
        constructor() {
            super();

            //this.renderer = new S2.SpriteRenderer(logo);
            //this.bounceAnimation = this.animate.bounceBox(0, 0, s2.width, s2.height, new S2.Vector(3, 3));
        }
    }

    class Deck extends Entity {
        constructor(shuffled = false) {
            super();
            this._deck = [];
            SUITS.forEach(suit => {
                for (let i = 0; i < CARDS_PER_SUIT; i++) {
                    this._deck.push(new Card(suit, i));
                }
            });
            if (shuffled) {
                this.shuffle();
            }
        }

        shuffle() {
            for (let i = this._deck.length - 1; i > 0; --i) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = this._deck[i];
                this._deck[i] = this._deck[j];
                this._deck[j] = temp;
            }
        }
    }

    class Card extends Entity {
        constructor(suit, value) {
            super();
            this.suit = suit;
            this.value = value;
            this._flippedDown = true;
            this.flipDown();
        }

        flipUp() {
            this._flippedDown = false;
            this.renderer = cardsSpriteSheet.getSpriteRenderer(this.value - 1, this.suit);
        }

        flipDown() {
            this._flippedDown = true;
            this.renderer = backSpriteSheet.getSpriteRenderer(0, 0);
        }

        get flippedDown() {
            return this.flippedDown;
        }
    }

    //s2.scene = new PeakGame();
    s2.scene.spawn(new Card(SPADE, 13));
    //s2.scene = new Card(CLUB, 1);
    //s2.scene.spawn(new DvdLogo(10, 10));

})();