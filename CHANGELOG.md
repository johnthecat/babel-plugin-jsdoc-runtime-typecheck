# Changelog

## 1.1.0

### Features
* Added strict mode - now plugin throw compilation exception when it can find error by static analyze.
    * Flag - `useStrict: true` (default - false), add it to config.
    * Throw exception, when arguments/returns aren't equal to jsDoc.
    
### Bugfix
* Fixed a lot of cases of wrong parsing of arguments and return.
* Fixed bug, when assertion doesn't adds to empty return.

### Other
* Global refactoring - better code style, easy to read.
* Added a lot of tests, increased stability of library.
