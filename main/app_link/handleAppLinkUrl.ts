let presignedUrl: null | object = null;

export function appLinkGetPresignedUrl() {
  let presignedUrlCopy = presignedUrl;
  presignedUrl = null;
  return presignedUrlCopy;
}

export function appLinkHasPresignedUrl() {
  return presignedUrl !== null;
}

function handleAppLinkUrl(url: string): void {
  const urlObject = new URL(url);
  const jsonFormattedString = urlObject.searchParams.get("data");

  if (jsonFormattedString) {
    try {
      const data = JSON.parse(decodeURIComponent(jsonFormattedString));
      presignedUrl = data;
    } catch (error) {
      console.error("Failed to parse JSON:", error);
    }
  }
}

export default handleAppLinkUrl;
