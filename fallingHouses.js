const GRAVITY = 50 * U;

const fallingHouses = [];

function addFallingHouse(level, position)
{
    const house =
        {
            level: level,
            position: position,
            y: -U,
            destination: H - (BOTTOM_PADDING + U * (level + 1)),
            speed: 0,
            landed: false,
            hue: 360 * Math.random(),
            sign: Math.floor(Math.random() * FEYNIK_SIGNS)
        };

    fallingHouses.push(house);
}

function processFallingHouses(delta)
{
    for (const house of fallingHouses)
    {
        house.speed += GRAVITY * delta;
        house.y += house.speed * delta;

        if (house.y >= house.destination)
        {
            placeHouseOnLevel(house.level, house.position, house.hue, house.sign);
            house.landed = true;
            shakeScreen(0.8);
            //if (Math.random() > 0.3)
            {
                const cat = spawnCat(HOUSE_X(house.level, house.position), HOUSE_Y(house.level) - CAT_HEIGHT / 2);
                limitMaximumFallingLevel(cat);
                Sounds.get("vineboom").play();
            }
        }
    }

    for (let i = 0; i < fallingHouses.length; i++)
    {
        if (fallingHouses[i].landed)
        {
            fallingHouses.splice(i, 1);
            i--;
        }
    }
}

// Shake

const SHAKE_REDUCTION = 2;

function shakeScreen(strength)
{
    shake += strength;
    if (shake > 2) shake = 2;
}

function reduceShake(delta)
{
    if (shake > 0)
    {
        shake -= SHAKE_REDUCTION * delta;
        if (shake < 0) shake = 0;
    }
}