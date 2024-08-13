import axios from "axios";
import {
  getAlexaRegion,
  getWebAppParticipantForSession,
  sendToWebApp,
} from "./webapp.js";

const aaa=1;
const ALEXA_REFRESH_TOKEN =
  "Atza|IwEBIGZhzV59_ZGW72wjtM1iO8KlotLMN2jZyytG4ViBnuW2GMXIQAM0Zwsz6AZv20-M7NpDyOxiV6X6CinlRiiNlWMOqsqgD3SsqqaJQrQiVf2n1GDkE3-CsBi13_QS0ozViKVADvgt7pGDJTnkPi1upsRQqR3gINGWuxqkGJsBpYji7wi4frcu8mYaqXH1vj_sm5nTn7ERq6TTvBnTFPMgQBn80DIcsMX5W9z-XbA0SnUHD-vDnoUQ4TLCVHaEQQ975QD2iRv87oiDUiDABiVxLTvKC7pBE6-8xN9d6axnVjjdh_MkpcQDa1KF6hmJI2TaVHbgap-Wrs2RS9VAb0YEFO1GxpB7p-b13PuB2L5KA19zhuwPnr30gGGRhddbEEqvrcEFyXV-BJBm-urE1V32lIpUiKw5r_4eomgL1BDZ8VMVV3UOTjfSXPrOdHWjk1xqf0wFMAybMzsgnhGYMXCnwVRR_q85IL4BmqJh-eqoECIFMw";
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
