const express = require("express");
const app = express();
const port = 3000;

const {
  CreateSecretCommand,
  GetSecretValueCommand,
  SecretsManagerClient,
} = require("@aws-sdk/client-secrets-manager");

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-secrets-manager/interfaces/secretsmanagerclientconfig.html#endpoint
// const client = new SecretsManagerClient({ region: "ap-southeast-2" });
const client = new SecretsManagerClient({ endpoint: "http://127.0.0.1:4566" });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/long", (req, res) => {
  res.send("long running code after send");
  let k = 0;
  for (let i = 0; i < 500000000000000; i++) {
    k++;
  }
  console.log({ k });
});

app.get("/create/:name/:secret", async (req, res) => {
  const params = {
    Name: req.params.name,
    SecretString: JSON.stringify({ secret: req.params.secret }),
  };
  const command = new CreateSecretCommand(params);
  const data = await client.send(command);
  res.send({ data });
});

app.get("/get/:arn", async (req, res) => {
  const params = {
    SecretId: req.params.arn, // ARN or unique name
  };
  const command = new GetSecretValueCommand(params);
  const data = await client.send(command); // data.SecretString
  res.send({ data });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
