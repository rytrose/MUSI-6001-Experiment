let wavesurfer;
let track = -1;
let tracks = ["audio/Forest-Noise.wav", "audio/Harsh-Noise.wav", "audio/Street-Noise.wav"];
let results = {};
let timer = new Timer();

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

    wavesurfer.on('ready', onReady);
    wavesurfer.on('region-created', onRegionCreated);
    wavesurfer.on("region-updated", onRegionUpdated);
    wavesurfer.load('audio/test.mp3');

    $("#completeForm").on('submit', event => {
        event.preventDefault();

        if($("#name").val() === "") {
            alert("Please enter your name");
            return;
        }
        else save($("#name").val(), JSON.stringify(results));

        $("#complete").hide();
        $("#directions").html("Thank you! You may now close this page.");
    });
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

let save = async (name, result) => {
    const rawResponse = await fetch('https://musi-6001-experiment.herokuapp.com/save', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: name, result: result})
    });
    const content = await rawResponse.json();

    console.log(content);
};

let begin = () => {
    $("#begin").hide();
    $("#controls").hide();
    $("#regions").empty();
    $("#directions").html("Please identify as many musical patterns as you can. " +
        "If you feel you have finished before time elapses, press the finish button below.");
    track = 0;
    loadTrack(track);
};

let loadTrack = (track_id) => {
    $("#loading").show();
    $("#finish").show();

    wavesurfer.destroy();

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

    wavesurfer.on('ready', onReady);
    wavesurfer.on('region-created', onRegionCreated);
    wavesurfer.on("region-updated", onRegionUpdated);

    wavesurfer.load(tracks[track_id]);
};

let finish = () => {
    $("#waveform").css( 'pointer-events', 'none' );
    $("#controls").hide();
    $("#timer").hide();
    if(timer) timer.stop();
    timer = new Timer();
    $("#finish").hide();

    results[track] = [];
    for (const region_id in wavesurfer.regions.list) {
        let region_raw = wavesurfer.regions.list[region_id];
        $(`#${region_raw.id}_delete`).remove();
        $(`#${region_raw.id}_pause`).remove();
        $(`#${region_raw.id}_resume`).remove();

        $(`#${region_raw.id}`).append(`
            <form style="display: inline">
                <label for="${region_raw.id}_mel">Melodic:</label>
                <input id="${region_raw.id}_mel" type="radio" name="${region_raw.id}">
                <label for="${region_raw.id}_rhy">Rhythmic:</label>
                <input id="${region_raw.id}_rhy" type="radio" name="${region_raw.id}">
            </form>
        `);

        let region = {};
        region.start = region_raw.start;
        region.end = region_raw.end;
        region.label = "";
        results[track].push(region);
    }

    $("#directions").html("Please label each region you identified as predominantly melodic, " +
        "or predominantly rhythmic. When you are finished, hit submit. This will start the next track.");

    $("#submit").show();
};

let submit = () => {
    let region_num = 0;
    for (const region_id in wavesurfer.regions.list) {
        let region_raw = wavesurfer.regions.list[region_id];

        if ($(`#${region_raw.id}_mel`).is(':checked')) {
            results[track][region_num].label = "melodic";
        } else if ($(`#${region_raw.id}_rhy`).is(':checked')) {
            results[track][region_num].label = "rhythmic";
        } else {
            alert("Please label each region as either Melodic or Rhythmic.");
            return;
        }
        region_num++;
    }

    $("#submit").hide();
    next();
};

let next = () => {
    $("#regions").empty();

    track++;
    if (track > 2) {
        $("#complete").show();
        $("#waveform").hide();
        $("#directions").html("Thank you for participating in this experiment. Please enter your GT ID# (or name if not a student) and press " +
            "Complete to submit.");
    } else {
        loadTrack(track);
    }
};

let onReady = () => {
    $("#loading").hide();
    $("#waveform").fadeIn().css( 'pointer-events', 'auto' );
    $("#controls").fadeIn();
    if (track >= 0) {
        timer.start({countdown: true, startValues: {minutes: 5}});
        $('#timer').html(timer.getTimeValues().toString()).fadeIn();

        timer.addEventListener('secondsUpdated', function (e) {
            $('#timer').html(timer.getTimeValues().toString());
        });
        timer.addEventListener('targetAchieved', function (e) {
            finish();
        });
    }
};

let onRegionCreated = (region) => {
    let color = `${getRandomInt(0, 255)}, ${getRandomInt(0, 255)}, ${getRandomInt(0, 255)}`;

    $("#regions").append(
        `<div id="${region.id}">
                <p>
                    Start: <span id="${region.id}_start"></span>s, End: <span id="${region.id}_end"></span>s
                    <button id="${region.id}_play" onclick="playRegion(this.id.substr(0, this.id.length - 5))">Play from Beginning</button>
                    <button id="${region.id}_pause" onclick="pause()">Pause</button>
                    <button  id="${region.id}_resume" onclick="play()">Resume</button>
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
};

let onRegionUpdated = (region) => {
    $(`#${region.id}_start`).html(region.start.toFixed(2));
    $(`#${region.id}_end`).html(region.end.toFixed(2));
};
