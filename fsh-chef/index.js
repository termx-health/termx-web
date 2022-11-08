const express = require("express");
const app = express();
app.use(express.json())
const port = 3000;

const {sushiClient} = require('fsh-sushi');
const {gofshClient} = require('gofsh');

app.listen(port, () => {
  console.log(`Running on http://localhost:${port}/`);
});

app.post("/fsh2fhir", (req, res) => {
  res.contentType("application/json")
  sushiClient
    .fshToFhir(req.body.fsh)
    .then((results) => {
      if (results.errors?.length > 0) {
        fail(res, results)
      } else {
        res.send(results)
      }
    })
    .catch((err) => {
      fail(res, err);
    });
});

app.post("/fhir2fsh", (req, res) => {
  res.contentType("application/json")
  const params = req.body
  gofshClient
    .fhirToFsh(params.fhir, {
      dependencies: params.dependencies || [],
      style: params.style,
      logLevel: params.logLevel,
    })
    .then((results) => {
      if (results.errors?.length > 0) {
        fail(res, results)
      } else {
        res.send(results)
      }
    })
    .catch((err) => {
      fail(res, err);
    });

});

function fail(res, err) {
  res.status(500).send(err)
}
