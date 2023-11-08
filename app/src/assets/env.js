twConfig = {
  "oauthIssuer": "${OAUTH_ISSUER}",
  "oauthClientId": "${OAUTH_CLIENT_ID}",
  "termxApi": "${TERMX_API}",
  "swaggerUrl": "${SWAGGER_URL}",
  "chefUrl": "${CHEF_URL}",
  "plantUmlUrl": "${PLANT_UML_URL}",
  "fmlEditor": "${FML_EDITOR}",
  "snowstormUrl": "${SNOWSTORM_URL}",
  "snowstormDailyBuildUrl": "${SNOWSTORM_DAILY_BUILD_URL}",
  "defaultLanguage": "${DEFAULT_LANGUAGE}",
  "languages": "json:${LANGUAGES}",
};

for (const k of Object.keys(twConfig)) {
  if (twConfig[k].startsWith("json:")) {
    try {
      twConfig[k] = JSON.parse(twConfig[k].substring("json:".length));
    } catch (e) {
    }
  }
}
