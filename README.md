> # NB
> This is a fork from  
> https://gitlab.com/kodality/terminology/termx-web
>
> To pull changes:
> ```
> git remote add upstream https://gitlab.com/kodality/terminology/termx-web
> git fetch upstream
> git merge upstream/main
> git push
> ```

# TermX Web

## Install

```shell
npm login --registry=https://kexus.kodality.com/repository/npm/
npm set @kodality-web:registry https://kexus.kodality.com/repository/npm/
npm set @termx:registry https://kexus.kodality.com/repository/npm/

npm install
```

### Update Kodality packages

```shell
rm -rf node_modules/@kodality-* node_modules/@termx package-lock.json && npm i
```

## Run
```shell
ng serve
```
Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Authentication

### Yupi authentication

Change **yupiEnabled** property to **true** in `enviroment.ts` file. It enables admin mode. 
