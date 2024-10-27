// index.js
function greet(name) {
  return `Hello, ${name}!`;
}

module.exports = greet;

/*
here run : npm link
in other project run: npm link bathtiles.js

publishing:
 - npm login
 - npm publish

when updating increment the version in package.json then
 - npm publish

*/