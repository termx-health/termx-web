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
  "uiLanguages": 'json:${UI_LANGUAGES}',
  "contentLanguages": 'json:${CONTENT_LANGUAGES}',
  "extraLanguages": 'json:${EXTRA_LANGUAGES}',
};

for (const [k, value] of Object.entries(twConfig)) {
  if (value.startsWith("json:")) {
    try {
      twConfig[k] = JSON.parse(value.substring("json:".length));
    } catch (e) {
      console.error('Failed to parse config property', e);
      twConfig[k] = undefined;
    }
  }
}
