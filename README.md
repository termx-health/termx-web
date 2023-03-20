# Terminology Web

## Install

```shell
npm login --registry=https://kexus.kodality.com/repository/npm/
npm set @kodality-web:registry https://kexus.kodality.com/repository/npm/
npm set @terminology:registry https://kexus.kodality.com/repository/npm/

npm install
```

### Update Kodality packages

```shell
rm -rf node_modules/@kodality-* node_modules/@terminology package-lock.json && npm i
```

## Run
```shell
ng serve
```
Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Authentication

### Yupi authentication

Change **yupiEnabled** property to **true** in `enviroment.ts` file. It enables admin mode. 
