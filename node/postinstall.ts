import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

/** ./gradle/includes/.. */
const INCLUDES_FOLDER = "includes";
const IncludesContext = [
  "TASKS",
  "FABRIC",
  "FORGE",
  "QUILT",
  "COMMON"
]
const DefaultLocalProperties = [
  "curseforge_api"
]

{ /* S C R I P T - P R O C E S S */
  console.log("Start main.ts > prepare project");

  ////////////////////////////////////////////////////
  // 1) check path and update if required

  // -> append DIR_PROJECT
  const ctxRootDir = (os.type() === "Windows_NT")
    ? path.resolve(__dirname, "..").replace(/\\/g, '/')
    : path.resolve(__dirname, "..");
  let replacementContent = `String PATH_PROJECT = "${ctxRootDir}"` + os.EOL;

  // -> includes process
  const ctxIncludePath = path.resolve(ctxRootDir, INCLUDES_FOLDER);
  if (fs.existsSync(ctxIncludePath)) {
    replacementContent += prepareIncludesPath(ctxIncludePath);
    const fileCommonGradle = path.resolve(ctxIncludePath, "common.gradle");

    // -> write process
    if (fs.existsSync(fileCommonGradle))
      replaceContentCommonGradle(fileCommonGradle, replacementContent);
    else
      console.error("impossible to find the common.gradle file, require update/fix the main.ts");
  } else {
    console.error("impossible to find the includes folder, require update/fix the main.ts");
  }

  ////////////////////////////////////////////////////
  // 2) check if exist local.properties or create
  const ctxLocalPropertiesPath = path.resolve(ctxRootDir, "local.properties");
  if (!fs.existsSync(ctxLocalPropertiesPath)) {
    fs.writeFileSync(ctxLocalPropertiesPath, prepareDefaultProperties())
    console.log("local.properties created, required edition !!");
  }

  console.log("End main.ts > prepared project");
}

function prepareIncludesPath(includePath: string): string {
  let tmp = "";
  IncludesContext.forEach(v => {
    const vPath = (os.type() === "Windows_NT")
      ? path.resolve(includePath, v.toLowerCase()).replace(/\\/g, '/')
      : path.resolve(includePath, v.toLowerCase());
    tmp += (fs.existsSync(vPath) ? "" : "// ") + `String PATH_${v.toUpperCase()} = "${vPath}"` + os.EOL;
  });
  return tmp;
}

function prepareDefaultProperties(): string {
  let tmp = "";
  DefaultLocalProperties.forEach(v => {
    tmp += `${v}=default` + os.EOL;
  });
  return tmp;
}

function replaceContentCommonGradle(commonGradleFilePath: string, replacementContent: string): void {
  const regex = /\/\/\|--GENERATED--\|\/\/([^<>]+)\/\/\|-------------\|\/\//;
  let tmp = ""
    + "//|--GENERATED--|//" + os.EOL
    + replacementContent + os.EOL
    + "//|-------------|//";
  try {
    const data = fs.readFileSync(commonGradleFilePath, 'utf8');
    fs.writeFileSync(commonGradleFilePath, data.replace(regex, tmp));
  } catch (err) {
    console.error(err);
  }
}
