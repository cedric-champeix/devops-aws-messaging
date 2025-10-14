// lib/oidcConfig.ts
export const oidcConfig = {
  authority: "https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_WB8B3Ktie",
  client_id: "3p8ahkedqac3lff8delu8rc69t",
  redirect_uri: process.env.NODE_ENV !== "development" ? "https://d17ikcnu6s1h8y.cloudfront.net/index.html" : "http://localhost:3000/",
  response_type: "code",
  scope: "email openid phone",
};