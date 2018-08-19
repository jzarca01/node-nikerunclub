# Node-nikerunclub

An API for Nike Run Club

## Usage

```javascript
const Nike = require('node-nikerunclub');
const nike = new LookbookApi({
  ux_id: '',
  client_id: ''
});
```

### Log in

```javascript
nike.signIn(email, password);
```

### Get user Info

```javascript
nike.getProfile();
```

### Get personal records

```javascript
nike.getRecords();
```

### Get achievements by sport type

```javascript
nike.getAchievements((sportType = 'RUNNING'));
```
