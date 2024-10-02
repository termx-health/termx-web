twConfig = {
  "baseHref": "${BASE_HREF}",
  "oauthIssuer": "${OAUTH_ISSUER}",
  "oauthClientId": "${OAUTH_CLIENT_ID}",
  "oauthScope": "${OAUTH_SCOPE}",
  "termxApi": "${TERMX_API}",
  "swaggerUrl": "${SWAGGER_URL}",
  "chefUrl": "${CHEF_URL}",
  "plantUmlUrl": "${PLANT_UML_URL}",
  "fmlEditor": "${FML_EDITOR}",
  "snowstormUrl": "${SNOWSTORM_URL}",
  "snowstormDailyBuildUrl": "${SNOWSTORM_DAILY_BUILD_URL}",
  "snomedBrowserUrl": "${SNOMED_BROWSER_URL}",
  "snomedBrowserDailyBuildUrl": "${SNOMED_BROWSER_DAILY_BUILD_URL}",
  "defaultLanguage": "${DEFAULT_LANGUAGE}",
  "uiLanguages": 'json:${UI_LANGUAGES}',
  "contentLanguages": 'json:${CONTENT_LANGUAGES}',
  "extraLanguages": 'json:${EXTRA_LANGUAGES}',
};

for (const [key, val] of Object.entries(twConfig)) {
  if (val.startsWith("json:") && !val.startsWith('json:$')) {
    try {
      twConfig[key] = JSON.parse(val.substring("json:".length));
    } catch (e) {
      delete twConfig[key];
    }
  } else if (val === '' || val === undefined) {
    delete twConfig[key]
  }
}
