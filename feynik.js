const FEYNIK_WIDTH = 7;
const FEYNIK_SIGNS = 6;

const feynik = [];

function availableSlots()
{
    const levels = [];

    for (let i = 0; i < FEYNIK_WIDTH; i++)
    {
        let found = false;

        for (let l = 0; l < feynik.length; l++)
        {
            const isOutsider = (i === FEYNIK_WIDTH - 1) && (l % 2 === 1); // Odd level, last house

            if (!feynik[l][i] && !isOutsider)
            {
                levels.push(l);
                found = true;
                break;
            }
            else if (isOutsider && !feynik[l][i - 1])
            {
                levels.push(-1);
                found = true;
                break;
            }
        }

        if (found) continue;

        if (i !== FEYNIK_WIDTH - 1 || feynik.length % 2 === 0)
            levels.push(feynik.length);
        else
            levels.push(-1);
    }

    return levels;
}

// TEST
/*
placeHouseOnLevel(0, 0, 0);
for (let i = 3; i <= 6; i++) placeHouseOnLevel(0, i, 180);
for (let i = 4; i <= 5; i++) placeHouseOnLevel(1, i, 90);
*/

function dropRandomHouse()
{
    const potentialSlots = availableSlots();
    if (potentialSlots[FEYNIK_WIDTH - 1] === -1) potentialSlots.pop();
    const chosenPosition = Math.floor(Math.random() * potentialSlots.length);

    const level = potentialSlots[chosenPosition];
    if (level > 6) return; // 7 levels max

    addFallingHouse(level, chosenPosition);
}

function placeHouseOnLevel(level, position, hue, sign)
{
    if (level === feynik.length)
    {
        const newLevel = [];
        for (let i = 0; i < FEYNIK_WIDTH_BY_LEVEL(level); i++) newLevel.push(null);
        feynik.push(newLevel);
    }
    feynik[level][position] = { hue: hue, sign: sign, mint: 0 };
}

function processMintGrowth(delta)
{
    for (let l = 0; l < feynik.length; l++)
    {
        for (let i = 0; i < FEYNIK_WIDTH_BY_LEVEL(l); i++)
        {
            if (feynik[l][i] == null) continue;
            if (pickedHouse != null && l === pickedHouse.level && i === pickedHouse.position) continue;

            if (Math.random() < 0.02 * delta) // 0.02
            {
                if (feynik[l][i].mint < 3)
                {
                    feynik[l][i].mint++;
                }
            }
        }
    }
}

function killPickedHouseMint(movement)
{
    const mint = feynik[pickedHouse.level][pickedHouse.position].mint;
    if ((mint === 1 && movement > 40000) || (mint === 2 && movement > 30000) || (mint === 3 && movement > 20000))
    {
        feynik[pickedHouse.level][pickedHouse.position].mint = 0;
        createMintExplosion(pickedHouseX, pickedHouseY, mint);
        //console.log("Killed " + mint + " mint");
    }
}

function FEYNIK_WIDTH_BY_LEVEL(level)
{
    return FEYNIK_WIDTH - (level % 2 === 1 ? 1 : 0);
}

function HOUSE_X(level, position)
{
    return HOUSES_LEFT_X_WORLD + U * (position + (level % 2 === 1 ? 0.5 : 0) + 0.5)
}

function HOUSE_Y(level)
{
    return H - (BOTTOM_PADDING + U * level);
}

function HOUSE_DROP_Y(y)
{
    return y + U / 2 - CAT_HEIGHT / 2;
}

function levelAtY(y)
{
    return Math.floor((H - BOTTOM_PADDING - y) / U);
}

function levelOfCollision(y)
{
    const yOfCollision = y + CAT_HEIGHT / 2;
    return levelAtY(yOfCollision);
}

function collidesWithHouse(x, y) // returns level of collision if does
{
    const level = levelOfCollision(y);

    if (level < 0) return -1;

    const isLevelOdd = level % 2 === 1;
    const position = Math.floor((x - HOUSES_LEFT_X_WORLD - (isLevelOdd ? U * 0.5 : 0)) / U);
    if (position >= FEYNIK_WIDTH_BY_LEVEL(level)) return null;
    const houseExists = houseExistsAt(level, position);

    return houseExists ? level : null;
}

function houseExistsAt(level, position)
{
    if (feynik.length <= level) return false;

    return feynik[level][position] != null;
}

let pickedHouse = null;
let pickedHouseMovement = 0;
let pickedHouseX = 0;
let pickedHouseY = 0;

function probeForHouse(x, y)
{
    for (let l = 0; l < feynik.length; l++)
    {
        for (let i = 0; i < FEYNIK_WIDTH_BY_LEVEL(l); i++)
        {
            if (feynik[l][i] == null) continue;

            const hx = HOUSE_X(l, i);
            const hy = HOUSE_Y(l) - U / 2;

            const ax = hx - U / 2;
            const bx = hx + U / 2;
            const ay = hy - U / 2;
            const by = hy + U / 2;

            if (x > ax && x < bx && y > ay && y < by)
            {
                return { level: l, position: i };
            }
        }
    }

    return null;
}