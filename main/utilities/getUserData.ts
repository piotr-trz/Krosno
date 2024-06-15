import { appLinkHasPresignedUrl } from "../app_link/handleAppLinkUrl";
import store, {STORE_KEYS, USER_KEYS, user_store} from "../store";
import {UserData} from "../store";

export function streamable() {
  return store.get(STORE_KEYS.COOKIE) !== undefined || appLinkHasPresignedUrl();
}

async function getUserData() {
  return new Promise<UserData | undefined>(async (resolve, reject) => {
    let name: string | undefined;
    if (store.get(STORE_KEYS.COOKIE)) {
      name = user_store.get(USER_KEYS.NAME); // String(undefined) returns "undefined"
      resolve({name});
    }
    else {
      resolve(undefined);
    }
  });
}
export default getUserData;
