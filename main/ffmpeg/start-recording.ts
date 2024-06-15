import path from "node:path";
import * as fs from "node:fs/promises";
import {screen} from "electron";
import {ffmpeg} from "./ffmpeg-process";
import {setAudioDevice, setMicDevice} from "./config";
import {LOGFILE_NAME, PLAYLIST_NAME, TEMP_PATH} from "./constants";

/**
 * FFmpeg recording parameters.
 */
export type FFmpegArgs = {
    video: string               // electron's screen_id
    mic: string                 // microphone device
    desktop: string             // desktop audio device
    resolution: string          // output video resolution
    path?: string               // recording destination (otherwise tmpdir)
    hwEncode?: string           // video encoder (in most cases hardware)
}

/**
 * Start recording process.
 * @param args - FFmpeg recording parameters
 *
 * @returns Name of the M3U8 playlist file.
 */
export async function startRecording(args: FFmpegArgs) {
    let filename, logfile: string;
    const isHLS = typeof args.path === "undefined";
    if (typeof args.path === "undefined") {
        // Even if directory exists, won't throw.
        await fs.mkdir(TEMP_PATH, {recursive: true});
        args.path = await fs.mkdtemp(path.join(TEMP_PATH, '/'));
        filename = path.join(args.path, PLAYLIST_NAME);
    } else {
        filename = path.join(args.path, (new Date).toISOString() + ".mp4");
    }
    if (typeof args.hwEncode === "undefined")
        args.hwEncode = "libx264";

    logfile = path.join(args.path, LOGFILE_NAME);

    const screenId = Number(args.video.slice(7)) // Extract number from string "Screen %d".
    const bounds = screen.getAllDisplays()[screenId].bounds
    const inputOptions = [
        "-video_size", bounds.width + "x" + bounds.height,
        "-framerate", "25",
    ];

    switch(process.platform) {
        case 'win32':
            inputOptions.push(                                          /* video stream */
                "-f", "gdigrab",
                "-offset_x", bounds.x.toString(),
                "-offset_y", bounds.y.toString(),
                "-thread_queue_size", "4096",
                "-i", "desktop",
            );
            if (args.mic !== "None")                                    /* audio streams */
                inputOptions.push("-f", "dshow", "-i", "audio=" + args.mic)
            if (args.desktop)
                inputOptions.push("-f", "dshow", "-thread_queue_size", "512", "-i", "audio=virtual-audio-capturer");
            break;
        case 'linux':
            inputOptions.push(
                /* video stream */
                "-f", "x11grab",
                "-thread_queue_size", "4096",
                "-i", process.env.DISPLAY + "+" +
                    bounds.x.toString() + "," + bounds.y.toString()
            );
            if (args.mic !== "" && args.mic !== "None") {                                    /* audio streams */
                inputOptions.push(...args.mic.split(/\s+/g));
                setMicDevice(args.mic);
            }
            if (args.mic !== "" && args.mic !== "None") {
                inputOptions.push(...args.desktop.split(/\s+/g));
                setAudioDevice(args.desktop);
            }
            break;
    }

    const filterComplex = [
        "-filter_complex",
        "[0] scale=" + args.resolution + " [video]",
    ]
    const outputOptions = [
        /* encoders */
        "-pix_fmt", "yuv420p",
        "-c:v", args.hwEncode,
        "-b:v", "5M",
        "-c:a", "aac",
    ]
    if (isHLS)
        outputOptions.push("-hls_list_size", "0", "-hls_flags", "append_list", "-f", "hls");

    outputOptions.push("-map", "[video]");
    if (args.mic !== "None" || args.desktop !== "None")                // Only 1 output audio stream.
        outputOptions.push("-map", "1")
    if (args.mic !== "None" && args.desktop !== "None") {              // Mix 2 audio streams.
        filterComplex[1] += ("; [1][2] amix [audio]");
        outputOptions[outputOptions.length - 1] = "[audio]" // Replace output audio stream.
    }

    await ffmpeg.run([...inputOptions, ...filterComplex, ...outputOptions, filename], logfile);
    return filename;
}
