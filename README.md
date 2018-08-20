# Node-nikerunclub

An API for Nike Run Club

## Usage

```javascript
const Nike = require('node-nikerunclub');
const nike = new Nike({
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

### Get shoes infos

```javascript
nike.getShoesInfos((includeDeleted = true));
```

### Get your activity history

```javascript
nike.getActivities(time = new Date().valueOf(), limit = 25, includeDeleted = true)
See example.json for result
```

### Get your aggregated data

```javascript
nike.getAggregatedData();
```

### Get your aggregated data by year

```javascript
nike.getAggregatedDataByYear((year = '2018'));
```
