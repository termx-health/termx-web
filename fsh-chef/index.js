const express = require("express");
const app = express();
app.use(express.json({limit: '100mb'}));
const port = 3000;

const {sushiClient} = require('fsh-sushi');
const {gofshClient} = require('gofsh');

app.listen(port, () => {
  console.log(`Running on http://localhost:${port}/`);
});

app.post("/fsh2fhir", (req, res) => {
  res.contentType("application/json")
  sushiClient
    .fshToFhir(req.body.fsh, req.body.options)
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
    .fhirToFsh(params.fhir, params.options)
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
