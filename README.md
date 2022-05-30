# Terminology Web

## Install

```shell
npm login --registry=https://kexus.kodality.com/repository/npm/
npm set @kodality-web:registry https://kexus.kodality.com/repository/npm/

npm login --registry=https://kexus.kodality.com/repository/npm-health/
npm set @kodality-health:registry https://kexus.kodality.com/repository/npm-health/

npm install
```

### Update Kodality packages

```shell
rm -rf node_modules/@kodality-* package-lock.json && npm i
```
