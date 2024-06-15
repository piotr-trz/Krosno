const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const ENCRYPTION_KEY = "abcdefghijklmnopqrstuvwx"; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

export type SchemaType = {
  cookie: CookieType;
  videoUrl: string;
};

export type CookieType = {
  userId: string;
  value: object;
};

export type VideoData = {
  userId: string;
  videoLocation: string;
  defaultUploadParams: object;
  presignedUrl: object;
  endCalled: boolean;
  cancellCalled: boolean;
};

export type UserData = {
  name?: string;
};

export type ConfigData = {
  recordingPath: string;
  hwEncode: string;
  audioDevice: string;
  micDevice: string;
};

class Store<T> {
  private path: string;

  constructor(filename: string) {
    const dir = path.join(
      process.env.APPDATA ||
        (process.platform == "darwin"
          ? process.env.HOME + "/Library/Preferences"
          : process.env.HOME + "/.local/share"),
      "krosno"
    );

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.path = path.join(dir, filename);

    console.log("[store]: new store, store path: ", this.path);

    try {
      fs.accessSync(this.path);
    } catch (error) {
      fs.writeFileSync(this.path, JSON.stringify({}));
    }
  }

  get storePath(): string {
    return this.path;
  }

  get(key: keyof T): T[keyof T] | undefined {
    const data: T = JSON.parse(fs.readFileSync(this.path, "utf-8"));
    return data[key];
  }

  getAll(): T {
    return JSON.parse(fs.readFileSync(this.path, "utf-8"));
  }

  set(key: keyof T, value: T[keyof T]): void {
    const data: T = JSON.parse(fs.readFileSync(this.path, "utf-8"));
    data[key] = value;
    fs.writeFileSync(this.path, JSON.stringify(data));
  }

  setMany(values: Partial<T>): void {
    const data: T = JSON.parse(fs.readFileSync(this.path, "utf-8"));
    for (const key in values) {
      data[key as keyof T] = values[key] as T[keyof T];
    }
    fs.writeFileSync(this.path, JSON.stringify(data));
  }

  delete(key: keyof T): void {
    const data: T = JSON.parse(fs.readFileSync(this.path, "utf-8"));
    delete data[key]; // safe to delete even if key doesn't exist
    fs.writeFileSync(this.path, JSON.stringify(data));
  }

  encrypt(text: string) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString("hex") + ":" + encrypted.toString("hex");
  }

  decrypt(text: string) {
    let textParts = text.split(":");
    let iv = Buffer.from(textParts.shift() || "", "hex");
    let encryptedText = Buffer.from(textParts.join(":"), "hex");
    let decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  }
}

export const STORE_KEYS: { [key: string]: keyof SchemaType } = {
  COOKIE: "cookie",
  VIDEO_URL: "videoUrl",
};

export const USER_KEYS: { [key: string]: keyof UserData } = {
  NAME: "name",
};

export const VIDEO_KEYS: { [key: string]: keyof VideoData } = {
  USER_ID: "userId",
  VIDEO_LOCATION: "videoLocation",
  DEFAULT_UPLOAD_PARAMS: "defaultUploadParams",
  PRESIGNED_URL: "presignedUrl",
  END_CALLED: "endCalled",
  CANCELL_CALLED: "cancellCalled",
};

export const CONFIG_KEYS: { [key: string]: keyof ConfigData } = {
  RECORDING_PATH: "recordingPath",
  HW_ENCODE: "hwEncode",
  AUDIO_DEVICE: "audioDevice",
  MIC_DEVICE: "micDevice",
};

export const video_store = (videoId: string) =>
  new Store<VideoData>(videoId + "_store.json");

// config.json is used, one may consider renaming these files.
export const config_store = new Store<ConfigData>("rc.json");

export const user_store = new Store<UserData>("user.json");

const store = new Store<SchemaType>("config.json");

export default store;
