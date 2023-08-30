const SPAWN_TIME_INCREASE = 0.5;
let currentSpawnTime = 2;

function spawnNewHouse()
{
    dropRandomHouse();

    currentSpawnTime += SPAWN_TIME_INCREASE;
    setTimeout(() =>
    {
        spawnNewHouse();
    }, currentSpawnTime * 1000);
}