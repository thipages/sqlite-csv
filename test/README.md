Launch `node --test` at the root of the project

In each test suite,  database names needs to be different in order not to interfer with each other. `dbPath` function (in `misc.js`) uses the test filename (without extension) for the name of the test transient database. 
