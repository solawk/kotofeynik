const VICTIMS = 5;
const VICTIM_DURATION = 2;

let isGameOver = false;
let gameOverSide = null;
let victimChosen = 0;
let victimProgress = 0;

let gameOverNotification = false;
let gameOverScore = 0;

function triggerGameOver(side)
{
    if (isGameOver) return;

    isGameOver = true;
    victimChosen = Math.floor(VICTIMS * Math.random());
    gameOverSide = side;
    shakeScreen(0.4);
    console.log("Game over! " + side);
}

function processVictim(delta)
{
    if (isGameOver && victimProgress < 1)
    {
        victimProgress += delta / VICTIM_DURATION;
        if (victimProgress >= 1)
        {
            victimProgress = 1;
            shakeScreen(0.8);

            if (tutorial1status === 1) tutorial1status = 2;
            if (tutorial2status === 1) tutorial2status = 2;
            gameOverNotification = true;
            gameOverScore = cats.length;

            setTimeout(animateExplosion, EXPLOSION_FRAME_DURATION);
            Sounds.get("explosion").play();
        }
    }
}

const EXPLOSION_FRAMES = 17;
const EXPLOSION_FRAME_DURATION = 80;
let currentExplosionFrame = 0;

function animateExplosion()
{
    currentExplosionFrame++;
    if (currentExplosionFrame < EXPLOSION_FRAMES)
    {
        setTimeout(animateExplosion, EXPLOSION_FRAME_DURATION);
    }
}