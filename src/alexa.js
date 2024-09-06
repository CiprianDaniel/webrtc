import axios from "axios";
import {
  getAlexaRegion,
  getWebAppParticipantForSession,
  sendToWebApp,
} from "./webapp.js";

const aaa=1;
const ALEXA_REFRESH_TOKEN =
  "Atzr|IwEBIAnlrWM1RahNjjVBenr1ihvRcenEUFhajR9iPduEVPIiT0w7W2_O1d8d1zXZ5of_AwNdk9WOVlSQma_prv8AyEWQeYNMOrV5-rf0-ugkNp8B_oKhc--omZIekXLZAuH4WM1uvZf8_N4hQfE-gtToKvN_ows9vTXBe8ajz1R2Q2enmHNXwWtDitepr6hK52ZJhLjiMPdAZa66feR3X8lUhdvHPF5CNuufOETnr7dM50AZ21vizOto9ZBhADhx-RFvg23FqbFZlfAO9BF1fmW1XV7CjnYJNhbcZXnUNDwcDbp1fsMT_An18Jgm0F1VTucB0F0";
  //"Atzr|IwEBIEJYoNW5TE3cRJZxL-AIdZ9IcHbdlO8RHLX791ZVd_hNWmGMM4pwBEVx3omdVyXP4TVYYAxHjQsWw3aNCOMZML6222ZMNk7bEZl9tzI65a3RzxarysnwqMqQSTY__gfnbeUzeRjVsdX0QxnPSIrhquDGryzYkJdu8aFukadyv9ZI4qlLLjURV0WYY5McMWHEUb_cgHbo8XY35D0fdhQDsv-hZoUM_ONFe4t-r71NV74rHzHj6OgDTBjRejjUXeKu-ONL8kLFYxfDBd2XZYT8FfFhY6GSg32ezN8_VRtrZnxcrxFHaPH3sW9xBmMBd3JOI9g";
const ALEXA_CLIENT_ID =
  "amzn1.application-oa2-client.a0f599aeeaac414ba6e9b40896f957cc";
const ALEXA_CLIENT_SECRET =
  "amzn1.oa2-cs.v1.323e07bc158b28d3b425d19110f4b53500842d25b769abce3a5c6389cd584a24";

let accessToken;

async function refreshToken() {
  console.log("Refreshing access token with LWA");
  const body =
    "grant_type=refresh_token&client_id=" +
    ALEXA_CLIENT_ID +
    "&client_secret=" +
    ALEXA_CLIENT_SECRET +
    "&refresh_token=" +
    ALEXA_REFRESH_TOKEN;
  try {
    const response = await axios.post(
      "https://api.amazon.com/auth/o2/token",
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    accessToken = response.data.access_token;
    const expiresIn = response.data.expires_in;
    // Refresh token after 90% token validity
    setTimeout(refreshToken, 1000 * expiresIn * 0.9);
  } catch (e) {
    console.error("Failed to refresh token: ", e);
  }
}
//refreshToken();

const signalingEventsURLforNA =
  "https://api.amazonalexa.com/v1/communications/signaling";
const signalingEventsURLforEU =
  "https://api.eu.amazonalexa.com/v1/communications/signaling";
export function sendToAlexa(message, sessionId) {
  let signalingEventsURL;
  switch (getAlexaRegion()) {
    case "EU":
      signalingEventsURL = signalingEventsURLforEU;
      break;
    case "NA":
      signalingEventsURL = signalingEventsURLforEU;
      break;
    default:
      signalingEventsURL = signalingEventsURLforNA;
      break;
  }
  axios
    .post(signalingEventsURL, message, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .catch((e) => {
      console.error("Request to Alexa Failed");
      sendToWebApp(
        {
          type: "error",
          message: `Got status ${e.response.status}: ${e.response.data.message}`,
        },
        getWebAppParticipantForSession(sessionId)
      );
    });
}
