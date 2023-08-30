const Images = new Map;

function loadImage(name, src)
{
    const image = new Image();
    image.src = src;

    Images.set(name, image);
}

function img(name)
{
    return Images.get(name);
}

loadImage("cat_l", "./images/cat.png");
loadImage("cat_r", "./images/spr_cat_right.png");
loadImage("house", "./images/spr_house2.png");
loadImage("mint", "./images/mint.png");
loadImage("bg", "./images/background2.png");

loadImage("cat_o", "./images/catOutline.png");
loadImage("cat_s0", "./images/catSkin0.png");
loadImage("cat_s1", "./images/catSkin1.png");
loadImage("cat_s2", "./images/catSkin2.png");
loadImage("cat_s3", "./images/catSkin3.png");
loadImage("cat_f0", "./images/catFace0.png");
loadImage("cat_f1", "./images/catFace1.png");
loadImage("cat_f2", "./images/catFace2.png");
loadImage("cat_f3", "./images/catFace3.png");

loadImage("sign0", "./images/sign0.png");
loadImage("sign1", "./images/sign1.png");
loadImage("sign2", "./images/sign2.png");
loadImage("sign3", "./images/sign3.png");
loadImage("sign4", "./images/sign5.png");
loadImage("sign5", "./images/sign5.png");

loadImage("victim0", "./images/victim0.png");
loadImage("victim1", "./images/victim1.png");
loadImage("victim2", "./images/victim2.png");
loadImage("victim3", "./images/victim3.png");
loadImage("victim4", "./images/victim4.png");

for (let i = 0; i < EXPLOSION_FRAMES; i++) loadImage("explosion" + i, "./images/explosion/explosion" + i + ".png");