# TD Canonicalization CLI Tool

> **DISCLAIMER:** Work in progress. This tool is not finished yet.


Usage example:
```
node canon-td.js td.jsonld
```
As a result you will get `canonical-td.jsonld` file.

For convenience, you can also provide one more argument like this:
```
node canon-td.js td.jsonld 2
```
This will add an indentation of 2 spaces to the resulting file.

## What's already done?

- TD against schema validation
- Default values are added as described in https://w3c.github.io/wot-thing-description/#sec-default-values, except for the `AdditionalExpectedResponse` class
- JSON canonicalization
