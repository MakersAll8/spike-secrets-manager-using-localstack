const express = require("express");
const app = express();
const port = 3500;
const fs = require("fs");
const axios = require("axios");

const {
  CreateSecretCommand,
  GetSecretValueCommand,
  SecretsManagerClient,
  DeleteSecretCommand,
  UpdateSecretCommand,
} = require("@aws-sdk/client-secrets-manager");
// https://github.com/awsdocs/aws-doc-sdk-examples/blob/main/javascriptv3/example_code/s3/src/s3_get_presignedURL.js
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  S3Client,
  GetObjectCommand,
  CreateBucketCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-secrets-manager/interfaces/secretsmanagerclientconfig.html#endpoint
// const client = new SecretsManagerClient({ region: "ap-southeast-2" });
const client = new SecretsManagerClient({ endpoint: "http://127.0.0.1:4566" });
const s3Client = new S3Client({
  endpoint: "http://127.0.0.1:4566",
  region: "us-east-1",
});

// const command = new CreateBucketCommand({ Bucket: "test" });
// s3Client.send(command);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/create/file", async (req, res) => {
  // https://github.com/awsdocs/aws-doc-sdk-examples/blob/main/javascriptv3/example_code/s3/src/s3_create_and_upload_objects.js
  // const writeStream = fs.createWriteStream();
  const buff = Buffer.from("hello s3", "utf8");
  const _command = new PutObjectCommand({
    Bucket: "test",
    Key: "output",
    Body: buff.toString(),
  });

  res.send("created file!");
  const data = await s3Client.send(_command);
  console.log(data);
});

app.get("/get/file", async (req, res) => {
  const command = new GetObjectCommand({
    Bucket: "test",
    Key: "output",
  });
  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600,
  });
  console.log(signedUrl);
  res.send(signedUrl);
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

app.get("/update/:arn/:secret", async (req, res) => {
  const params = {
    SecretId: req.params.arn, // ARN or unique name
    SecretString: JSON.stringify({ secret: req.params.secret }),
  };
  const command = new UpdateSecretCommand(params);
  const data = await client.send(command); // data.SecretString
  res.send({ data });
});

app.get("/delete/:arn", async (req, res) => {
  const params = {
    SecretId: req.params.arn, // ARN or unique name
  };
  const command = new DeleteSecretCommand(params);
  const data = await client.send(command); // data.SecretString
  res.send({ data });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
