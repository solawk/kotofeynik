const Sounds = new Map;

function loadSound(name, source, volume)
{
    Sounds.set(name, new Howl(
    {
        src: [ source ],
        volume: volume,
    }));
}

loadSound("vineboom", "./audio/vineboom.mp3", 0.5);
loadSound("explosion", "./audio/explosion.mp3", 0.5);

const MEOW_COUNT = 13;
for (let i = 0; i < MEOW_COUNT; i++)
{
    loadSound("meow" + i, "./audio/meow" + i + ".mp3", 0.5);
}

const MEOW_DEFAULT_DELAY = 6;
const MEOW_DELAY_DEC_PER_CAT = 0.055;

function meow(nonRepeat)
{
    const choice = Math.floor(Math.random() * MEOW_COUNT);
    Sounds.get("meow" + choice).play();

    if (!nonRepeat)
    {
        setTimeout(() =>
        {
            meow(false);
        }, (MEOW_DEFAULT_DELAY - cats.length * MEOW_DELAY_DEC_PER_CAT) * (0.6 + 0.4 * Math.random()) * 1000);
    }
}


