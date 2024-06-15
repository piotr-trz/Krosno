import {ChildProcess, spawn} from "node:child_process"
import {WriteStream, createWriteStream} from "fs"
import {FFMPEG_BIN} from "./constants";
import {showError} from "../electron/errors";

/**
 * Special FFmpeg error class.
 */
export class FFmpegError extends Error {
    constructor(message: string) { super(message); }
}

/**
 * FFmpeg's subprocesses class with asynchronous methods.
 */
class FFmpeg {
    proc: ChildProcess | undefined;
    alive: boolean;
    logs: WriteStream | undefined;

    constructor() {
        this.proc = undefined;
        this.alive = false;
    }

    /**
     * Run main FFmpeg process. Save its output to given file.
     * @param args - FFmpeg arguments
     * @param logfile - path to log file
     * @returns A promise that resolves when the process has started.
     *
     * @remarks FFmpeg spits a lot of logs. If fd is not closed or piped to anywhere
     * recording might suddenly get stuck and crash.
     */
    async run(args: string[], logfile: string) {
        return new Promise<void>((resolve) => {
            // Let proc infer ChildProcessWithoutNullStreams subclass.
            const proc = this.proc = spawn(FFMPEG_BIN, args);
            this.logs = createWriteStream(logfile); // Closed on terminate.
            proc.stderr.pipe(this.logs);

            this.proc.on("spawn", () => {
                this.alive = true;
                resolve();
            });

            this.proc.on("close", () => {
                this.alive = false;
                this.proc = undefined;
                this.logs?.close();
                showError(new FFmpegError("FFmpeg ended early."));
            })
        });
    }

    /**
     * Terminate main FFmpeg process.
     * @returns A promise that resolves when the process has ended.
     */
    async terminate() {
        return new Promise<void>((resolve, reject) => {
            if (this.proc === undefined || this.proc.stdin === null) {
                reject(new FFmpegError("FFmpeg initialized incorrectly."));
                return;
            }

            const logs = this.logs;

            // Throw error if process will not terminate in 3 seconds.
            setTimeout(() => {
                this.proc?.kill();
                this.alive = false;
                this.proc = undefined;
                reject(new FFmpegError("Couldn't stop FFmpeg process."));
                logs?.close();
            }, 3000);

            this.proc.removeAllListeners("close");
            this.proc.on("close", () => {
                this.alive = false;
                this.proc = undefined;
                resolve(); // Resolve before closing fd; it's not necessary to wait for it to close.
                logs?.close();
            })

            this.proc.stdin.write('q');
        });
    }

    /**
     * Fetch FFmpeg's stderr output.
     * @param args - FFmpeg arguments
     * @returns A string array of lines.
     */
    async fetch(args: string[]) {
        return new Promise<string[]>(resolve => {
            const chunks = new Array<Buffer>();
            const proc = spawn(FFMPEG_BIN, args);

            proc.stderr.on('data', chunk => chunks.push(Buffer.from(chunk)))
            proc.on('close', () => {
                const lines = Buffer.concat(chunks).toString('utf-8').split('\n');
                resolve(lines)
            });
        });
    }
}

export const ffmpeg = new FFmpeg();

/**
 * Check if main FFmpeg process is running.
 * @returns FFmpeg process' status.
 */
export async function isRecording() {
    return ffmpeg.alive;
}
