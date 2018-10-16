let wavesurfer;
let regions = [];

$(() => {

    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: '#d3d3d3',
        progressColor: '#878787',
        plugins: [
            WaveSurfer.regions.create({
                regions: [],
                dragSelection: {
                    slop: 1
                }
            })
        ]
    });

    wavesurfer.on('ready', () => {
        $("#loading").hide();
        $("#waveform").hide();
        $("#waveform").fadeIn();
        $("#controls").fadeIn();
    });

    wavesurfer.on('region-created', (region) => {
        let color = `${getRandomInt(0, 255)}, ${getRandomInt(0, 255)}, ${getRandomInt(0, 255)}`;

        $("#regions").append(
            `<div id="${region.id}">
                <p>
                    Start: <span id="${region.id}_start"></span>s, End: <span id="${region.id}_end"></span>s
                    <button id="${region.id}_play" onclick="playRegion(this.id.substr(0, this.id.length - 5))">Play from Beginning</button>
                    <button onclick="pause()">Pause</button>
                    <button onclick="play()">Resume</button>
                    <button id="${region.id}_delete" onclick="removeRegion(this.id.substr(0, this.id.length - 7))">Delete Region</button>
                </p>
            </div>`
        );

        $(`#${region.id}`).css({
            backgroundColor: `rgba(${color}, 0.2)`,
            border: `5px solid rgba(${color}, 0.2)`,
            borderRadius: "15px"
        });

        region.element.children[0].style.minWidth = '4px';
        region.element.children[0].style.width = '8px';
        region.element.children[0].style.maxWidth = '10px';
        region.element.children[0].style.backgroundColor = `rgba(${color}, 0.2)`;
        region.element.children[1].style.minWidth = '4px';
        region.element.children[1].style.width = '8px';
        region.element.children[1].style.maxWidth = '10px';
        region.element.children[1].style.backgroundColor = `rgba(${color}, 0.2)`;
    });

    wavesurfer.on("region-updated", (region) => {
        $(`#${region.id}_start`).html(region.start.toFixed(2));
        $(`#${region.id}_end`).html(region.end.toFixed(2));
    });

    wavesurfer.load('audio/intro.mp3');

});

let play = () => {
    wavesurfer.play();
};

let pause = () => {
    wavesurfer.pause();
};

let getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

let removeRegion = (id) => {
    wavesurfer.regions.list[id].remove();
    $(`#${id}`).remove();
};

let playRegion = (id) => {
    wavesurfer.regions.list[id].play();
};