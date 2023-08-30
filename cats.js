const CAT_WIDTH = U * 1.2;
const CAT_HEIGHT = U * 0.6;
const CAT_GRAVITY = 10 * U;
const CAT_GRAB_RADIUS = CAT_WIDTH / 2;
const CAT_SPEED = 0.4 * U;
const CAT_TELEPORTING_DURATION = 1;
const CAT_HIGH_MIN = 3;
const CAT_HIGH_TO_MAX = 4;
const CAT_SKINS = 4;

const cats = [];

function spawnCat(x, y)
{
    const cat =
        {
            x: x,
            y: y,
            assignedLevel: null,
            state: "falling",
            maximumFallingLevel: 0, // maximum level to land on
            progress: 0,
            // when idling - seconds before walking
            // when falling - vertical speed
            // when walking - animation state
            // when teleporting - progress of teleportation
            // when picked - not important
            dir: "left",
            fallingShift: 0, // x shift when falling
            teleportingOrigin: null,
            teleportingDestination: null,
            teleportingMint: 0, // mint at destination
            teleportingDir: "left",
            high: 0, // high on mint
            highDuration: 0, // time left high
            splat: 0, // splat time after falling
            wantToHouse: false, // want to teleport
            hue: 360 * Math.random(), // color
            skin: Math.floor(Math.random() * CAT_SKINS)
        };

    cats.push(cat);

    if (withTutorial && tutorial1status === 0)
    {
        tutorial1status = 1;
        tutorial1cat = cat;
    }

    return cat;
}

function processCats(delta)
{
    for (const cat of cats)
    {
        switch (cat.state)
        {
            case "falling":
            {
                cat.x += (cat.dir === "left" ? -1 : 1) * cat.fallingShift * delta;
                cat.progress += CAT_GRAVITY * delta;
                cat.y += cat.progress * delta;

                const collisionLevel = collidesWithHouse(cat.x, cat.y);
                if (collisionLevel != null && collisionLevel <= cat.maximumFallingLevel)
                {
                    // Landing
                    cat.state = "idle";
                    const speed = cat.progress;
                    if (speed > 8 * U)
                    {
                        cat.splat = (speed / (U * 2));
                        meow(true);
                    }
                    cat.progress = (speed / (U * 2)) + Math.pow(Math.random(), 2) * 3;
                    cat.assignedLevel = collisionLevel + 1;
                    cat.y = H - BOTTOM_PADDING - (U * cat.assignedLevel) - (CAT_HEIGHT * 0.5);
                }

                break;
            }

            case "idle":
            {
                cat.progress -= delta;
                if (cat.splat > 0)
                {
                    cat.splat -= delta;
                    if (cat.splat < 0) cat.splat = 0;
                }
                if (cat.progress <= 0)
                {
                    cat.dir = Math.random() > 0.5 ? "right" : "left";
                    cat.splat = 0;
                    cat.state = "walking";
                    cat.wantToHouse = false;
                    cat.progress = 0;
                }

                break;
            }

            case "walking":
            {
                let newX;
                const shiftX = CAT_SPEED * (1 + cat.high * 1.4) * delta;
                if (cat.dir === "left")
                {
                    newX = cat.x - shiftX;
                }
                else
                {
                    newX = cat.x + shiftX;
                }

                const crossedDoor = crossingDoor(cat.x, newX, cat.assignedLevel);
                cat.x = newX;

                if (cat.x < -CAT_WIDTH/2) triggerGameOver("left");
                if (cat.x > W + CAT_WIDTH/2) triggerGameOver("right");

                if (cat.wantToHouse)
                {
                    if (crossedDoor != null && crossedDoor >= 0 && crossedDoor < FEYNIK_WIDTH_BY_LEVEL(cat.assignedLevel)
                        && feynik.length >= cat.assignedLevel - 1 && feynik[cat.assignedLevel][crossedDoor] != null)
                    {
                        //console.log("Crossing " + crossedDoor);
                        const destination = destinationHouse(cat.assignedLevel, crossedDoor);
                        if (destination != null)
                        {
                            // Teleporting
                            cat.state = "teleporting";
                            cat.teleportingOrigin = { level: cat.assignedLevel, position: crossedDoor };
                            cat.teleportingDestination = destination;
                            cat.teleportingMint = feynik[destination.level][destination.position].mint;
                            cat.teleportingDir = Math.random() > 0.5 ? "left" : "right";
                            cat.progress = 0;
                            cat.wantToHouse = false;
                        }
                    }
                }

                cat.progress += delta;
                if (cat.highDuration > 0)
                {
                    cat.highDuration -= delta;
                    if (cat.highDuration <= 0)
                    {
                        cat.highDuration = 0;
                        cat.high = 0;
                    }
                }

                const collisionLevel = collidesWithHouse(cat.x, cat.y + 1);
                if (collisionLevel == null)
                {
                    cat.state = "falling";
                    cat.progress = 0;
                    cat.fallingShift = Math.random() * 1.2 * U;
                }
                else
                {
                    if (Math.random() < 0.1 * delta)
                    {
                        cat.state = "idle";
                        cat.progress = 2 + Math.pow(Math.random(), 2) * 6;
                    }

                    if (!cat.wantToHouse && Math.random() < 0.09 * delta)
                    {
                        cat.wantToHouse = true;
                    }
                }

                break;
            }

            case "teleporting":
            {
                cat.progress += delta / CAT_TELEPORTING_DURATION;

                if (cat.progress >= 0.5)
                {
                    cat.x = HOUSE_X(cat.teleportingDestination.level, cat.teleportingDestination.position);
                    cat.y = HOUSE_Y(cat.teleportingDestination.level) - CAT_HEIGHT / 2;
                    cat.assignedLevel = cat.teleportingDestination.level;
                    cat.high = cat.teleportingMint;
                    cat.highDuration = CAT_HIGH_MIN + Math.random() * CAT_HIGH_TO_MAX;

                    if (cat.high > 0 && withTutorial && tutorial2status === 0)
                    {
                        tutorial2status = 1;
                        tutorial2cat = cat;
                        if (tutorial1status === 1) tutorial1status = 2;
                    }
                }

                if (cat.progress >= 1)
                {
                    cat.state = Math.random() > 0.5 ? "walking" : "idle";
                    cat.progress = 0;
                }

                break;
            }

            case "picked":
            {
                cat.x = mousePosition.x - pickOffset.x;
                cat.y = mousePosition.y - pickOffset.y;
                if (cat.y > H - BOTTOM_PADDING - CAT_HEIGHT / 2) cat.y = H - BOTTOM_PADDING - CAT_HEIGHT / 2;

                break;
            }
        }
    }
}

