const semver = require ('semver');
const { engines } = require ('./package');
const version = engines.node;

if (!semver.satisfies(process.version, version)) {
    throw new Error(`The current Node version ${process.version} does not satisfy the required version ${version}. Run 'nvm use' to use use the correct Node version.`);
}
