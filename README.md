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

/* Since it relies on Puppeteer, you need a GUI environment for now */
```

### Get access token from refresh token

```javascript
nike.getAccessTokenFromRefreshToken(refreshToken);
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

### Get history of all activities

```javascript
nike.getActivities(time = new Date().valueOf(), limit = 25, includeDeleted = true)
See example.json for result
```

### Get details of activity by id

```javascript
nike.getActivity(activityId, metrics = 'ALL')
```

### Get your aggregated data

```javascript
nike.getAggregatedData();
```

### Get your aggregated data by year

```javascript
nike.getAggregatedDataByYear((year = '2018'));
```
