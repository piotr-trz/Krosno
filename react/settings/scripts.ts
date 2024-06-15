/*******************************************************************************
 *                          FFmpeg Settings Handlers                           *
 * The handler for FFmpeg settings that are hardcoded: encoder.                *
 ******************************************************************************/
export async function handleSubmitSettings() {
    const button = (document.getElementById("settings-button") as HTMLButtonElement);
    button.disabled = true;
    const hwEncode = (document.getElementById("encoder") as HTMLInputElement).value;
    await window.krosnoAPI.setHwEncoder(hwEncode);
    button.disabled = false;
}
