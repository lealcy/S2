"use strict";
console.log("game");
const s2 = new S2.S2(document.querySelector("canvas"));
const narwhal = new S2.Entity(0, 0, new S2.Sprite("images/narwhal.png"));
s2.addEntity(narwhal);
s2.run();