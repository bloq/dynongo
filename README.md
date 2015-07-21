# dynongo

> MongoDB like syntax for DynamoDB

## Installation

```bash
npm install --save dynongo
```

## Usage

### Connect

First of all, we have to connect with the database.

```javascript
var db = require('dynongo');

// Connect with dynamodb in the us-west-1 region
db.connect({
    region: 'us-west-1'
});
```

Please use IAM roles or environment variables to connect with the dynamodb database. This way, no keys have to
be embedded in your code.

If you still want to use embedded keys, you can by providing an `accessKeyId` and `secretAccessKey` property.

```javascript
db.connect({
    accessKeyId: 'accessKeyId',
    secretAccessKey: 'secretAccessKey',
    region: 'us-west-1'
});
```

#### DynamoDB Local

It is possible to connect to a local DynamoDB database by setting the `local` property to `true`. It will use port
8000 by default, but if you want to change that port, you can provide a `localPort` property.

```javascript
db.connect({
    region: 'us-west-1',
    local: true,
    localPort: 4444                 // 8000 if not provided
});
```

#### Prefixing tables

It's a good thing to prefix the tables with the name of the project and maybe the environment like production or staging. Instead
of always repeating those names every time you want to query the table, you can provide the prefix and prefix delimiter once. The
default delimiter is the `.`.

```javascript
db.connect({
    region: 'us-west-1',
    prefix: 'myapp-development',
    prefixDelimiter: '-'            // . if not provided
});
```

### Tables

In order for the developer to execute methods on a table, you have to retrieve the table object from the database.

```javascript
var Employee = db.table('Employee');
```

The table name will be automatically prefixed by the `prefix` provided in the connection object.

## Contributors

- Sam Verschueren [<sam.verschueren@gmail.com>]

## License

MIT © Sam Verschueren
