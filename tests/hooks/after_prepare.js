/*
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

'use strict';

const fs = require('node:fs');
const path = require('node:path');

function copyDir (srcDir, destDir) {
    if (!fs.existsSync(srcDir)) {
        return;
    }

    fs.mkdirSync(destDir, { recursive: true });
    fs.cpSync(srcDir, destDir, { recursive: true, force: true });
}

function copyFile (srcPath, destPath) {
    if (!fs.existsSync(srcPath)) {
        return;
    }

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
}

function patchBrowserRunScript (projectRoot) {
    const runScriptPath = path.join(projectRoot, 'platforms', 'browser', 'cordova', 'lib', 'run.js');
    if (!fs.existsSync(runScriptPath)) {
        return;
    }

    const script = fs.readFileSync(runScriptPath, 'utf8');
    if (script.includes('/__cordova_paramedic_exit')) {
        return;
    }

    const needle = 'const server = cordovaServe();';
    if (!script.includes(needle)) {
        return;
    }

    const patched = script.replace(
        needle,
        `${needle}\n\n    // Added by cordova-plugin-inappbrowser-tests: allow cordova-paramedic to shut down\n    // the long-running "cordova run browser" process after Jasmine completes.\n    if (server && server.app) {\n        server.app.get('/__cordova_paramedic_exit', (req, res) => {\n            res.end('ok');\n            try {\n                if (server.server) {\n                    server.server.close(() => process.exit(0));\n                    return;\n                }\n            } catch (e) {}\n            process.exit(0);\n        });\n    }`
    );

    fs.writeFileSync(runScriptPath, patched, 'utf8');
}

module.exports = function (context) {
    const opts = context && context.opts ? context.opts : {};
    const platforms = [
        ...(Array.isArray(opts.platforms) ? opts.platforms : []),
        ...(opts.cordova && Array.isArray(opts.cordova.platforms) ? opts.cordova.platforms : [])
    ];

    const projectRoot = opts.projectRoot;
    if (!projectRoot) {
        return;
    }

    const browserPlatformRoot = path.join(projectRoot, 'platforms', 'browser');
    if (!platforms.includes('browser') && !fs.existsSync(browserPlatformRoot)) {
        return;
    }

    const browserWww = path.join(projectRoot, 'platforms', 'browser', 'www');
    const cdvtestsDir = path.join(browserWww, 'cdvtests');

    const testFrameworkAssetsDir = path.join(projectRoot, 'plugins', 'cordova-plugin-test-framework', 'www', 'assets');
    const iabResourcesDir = path.join(projectRoot, 'plugins', 'cordova-plugin-inappbrowser-tests', 'resources');
    const medicJsonPath = path.join(projectRoot, 'www', 'medic.json');

    try {
        copyDir(testFrameworkAssetsDir, cdvtestsDir);
        copyDir(iabResourcesDir, path.join(cdvtestsDir, 'iab-resources'));
        copyFile(medicJsonPath, path.join(browserWww, 'medic.json'));
        patchBrowserRunScript(projectRoot);
    } catch (err) {
        // Don't fail the whole build if this workaround can't run (e.g. paths don't exist).
        console.log(`[cordova-plugin-inappbrowser-tests] after_prepare hook failed: ${err.message}`);
    }
};
