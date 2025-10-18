const APP_CLIENT_ID = "3p8ahkedqac3lff8delu8rc69t";
const REDIRECT_URI =
  process.env.NODE_ENV !== "development"
    ? "https://d17ikcnu6s1h8y.cloudfront.net/index.html"
    : "http://localhost:3000/";

export const oidcConfig = {
  authority: "https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_WB8B3Ktie",
  client_id: APP_CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  response_type: "code",
  scope: "email openid phone",
  metadata: {
    issuer: "https://eu-west-1wb8b3ktie.auth.eu-west-1.amazoncognito.com",
    authorization_endpoint:
      "https://eu-west-1wb8b3ktie.auth.eu-west-1.amazoncognito.com/oauth2/authorize",
    token_endpoint:
      "https://eu-west-1wb8b3ktie.auth.eu-west-1.amazoncognito.com/oauth2/token",
    userinfo_endpoint:
      "https://eu-west-1wb8b3ktie.auth.eu-west-1.amazoncognito.com/oauth2/userInfo",
    end_session_endpoint: `https://eu-west-1wb8b3ktie.auth.eu-west-1.amazoncognito.com/logout?client_id=${APP_CLIENT_ID}&logout_uri=${REDIRECT_URI}`,
  },
};
