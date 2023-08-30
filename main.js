function el(name)
{
    return document.getElementById(name);
}

const gameCanvas = el("gameCanvas");
const ctx = gameCanvas.getContext("2d");

//const bgCanvas = el("bgCanvas");
//const bgctx = bgCanvas.getContext("2d");

const W = 1200;
const H = 800;
const U = 100;
const BOTTOM_PADDING = U * 0.8;
const HOUSES_LEFT_X_WORLD = (W - (U * FEYNIK_WIDTH)) / 2;

let previousFrameTime = Date.now();
let shake = 0;

const aceFont = new FontFace("Ace", 'url(./ace.ttf)');
aceFont.load();
document.fonts.add(aceFont);

window.onload = () =>
{
    el("canvasDiv").style.left = (window.innerWidth - W) / 2 + "px";
    el("canvasDiv").style.top = (window.innerHeight - H) / 2 + "px";
    render();
}

function render()
{
    const delta = (Date.now() - previousFrameTime) / 1000; // in seconds
    previousFrameTime = Date.now();

    //ctx.clearRect(0, 0, W, H);

    let X0 = (-0.5 + Math.random()) * shake * shake * U;
    let Y0 = (-0.5 + Math.random()) * shake * shake * U;
    ctx.drawImage(img("bg"), X0 - U, Y0 - U, X0 + W + 2*U, Y0 + H + 2*U);

    const HOUSES_LEFT_X = X0 + HOUSES_LEFT_X_WORLD;

    // Processing

    reduceShake(delta);
    processFallingHouses(delta);
    processCats(delta);
    processMintGrowth(delta);
    processMint(delta);
    processVictim(delta);

    // Drawing houses

    function drawHouse(x, y, level, position, fallingIndex)
    {
        let hue;
        let sign;

        if (level != null)
        {
            hue = feynik[level][position].hue;
            sign = feynik[level][position].sign;
        }
        else
        {
            hue = fallingHouses[fallingIndex].hue;
            sign = fallingHouses[fallingIndex].sign;
        }

        ctx.filter = "hue-rotate(" + hue + "deg)";
        ctx.drawImage(img("house"), x, y, U, U);
        ctx.drawImage(img("sign" + sign), x, y, U, U);
        ctx.filter = "none";
    }

    for (let l = 0; l < feynik.length; l++)
    {
        for (let i = 0; i < FEYNIK_WIDTH_BY_LEVEL(l); i++)
        {
            if (!feynik[l][i] || (pickedHouse != null && l === pickedHouse.level && i === pickedHouse.position)) continue;

            let x = HOUSES_LEFT_X + (U * i) + (l % 2 === 1 ? (U / 2) : 0);
            let y = Y0 + H - (BOTTOM_PADDING + U * (l + 1));

            drawHouse(x, y, l, i);
        }
    }

    // Draw picked house over others

    if (pickedHouse != null)
    {
        let x = HOUSES_LEFT_X + (U * pickedHouse.position) + (pickedHouse.level % 2 === 1 ? (U / 2) : 0);
        let y = Y0 + H - (BOTTOM_PADDING + U * (pickedHouse.level + 1));

        const shift = { x: mousePosition.x - (x + U/2 + pickOffset.x), y: mousePosition.y - (y + U/2 + pickOffset.y) };
        const sqrMagnitude = shift.x * shift.x + shift.y * shift.y;
        if (sqrMagnitude > 0)
        {
            const poweredDownMagnitude = Math.pow(sqrMagnitude, 3/4);
            const ratio = poweredDownMagnitude / sqrMagnitude;
            shift.x *= ratio;   shift.y *= ratio;
            x += shift.x;       y += shift.y;
        }

        pickedHouseX = x - X0 + U/2;
        pickedHouseY = y - Y0 + U/2;

        drawHouse(x, y, pickedHouse.level, pickedHouse.position);
    }

    // Drawing falling houses

    for (const house of fallingHouses)
    {
        drawHouse(HOUSES_LEFT_X + (U * house.position) + (house.level % 2 === 1 ? (U / 2) : 0),
            Y0 + house.y, null, null, fallingHouses.indexOf(house));
    }

    // Drawing cats

    for (const cat of cats)
    {
        ctx.filter = "hue-rotate(" + cat.hue + "deg)";
        let opacityFilter = "none";
        ctx.save();

        switch (cat.state)
        {
            case "falling":
                ctx.translate(X0 + cat.x, Y0 + cat.y + CAT_HEIGHT / 2);
                ctx.scale(cat.dir === "left" ? 1 : -1, 1);
                ctx.rotate(cat.progress * 0.006 / 57 * -15);
                break;

            case "idle":
            case "picked":
                ctx.translate(X0 + cat.x, Y0 + cat.y + CAT_HEIGHT / 2);
                ctx.scale(cat.dir === "left" ? 1 : -1, 1);
                if (cat.splat > 0) ctx.transform(1, 0, 0.3, 0.7, 0, 0);
                break;

            case "walking":
                const shift = CAT_HEIGHT * 0.2 * ((Math.sin(cat.progress * 16 * (cat.high * 0.5 + 1)) + 1) / 2);
                ctx.translate(X0 + cat.x, Y0 + cat.y + CAT_HEIGHT / 2 - shift);
                ctx.scale(cat.dir === "left" ? 1 : -1, 1);
                ctx.rotate(Math.sin(cat.progress * 8) / 57 * -10);
                break;

            case "teleporting":
                ctx.translate(X0 + cat.x, Y0 + cat.y + CAT_HEIGHT / 2);
                ctx.scale(cat.dir === "left" ? 1 : -1, 1);
                const opacity = cat.progress < 0.5 ? (0.5 - cat.progress) * 200 : (cat.progress - 0.5) * 200;
                opacityFilter = "opacity(" + opacity + "%)";
                ctx.filter += " " + opacityFilter;
                break;
        }

        ctx.drawImage(img("cat_s" + cat.skin), -CAT_WIDTH / 2, -CAT_HEIGHT, CAT_WIDTH, CAT_HEIGHT);
        ctx.filter = opacityFilter;
        ctx.drawImage(img("cat_f" + cat.high), -CAT_WIDTH / 2, -CAT_HEIGHT, CAT_WIDTH, CAT_HEIGHT);
        ctx.drawImage(img("cat_o"), -CAT_WIDTH / 2, -CAT_HEIGHT, CAT_WIDTH, CAT_HEIGHT);
        ctx.restore();

        ctx.filter = "none";
    }

    // Drawing mint

    for (const m of mint)
    {
        ctx.filter = "hue-rotate(" + m.hue + "deg) brightness(" + m.brightness + "%)";
        if (m.life < MINT_LIFE_MIN)
        {
            const opacity = (m.life / MINT_LIFE_MIN) * 100;
            ctx.filter += " opacity(" + opacity + "%)";
        }

        ctx.save();
        ctx.translate(m.x + X0, m.y + Y0);
        ctx.rotate(m.rotation);
        ctx.scale(1, Math.min(1, Math.sqrt(1 / (m.gravityY / U))));
        ctx.drawImage(img("mint"), -m.size / 2,  -m.size / 2, m.size, m.size);
        ctx.restore();

        ctx.filter = "none";
    }

    // Drawing game over victim

    if (isGameOver)
    {
        const y = H + Y0;
        const x = gameOverSide === "left" ? X0 - 1.5*U : W + X0 + 1.5*U;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((gameOverSide === "left" ? 1 : -1) * victimProgress * victimProgress * 1.3);
        ctx.drawImage(img("victim" + victimChosen), -1.5*U, -H/1.5 - 1.5*U, 3*U, 3*U);
        ctx.restore();
    }

    // Drawing explosion

    if (gameOverNotification && currentExplosionFrame < EXPLOSION_FRAMES)
    {
        const x = gameOverSide === "left" ? W * 0.2 : W * 0.8 - 2.5 * U;
        ctx.drawImage(img("explosion" + currentExplosionFrame), x, H * 0.4, 5*U, 5*U);
    }

    // Menu buttons

    if (showMenuButtons)
    {
        ctx.fillStyle = "rgba(0, 96, 160, 0.7)";
        ctx.fillRect(0, 0, W/2, H);

        ctx.fillStyle = "rgba(0, 160, 96, 0.7)";
        ctx.fillRect(W/2, 0, W/2, H);

        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.font = "60px Ace";
        ctx.textAlign = "center";
        ctx.fillText("С обучением", W/4, H/2);
        ctx.fillText("Без обучения", 3*W/4, H/2);
    }

    // Tutorials

    if (tutorial1status === 1 || tutorial2status === 1 || gameOverNotification)
    {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(U/2, U/2, W - U, H/3 - U);
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.textAlign = "center";
    }

    if (tutorial1status === 1)
    {
        ctx.font = "30px Ace";
        ctx.fillText("Не давайте котикам уйти исследовать", W/2, H/6 - 35);
        ctx.fillText("за границы комнаты, иначе они что-нибудь снесут.", W/2, H/6);
        ctx.fillText("Таскайте их курсором мыши.", W/2, H/6 + 35);
        ctx.fillText("Кликните сюда, чтобы закрыть.", W/2, H/6 + 70);

        ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
        ctx.beginPath();
        ctx.moveTo(U/2, H/3 - U/2);
        ctx.lineTo(tutorial1cat.x, tutorial1cat.y);
        ctx.lineTo(W - U/2, H/3 - U/2);
        ctx.closePath();
        ctx.stroke();
    }

    if (tutorial2status === 1)
    {
        ctx.font = "25px Ace";
        ctx.fillText("Если в домике, из которого вылез котик,", W/2, H/6 - 35);
        ctx.fillText("росла кошачья мята, его вштырит и он станет быстрее.", W/2, H/6);
        ctx.fillText("Потрясите домик курсором, чтобы вытряхнуть мяту.", W/2, H/6 + 35);
        ctx.fillText("Кликните сюда, чтобы закрыть.", W/2, H/6 + 70);

        ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
        ctx.beginPath();
        ctx.moveTo(U/2, H/3 - U/2);
        ctx.lineTo(tutorial2cat.x, tutorial2cat.y);
        ctx.lineTo(W - U/2, H/3 - U/2);
        ctx.closePath();
        ctx.stroke();
    }

    if (gameOverNotification)
    {
        ctx.font = "30px Ace";
        ctx.fillText("Игра окончена.", W/2, H/6);
        ctx.fillText("Ваш счёт: " + gameOverScore + " котик(а/ов) в котофейнике!", W/2, H/6 + 35);
    }

    requestAnimationFrame(render);
}