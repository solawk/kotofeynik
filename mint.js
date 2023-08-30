const MINT_SPEED_X = 3 * U;
const MINT_SPEED_Y = 3 * U;
const MINT_GRAVITY = 0.3 * U;
const MINT_LIFE_MIN = 2;
const MINT_LIFE_TO_MAX = 3;
const MINT_HUE_DELTA = 20;
const MINT_BRIGHTNESS_DELTA = 20;
const MINT_SIZE_MIN = U / 4;
const MINT_SIZE_TO_MAX = U / 5;

const mint = [];

function createMintExplosion(x, y, size)
{
    for (let i = 0; i < Math.pow(size, 1.5) * 5; i++)
    {
        addMint(x, y);
    }
}

function addMint(x, y)
{
    const newMint =
        {
            x: x + (Math.random() - 0.5) * U/4,
            y: y + (Math.random() - 0.5) * U/4,
            speedX: (Math.random() - 0.5) * MINT_SPEED_X * 2,
            speedY: (Math.random() - 0.5) * MINT_SPEED_Y * 2,
            gravityY: 0,
            rotation: 360 * Math.random(),
            falling: 0,
            life: MINT_LIFE_MIN + Math.random() * MINT_LIFE_TO_MAX,
            hue: (Math.random() - 0.5) * MINT_HUE_DELTA,
            brightness: 100 - Math.random() * MINT_BRIGHTNESS_DELTA,
            size: MINT_SIZE_MIN + Math.random() * MINT_SIZE_TO_MAX,
            isDead: false
        };

    mint.push(newMint);
}

function processMint(delta)
{
    for (const m of mint)
    {
        m.x += m.speedX * delta;
        m.y += (m.speedY + m.gravityY) * delta;

        m.speedX = m.speedX * (1 - (0.9 * delta));
        m.speedY = m.speedY * (1 - (3 * delta));
        m.gravityY += MINT_GRAVITY * delta;

        m.life -= delta;
        if (m.life <= 0) m.isDead = true;
    }

    for (let i = 0; i < mint.length; i++)
    {
        if (mint[i].isDead)
        {
            mint.splice(i, 1);
            i--;
        }
    }
}