let pickedCat = null;
let mousePosition = { x: 0, y: 0 };
let pickOffset = { x: 0, y: 0 };

function limitMaximumFallingLevel(cat)
{
    cat.maximumFallingLevel = levelOfCollision(cat.y) - 1;
    if (cat.maximumFallingLevel < -1) cat.maximumFallingLevel = -1;
}

function crossingDoor(oldX, newX, layer)
{
    const isOddLayer = layer % 2 === 1;
    const offset = HOUSES_LEFT_X_WORLD + (isOddLayer ? U : U / 2);
    newX -= offset;
    oldX -= offset;
    if (newX < oldX)
    {
        const temp = oldX;
        oldX = newX;
        newX = temp;
    }
    const housePosition = Math.floor(newX / U);
    newX -= housePosition * U;
    oldX -= housePosition * U;
    if (oldX < 0 && newX >= 0)
        return housePosition;
    else
        return null;
}

function destinationHouse(originLevel, originPosition)
{
    const choices = [];
    for (let l = 0; l < feynik.length; l++)
    {
        for (let i = 0; i < FEYNIK_WIDTH_BY_LEVEL(l); i++)
        {
            if (l === originLevel && i === originPosition) continue;

            if (feynik[l][i])
            {
                choices.push({ level: l, position: i });
            }
        }
    }

    if (choices.length === 0) return null;
    const choice = Math.floor(Math.random() * choices.length);
    return choices[choice];
}

function setGameMouseCallbacks()
{
    gameCanvas.onmousedown = (event) =>
    {
        if (tutorial1status === 1 && event.offsetY < H/3) tutorial1status = 2;
        if (tutorial2status === 1 && event.offsetY < H/3) tutorial2status = 2;

        pickedCat = probeForCat(mousePosition.x, mousePosition.y);

        if (pickedCat == null)
        {
            pickedHouse = probeForHouse(mousePosition.x, mousePosition.y);
            if (pickedHouse == null) return;
            else
            {
                pickedHouseMovement = 0;
                pickOffset = { x: mousePosition.x - HOUSE_X(pickedHouse.level, pickedHouse.position), y: mousePosition.y - HOUSE_Y(pickedHouse.level) + U/2 };
                //console.log(pickedHouse);
            }
        }
        else
        {
            pickedCat.state = "picked";
            pickedCat.progress = 0;
            pickedCat.splat = 0;
            pickOffset = { x: mousePosition.x - pickedCat.x, y: mousePosition.y - pickedCat.y };
            meow(true);
        }
    }

    gameCanvas.onmousemove = (event) =>
    {
        const deltaPosition = { x: event.offsetX - mousePosition.x, y: event.offsetY - mousePosition.y };
        mousePosition = { x: event.offsetX, y: event.offsetY };

        if (pickedCat != null)
        {
            if (deltaPosition.x > 0)
            {
                pickedCat.dir = "right";
            }
            else if (deltaPosition.x < 0)
            {
                pickedCat.dir = "left";
            }
        }

        if (pickedHouse != null)
        {
            pickedHouseMovement += deltaPosition.x * deltaPosition.x + deltaPosition.y * deltaPosition.y;
            killPickedHouseMint(pickedHouseMovement);
        }
    }

    gameCanvas.onmouseout = (event) =>
    {
        catOut();
    }

    gameCanvas.onmouseup = (event) =>
    {
        catOut();

        if (pickedHouse != null) pickedHouse = null;
    }
}

function catOut()
{
    if (pickedCat != null)
    {
        limitMaximumFallingLevel(pickedCat);
        pickedCat.state = "falling";
        pickedCat.fallingShift = 0;
        pickedCat.high = 0;
        pickedCat = null;
    }
}

function probeForCat(x, y)
{
    for (const cat of cats.toReversed())
    {
        const sqrDistance = (cat.x - x) * (cat.x - x) + (cat.y - y) * (cat.y - y) * 4;
        if (sqrDistance <= CAT_GRAB_RADIUS * CAT_GRAB_RADIUS) return cat;
    }

    return null;
}