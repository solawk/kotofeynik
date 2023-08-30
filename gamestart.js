function startGame()
{
    showMenuButtons = false;
    setGameMouseCallbacks();
    spawnNewHouse();

    setTimeout(() =>
    {
        meow(false);
    }, 4000)
}

let showMenuButtons = true;
let withTutorial = false;

let tutorial1status = 0;
let tutorial1cat = null;
let tutorial2status = 0;
let tutorial2cat = null;

gameCanvas.onmousedown = (event) =>
{
    withTutorial = event.offsetX < W/2;
    startGame();
}