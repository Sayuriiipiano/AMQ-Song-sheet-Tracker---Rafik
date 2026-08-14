// ==UserScript==
// @name         AMQ Song Tracker - Rafik
// @namespace    https://github.com/Sayuriiipiano
// @version      1.0
// @description  AMQ Song Tracker for Rafik - Songs + CSL Data
// @author       Sayuriiipiano
// @match        https://animemusicquiz.com/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      script.google.com
// @connect      script.googleusercontent.com
// @downloadURL  https://raw.githubusercontent.com/Sayuriiipiano/AMQ-Song-sheet-Tracker---Rafik/main/AMQ%20Song%20Tracker%20-%20Rafik-1.0.js
// @updateURL    https://raw.githubusercontent.com/Sayuriiipiano/AMQ-Song-sheet-Tracker---Rafik/main/AMQ%20Song%20Tracker%20-%20Rafik-1.0.js
// ==/UserScript==
(function () {

    'use strict';

    // =========================================================
    // RAFIK GOOGLE APPS SCRIPT
    // =========================================================

    const GOOGLE_SCRIPT_URL =
        'https://script.google.com/macros/s/AKfycbxjDOoe2nxwFINf74BbOp2ZV4Abj9NrCwUOGCrYkvlrVgn-H1elwvM6_QeGdwbP8nxPVw/exec';


    // =========================================================
    // GLOBAL MEDIA STORAGE
    // =========================================================

    unsafeWindow.__rafikAMQRealMedia = null;

    console.log(
        '🎵 AMQ Song Tracker - RAFIK v1.0 loaded!'
    );


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


                // =================================================
                // FIND ACTUAL PLAYBACK MEDIA
                // =================================================

                Object.keys(videoMap).forEach(
                    function (provider) {

                        const providerMap =
                            videoMap[provider];

                        if (!providerMap) {
                            return;
                        }


                        // Audio

                        if (
                            !media.audio &&
                            providerMap[0]
                        ) {

                            media.audio =
                                providerMap[0];

                        }


                        // 480p

                        if (
                            !media.video480 &&
                            providerMap[480]
                        ) {

                            media.video480 =
                                providerMap[480];

                        }


                        // 720p

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
                // FIND RAFIK / SELF
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
                // FIND RESULT
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
                // MAL ID
                // =================================================

                const malId =
                    song.malId != null
                        ? song.malId
                        : (
                            siteIds.malId != null
                                ? siteIds.malId
                                : ''
                        );


                // =================================================
                // ANN SONG ID
                // =================================================

                const annSongId =
                    song.annSongId != null
                        ? song.annSongId
                        : '';


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
                // BASIC DATA
                // =================================================

                const anime =
                    song.animeRomajiName ||
                    (
                        song.animeNames &&
                        song.animeNames.romaji
                    ) ||
                    '';


                const artist =
                    song.artist ||
                    song.songArtist ||
                    '';


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


                const correct =
                    selfResult.correct === true;


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
                // FINAL DATA
                // =================================================

                const data = {

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

                    songInfo:
                        song,

                    realMedia:
                        realMedia,

                    malId:
                        malId,

                    annSongId:
                        annSongId,

                    videoTargetMap:
                        videoTargetMap,

                    targetAudio:
                        targetAudio,

                    target480:
                        target480,

                    target720:
                        target720

                };


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
                    '✅ RAFIK CORRECT:',
                    correct
                );

                console.log(
                    '📤 Sending to RAFIK Google Sheets...'
                );


                // =================================================
                // SEND TO GOOGLE SHEETS
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
    // START
    // =========================================================

    waitForAMQ();

})();
