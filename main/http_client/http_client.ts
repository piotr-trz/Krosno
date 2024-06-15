import axios, { AxiosResponse } from "axios";
import FormData from "form-data";
import store, { CookieType, STORE_KEYS, USER_KEYS, user_store } from "../store";

const ip = "krosno.radcode.co";
const domain = `https://${ip}`;
// const domain = `http://10.20.6.131:3000`;

const apiUrl = `${domain}/api/videos/getStreamUrl`;
const apiEndUrl = `${domain}/api/videos/endVideo`;
const apiLoginUrl = `${domain}/api/loginUser`;
const apiDefaultUploadUrlParams = `${domain}/api/videos/defaultUploadParams`;
const apiCancelledUploadUrl = `${domain}/api/videos/cancelVideo`;
const apiDeleteAllVideoFiles = `${domain}/api/videos/deleteAllVideoFiles`;

const axiosInstance = axios.create({
  timeout: 10000,
});

let cookie: null | object = null;

function getCookies() {
  console.log(
    "[http_client]: Getting cookies from store, path: ",
    store.storePath
  );
  cookie = (store.get(STORE_KEYS.COOKIE) as CookieType)?.value ?? null;
}

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    if (cookie) {
      console.log("[http_client]: Using first cookie:", cookie);
      config.headers.Cookie = cookie;
    } else {
      getCookies();
      if (cookie) {
        console.log("[http_client]: Using first cookie:", cookie);
        config.headers.Cookie = cookie;
      } else {
        console.log("[http_client]: no cookie");
      }
    }
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

async function getDefaultUploadParams(): Promise<any> {
  while (true) {
    try {
      const response = await axiosInstance.get(apiDefaultUploadUrlParams, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (response.status >= 300) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response.data;
    } catch (error: any) {
      console.error("Error getting default upload URL Params:", error.data);
      console.log("Retrying in 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
    }
  }
}

async function getPresignedUrl(uploadParams: any): Promise<any> {
  while (true) {
    try {
      const response: AxiosResponse<any> = await axiosInstance.post(
        apiUrl,
        uploadParams,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status >= 300) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response.data;
    } catch (error: any) {
      console.error("Error getting presigned URL:", error.data);
      console.log("Retrying in 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
    }
  }
}

async function sendFileContentToPresignedUrl(
  fileName: string,
  data: any,
  fileContent: Buffer
): Promise<any> {
  while (true) {
    const form = new FormData();
    form.append("file", fileContent, fileName);

    let response = null;

    try {
      response = await axios.post(data.streamUrl, form, {
        headers: {
          ...form.getHeaders(),
        },
      });
    } catch (error: any) {
      if (error.message === "Network Error") {
        console.log("No internet connection.");
      } else if (error.code === "ECONNABORTED") {
        console.log("The request was timed out by the server.");
      } else {
        console.log("An unknown error occurred:", error.message);
      }

      console.log("Retrying in 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }

    if (response.status >= 300) {
      if (response.status === 404) {
        throw new Error(
          `The video recording time has expired, please record a new video`
        );
      } else {
        throw new Error(
          `Uknown HTTP error! Status: ${response.status}, Data: ${response.data}`
        );
      }
    }

    return response.data;
  }
}

async function sentEndStreaming(data: object): Promise<any> {
  while (true) {
    try {
      console.log("[http_client]: Sending end streaming with data:", data);
      const response = await axios.post(apiEndUrl, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status >= 300) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      if (response.data.success == true) {
        store.set(STORE_KEYS.VIDEO_URL, response.data.watchUrl);
      }

      return response.data;
    } catch (error: any) {
      console.error("Error sending end streaming:", error.data);
      console.log("Retrying in 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
    }
  }
}

async function sentCancellStreaming(data: object): Promise<any> {
  while (true) {
    try {
      console.log("[http_client]: Sending cancell streaming with data:", data);
      const response = await axios.post(apiCancelledUploadUrl, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status >= 300) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response.data;
    } catch (error: any) {
      console.error("Error sending end streaming:", error.data);
      console.log("Retrying in 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
    }
  }
}

async function sentDeleteAllFiles(data: object): Promise<any> {
  while (true) {
    try {
      console.log(
        "[http_client]: Sending delete all video files streaming with data:",
        data
      );
      const response = await axios.post(apiDeleteAllVideoFiles, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status >= 300) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response.data;
    } catch (error: any) {
      console.error("Error sending end streaming:", error.data);
      console.log("Retrying in 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
    }
  }
}

export type LoginResult = {
  loginsuccesful: boolean;
  error: object;
};

async function loginUser(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    console.log("[http_client]: Logging in with email:", email);
    console.log("[http_client]: Logging in with password:", password);

    console.log(apiLoginUrl);

    const response = await axios.post(
      apiLoginUrl,
      {
        email: email,
        password: password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status >= 300) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    console.log("[http_client]: Logged reponce: ", response.data);
    console.log("[http_client]: UserID: ", response.data.user.id);

    // Get the cookies from the response headers
    const cookie = response.headers["set-cookie"];

    if (cookie) {
      console.log("[http_client]: Cookies:", cookie);

      // Store the cookies in the electron-store
      store.set(STORE_KEYS.COOKIE, {
        userId: response.data.user.id,
        value: cookie,
      });
      user_store.set(USER_KEYS.NAME, response.data.user.name);
      return { loginsuccesful: true, error: {} };
    } else {
      return {
        loginsuccesful: false,
        error: { error: "No cookies received!" },
      };
    }
  } catch (error: any) {
    let errorData = error.response.data;
    if (error.code === "ECONNABORTED") {
      errorData = { error: "Request timed out!" };
    } else if (error.message === "Network Error") {
      errorData = { error: "No internet connection" };
    }
    console.error("Error logging in:", errorData);
    return { loginsuccesful: false, error: errorData };
  }
}

async function logoutUser(): Promise<void> {
  return new Promise<void>(async (resolve) => {
    store.delete(STORE_KEYS.COOKIE);
    user_store.delete(USER_KEYS.NAME);
    resolve();
  });
}

export {
  getPresignedUrl,
  sendFileContentToPresignedUrl,
  sentEndStreaming,
  loginUser,
  logoutUser,
  getDefaultUploadParams,
  sentCancellStreaming,
  sentDeleteAllFiles,
};
