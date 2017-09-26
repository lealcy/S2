"use strict";
const s2 = new S2.S2(document.querySelector("canvas"));

const dvdLogo = new S2.Sprite("images/dvdlogogold.png");
const dvdLogoEntity = new S2.Entity(10, 10);
dvdLogoEntity.renderer = new S2.SpriteRenderer(dvdLogo);

dvdLogoEntity.animate.bounceBox(0, 0, s2.width, s2.height, new S2.Vector(3, 3));
s2.scene.spawn(dvdLogoEntity);
s2.run();