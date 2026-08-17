// ==UserScript==
// @name         AMQ Song Tracker - Rafik Final
// @namespace    https://github.com/Sayuriiipiano
// @version      1.5
// @description  AMQ Song Tracker for Rafik - Songs + CSL Data + Play History + Daily Stats + Exact Guess Time
// @author       Sayuriiipiano
// @match        https://animemusicquiz.com/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      script.google.com
// @connect      script.googleusercontent.com
// @downloadURL  https://raw.githubusercontent.com/Sayuriiipiano/AMQ-Song-sheet-Tracker---Rafik/main/AMQ%20Song%20Tracker%20-%20Rafik%20Final.user.js
// @updateURL    https://raw.githubusercontent.com/Sayuriiipiano/AMQ-Song-sheet-Tracker---Rafik/main/AMQ%20Song%20Tracker%20-%20Rafik%20Final.user.js
// ==/UserScript==

(function () {

    'use strict';


    // =========================================================
    // GOOGLE APPS SCRIPT
    // =========================================================

    const GOOGLE_SCRIPT_URL =
        'https://script.google.com/macros/s/AKfycbxjDOoe2nxwFINf74BbOp2ZV4Abj9NrCwUOGCrYkvlrVgn-H1elwvM6_QeGdwbP8nxPVw/exec';


    // =========================================================
    // PLAYER
    // =========================================================

    const PLAYER_NAME = 'Rafik';


    // =========================================================
    // MEDIA STORAGE
    // =========================================================

    unsafeWindow.__rafikAMQRealMedia = null;


    // =========================================================
    // GUESS TIMER STORAGE
    // =========================================================

    unsafeWindow.__rafikGuessTimer = {
        startedAt: null,
        lastTimerValue: null
    };


    console.log(
        '🎵 AMQ Song Tracker - RAFIK v1.5 loaded!'
    );


    // =========================================================
    // GUESS TIME HELPER
    // =========================================================

    function getNativeGuessTime(selfResult) {

        // -----------------------------------------------------
        // FIRST: AMQ'S OWN answerTimeing
        // -----------------------------------------------------

        const native =
            selfResult &&
            selfResult.answerTimeing;


        if (
            native != null &&
            Number.isFinite(Number(native))
        ) {

            const value =
                Number(native);


            if (value >= 0) {

                console.log(
                    '⏱️ RAFIK: Native AMQ answer time:',
                    value,
                    'seconds'
                );

                return value;

            }

        }


        // -----------------------------------------------------
        // SECOND: CHECK OTHER POSSIBLE AMQ NAMES
        // -----------------------------------------------------

        const possibleNames = [
            'answerTime',
            'answerTiming',
            'guessTime',
            'time',
            'answerTimeInSeconds'
        ];


        for (
            let i = 0;
            i < possibleNames.length;
            i++
        ) {

            const key =
                possibleNames[i];


            const value =
                selfResult &&
                selfResult[key];


            if (
                value != null &&
                Number.isFinite(Number(value))
            ) {

                const number =
                    Number(value);


                if (number >= 0) {

                    console.log(
                        '⏱️ RAFIK: Found AMQ guess time via',
                        key,
                        ':',
                        number,
                        'seconds'
                    );

                    return number;

                }

            }

        }


        return '';

    }


    // =========================================================
    // FIND AMQ TIMER ELEMENT
    // =========================================================

    function findAMQTimerValue() {

        const possibleSelectors = [

            '#qpAnswerTime',

            '#qpAnswerTimer',

            '#answerTime',

            '#answerTimer',

            '.qpAnswerTime',

            '.qpAnswerTimer',

            '.answerTime',

            '.answerTimer',

            '#quizAnswerTime',

            '#quizAnswerTimer'

        ];


        for (
            let i = 0;
            i < possibleSelectors.length;
            i++
        ) {

            const element =
                document.querySelector(
                    possibleSelectors[i]
                );


            if (!element) {
                continue;
            }


            const text =
                (
                    element.textContent ||
                    element.innerText ||
                    ''
                ).trim();


            const match =
                text.match(
                    /(\d+(?:\.\d+)?)/
                );


            if (match) {

                const value =
                    Number(match[1]);


                if (
                    Number.isFinite(value) &&
                    value >= 0
                ) {

                    return value;

                }

            }

        }


        return null;

    }


    // =========================================================
    // WAIT FOR AMQ
    // =========================================================

    function waitForAMQ() {

        if (!unsafeWindow.setupDocumentDone) {

            setTimeout(
                waitForAMQ,
                500
            );

            return;
        }


        console.log(
            '🎵 AMQ is ready! RAFIK tracker active.'
        );


        // =====================================================
        // NEXT VIDEO INFO
        // =====================================================

        new unsafeWindow.Listener(
            'quiz next video info',
            function (data) {

                console.log(
                    '🎬 RAFIK: NEXT VIDEO INFO RECEIVED'
                );


                // -------------------------------------------------
                // RESET OLD GUESS TIME
                // -------------------------------------------------

                unsafeWindow.__rafikGuessTimer = {

                    startedAt: null,

                    lastTimerValue: null

                };


                const videoInfo =
                    data &&
                    data.videoInfo;


                if (!videoInfo) {

                    console.warn(
                        '⚠️ RAFIK: No videoInfo found.'
                    );

                    return;
                }


                const videoMap =
                    videoInfo.videoMap || {};


                const media = {

                    audio: '',
                    video480: '',
                    video720: '',

                    startPoint:
                        data.startPoint != null
                            ? data.startPoint
                            : '',

                    videoId:
                        videoInfo.id != null
                            ? videoInfo.id
                            : ''

                };


                Object.keys(videoMap).forEach(
                    function (provider) {

                        const providerMap =
                            videoMap[provider];


                        if (!providerMap) {
                            return;
                        }


                        if (
                            !media.audio &&
                            providerMap[0]
                        ) {

                            media.audio =
                                providerMap[0];

                        }


                        if (
                            !media.video480 &&
                            providerMap[480]
                        ) {

                            media.video480 =
                                providerMap[480];

                        }


                        if (
                            !media.video720 &&
                            providerMap[720]
                        ) {

                            media.video720 =
                                providerMap[720];

                        }

                    }
                );


                unsafeWindow.__rafikAMQRealMedia =
                    media;


                console.log(
                    '🎬 RAFIK MEDIA STORED:',
                    media
                );

            }
        ).bindListener();


        // =====================================================
        // ANSWER RESULTS
        // =====================================================

        new unsafeWindow.Listener(
            'answer results',
            function (event) {

                console.log(
                    '================================'
                );


                console.log(
                    '🎵 RAFIK SONG RESULT DETECTED!'
                );


                // =================================================
                // QUIZ
                // =================================================

                const quiz =
                    unsafeWindow.quiz;


                if (
                    !quiz ||
                    !quiz.players
                ) {

                    console.error(
                        '❌ RAFIK: Could not find AMQ quiz.'
                    );

                    return;
                }


                // =================================================
                // FIND SELF
                // =================================================

                const self =
                    Object.values(
                        quiz.players
                    ).find(
                        function (player) {

                            return (
                                player.isSelf &&
                                player._inGame
                            );

                        }
                    );


                if (!self) {

                    console.error(
                        '❌ RAFIK: Could not find yourself.'
                    );

                    return;
                }


                // =================================================
                // FIND SELF RESULT
                // =================================================

                const selfResult =
                    event.players &&
                    event.players.find(
                        function (player) {

                            return (
                                player.gamePlayerId ===
                                self.gamePlayerId
                            );

                        }
                    );


                if (!selfResult) {

                    console.error(
                        '❌ RAFIK: Could not find your result.'
                    );

                    return;
                }


                // =================================================
                // SONG INFO
                // =================================================

                const song =
                    event.songInfo;


                if (!song) {

                    console.error(
                        '❌ RAFIK: event.songInfo missing.'
                    );

                    return;
                }


                // =================================================
                // SITE IDS
                // =================================================

                const siteIds =
                    song.siteIds || {};


                // =================================================
                // AMQ SONG ID
                // =================================================

                const amqSongId =
                    firstValid(

                        selfResult.amqSongId,

                        selfResult.songId,

                        event.amqSongId,

                        event.songId,

                        song.id,

                        song.songId,

                        song.amqSongId,

                        song.songInfoId

                    );


                // =================================================
                // MAL ID
                // =================================================

                const malId =
                    firstValid(

                        song.malId,

                        siteIds.malId

                    );


                // =================================================
                // ANN SONG ID
                // =================================================

                const annSongId =
                    firstValid(

                        song.annSongId,

                        song.annSongID

                    );


                // =================================================
                // SONG NAME
                // =================================================

                const songName =
                    song.songName || '';


                // =================================================
                // TRACKER SONG ID
                // =================================================

                const songId =
                    String(malId) +
                    '_' +
                    String(songName);


                // =================================================
                // ANIME
                // =================================================

                const anime =
                    song.animeRomajiName ||
                    (
                        song.animeNames &&
                        song.animeNames.romaji
                    ) ||
                    '';


                // =================================================
                // ARTIST
                // =================================================

                const artist =
                    song.songArtist ||
                    song.artist ||
                    '';


                // =================================================
                // DIFFICULTY
                // =================================================

                const difficulty =
                    Number(
                        song.songDifficulty != null
                            ? song.songDifficulty
                            : (
                                song.animeDifficulty != null
                                    ? song.animeDifficulty
                                    : 0
                            )
                    );


                // =================================================
                // CORRECT
                // =================================================

                const correct =
                    selfResult.correct === true;


                // =================================================
                // GUESS TIME
                // =================================================

                let guessTime =
                    getNativeGuessTime(
                        selfResult
                    );


                // -------------------------------------------------
                // LOG NATIVE VALUE
                // -------------------------------------------------

                console.log(
                    '⏱️ RAFIK: Native answerTimeing:',
                    selfResult.answerTimeing
                );


                // -------------------------------------------------
                // FALLBACK TO VISIBLE AMQ TIMER
                // -------------------------------------------------

                if (
                    guessTime === ''
                ) {

                    const visibleTimer =
                        findAMQTimerValue();


                    if (
                        visibleTimer != null
                    ) {

                        guessTime =
                            visibleTimer;


                        console.log(
                            '⏱️ RAFIK: AMQ visible timer:',
                            guessTime,
                            'seconds'
                        );

                    }

                }


                // -------------------------------------------------
                // FINAL FALLBACK
                // -------------------------------------------------

                if (
                    guessTime === ''
                ) {

                    console.warn(
                        '⚠️ RAFIK: AMQ native guess time unavailable.'
                    );

                }


                // =================================================
                // LIST STATUS
                // =================================================

                const listStatus =
                    selfResult.listStatus != null
                        ? selfResult.listStatus
                        : 0;


                const fromMyList =
                    Number(listStatus) !== 0;


                // =================================================
                // LIST NUMBER
                // =================================================

                const listNumber =
                    firstValid(

                        selfResult.listNumber,

                        selfResult.listIndex,

                        selfResult.listNumberInList

                    );


                // =================================================
                // SONG TYPE
                // =================================================

                const rawType =
                    song.songType != null
                        ? song.songType
                        : song.type;


                const rawTypeNumber =
                    song.songTypeNumber != null
                        ? song.songTypeNumber
                        : song.typeNumber;


                let songTypeText;


                if (
                    Number(rawType) === 3
                ) {

                    songTypeText =
                        'Insert Song';

                } else if (
                    Number(rawType) === 2
                ) {

                    songTypeText =
                        'Ending ' +
                        (
                            rawTypeNumber ||
                            1
                        );

                } else {

                    songTypeText =
                        'Opening ' +
                        (
                            rawTypeNumber ||
                            1
                        );

                }


                // =================================================
                // VIDEO TARGET MAP
                // =================================================

                const videoTargetMap =
                    song.videoTargetMap || {};


                const catboxTarget =
                    videoTargetMap.catbox || {};


                const targetAudio =
                    catboxTarget[0] ||
                    '';


                const target480 =
                    catboxTarget[480] ||
                    '';


                const target720 =
                    catboxTarget[720] ||
                    '';


                // =================================================
                // REAL MEDIA
                // =================================================

                let realMedia =
                    unsafeWindow.__rafikAMQRealMedia;


                if (!realMedia) {

                    console.warn(
                        '⚠️ RAFIK: No media captured.'
                    );


                    realMedia = {

                        audio: '',
                        video480: '',
                        video720: '',
                        startPoint: '',
                        videoId: ''

                    };

                }


                // =================================================
                // AMQ VIDEO ID
                // =================================================

                const amqVideoId =
                    firstValid(

                        realMedia.videoId,

                        event.amqVideoId,

                        event.videoId,

                        song.videoId

                    );


                // =================================================
                // FINAL DATA
                // =================================================

                const data = {

                    playerName:
                        PLAYER_NAME,


                    songId:
                        songId,


                    anime:
                        anime,


                    songType:
                        songTypeText,


                    song:
                        songName,


                    artist:
                        artist,


                    difficulty:
                        difficulty,


                    correct:
                        correct,


                    guessTime:
                        guessTime,


                    listStatus:
                        listStatus,


                    fromMyList:
                        fromMyList,


                    listNumber:
                        listNumber,


                    amqSongId:
                        amqSongId,


                    amqVideoId:
                        amqVideoId,


                    malId:
                        malId,


                    annSongId:
                        annSongId,


                    songInfo:
                        song,


                    realMedia:
                        realMedia,


                    videoTargetMap:
                        videoTargetMap,


                    targetAudio:
                        targetAudio,


                    target480:
                        target480,


                    target720:
                        target720

                };


                // =================================================
                // LOGGING
                // =================================================

                console.log(
                    '🎵 RAFIK SONG:',
                    songName
                );


                console.log(
                    '🎤 RAFIK ARTIST:',
                    artist
                );


                console.log(
                    '🆔 RAFIK SONG ID:',
                    songId
                );


                console.log(
                    '🆔 RAFIK AMQ SONG ID:',
                    amqSongId
                );


                console.log(
                    '🎬 RAFIK AMQ VIDEO ID:',
                    amqVideoId
                );


                console.log(
                    '👤 RAFIK PLAYER:',
                    PLAYER_NAME
                );


                console.log(
                    '⏱️ RAFIK GUESS TIME:',
                    guessTime,
                    'seconds'
                );


                console.log(
                    '✅ RAFIK CORRECT:',
                    correct
                );


                console.log(
                    '📋 RAFIK LIST STATUS:',
                    listStatus
                );


                console.log(
                    '📋 RAFIK FROM MY LIST:',
                    fromMyList
                );


                console.log(
                    '📋 RAFIK LIST NUMBER:',
                    listNumber
                );


                console.log(
                    '📤 Sending to RAFIK Google Sheets...'
                );


                // =================================================
                // SEND
                // =================================================

                GM_xmlhttpRequest({

                    method:
                        'POST',

                    url:
                        GOOGLE_SCRIPT_URL,

                    headers: {

                        'Content-Type':
                            'application/json'

                    },

                    data:
                        JSON.stringify(data),

                    onload:
                        function (response) {

                            console.log(
                                '📥 RAFIK Google Sheets response:',
                                response.responseText
                            );

                        },

                    onerror:
                        function (error) {

                            console.error(
                                '❌ RAFIK Google Sheets failed:',
                                error
                            );

                        }

                });


                console.log(
                    '================================'
                );

            }
        ).bindListener();


        console.log(
            '🎵 RAFIK tracker listeners active!'
        );

    }


    // =========================================================
    // FIRST VALID VALUE
    // =========================================================

    function firstValid() {

        for (
            let i = 0;
            i < arguments.length;
            i++
        ) {

            const value =
                arguments[i];


            if (
                value !== null &&
                value !== undefined &&
                value !== ''
            ) {

                return value;

            }

        }


        return '';

    }


    // =========================================================
    // START
    // =========================================================

    waitForAMQ();

})();