const axios = require("axios");
const qs = require("qs");
const dayjs = require("dayjs");

const { loginWithPuppeteer } = require("./puppeteer");

class Nikerunclub {
  constructor(config) {
    this.config = config;
    this.userId = null;
    this.request = axios.create({
      baseURL: "https://api.nike.com",
      headers: {
        "User-Agent": "NikeRunClub/5.17.0",
      },
    });
  }

  setAccessToken(accessToken) {
    this.request.defaults.headers.common["Authorization"] = "";
    delete this.request.defaults.headers.common["Authorization"];

    this.request.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${accessToken}`;
  }

  setUserId(userId) {
    this.userId = userId;
  }

  async signIn(username, password) {
    try {
      let response = await loginWithPuppeteer(username, password, this.config);
      this.setAccessToken(response.access_token);
      this.setUserId(response.user_id);
      return response;
    } catch (error) {
      console.log("error", error);
    }
  }

  async getAccessTokenFromRefreshToken(refreshToken) {
    try {
      let response = await this.request({
        method: "POST",
        url: "/idn/shim/oauth/2.0/token",
        data: {
          grant_type: "refresh_token",
          ux_id: this.config.ux_id,
          client_id: this.config.client_id,
          refresh_token: refreshToken,
        },
        headers: {
          "Content-Type": "application/json",
          "X-Nike-TokenAuthStatic": "d682c79eae01b45b55e357f95168b658",
        },
        responseType: "json",
      });
      this.setAccessToken(response.data.access_token);
      this.setUserId(response.data.user_id);
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async getProfile() {
    try {
      let response = await this.request({
        method: "GET",
        url: `/user/sharedprofile`,
        responseType: "json",
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async getAggregatedData() {
    try {
      let response = await this.request({
        method: "GET",
        url: `/plus/v3/historicalaggregates/aggregates`,
        params: {
          activity_type: ["run", "jogging"],
          span: "lifetime",
        },
        paramsSerializer: function (params) {
          return qs.stringify(params, {
            arrayFormat: "brackets",
          });
        },
        responseType: "json",
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async getAggregatedDataByYear(year = "2018") {
    try {
      let response = await this.request({
        method: "GET",
        url: `/plus/v3/historicalaggregates/aggregates/batch/year/${year}`,
        params: {
          activity_type: ["run", "jogging"],
        },
        paramsSerializer: function (params) {
          return qs.stringify(params, {
            arrayFormat: "brackets",
          });
        },
        responseType: "json",
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async getRecords() {
    try {
      let response = await this.request({
        method: "GET",
        url: `/plus/v3/personalbests/me/records`,
        responseType: "json",
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async getAchievements(sportType = "RUNNING") {
    try {
      let response = await this.request({
        method: "GET",
        url: `/plus/v3/achievements/${this.userId}/${sportType}`,
        responseType: "json",
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async getShoesInfos(includeDeleted = true) {
    try {
      let response = await this.request({
        method: "GET",
        url: `/plus/v3/shoeadmin/me/shoes`,
        params: {
          aggregate_field: "distance_km",
          include_deleted: includeDeleted,
        },
        responseType: "json",
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async getActivities(
    time = new Date().valueOf(),
    limit = 25,
    includeDeleted = true
  ) {
    try {
      let response = await this.request({
        method: "GET",
        url: `/sport/v3/me/activities/before_time/${time}`,
        params: {
          include_deleted: includeDeleted,
          types: "run,jogging",
          metrics: "ALL",
          limit: limit,
        },
        responseType: "json",
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  async getActivityById(activityId, metrics = "ALL") {
    try {
      let response = await this.request({
        method: "GET",
        url: `/sport/v3/me/activity/${activityId}`,
        params: {
          metrics: metrics,
        },
        responseType: "json",
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
    }
  }

  changeKeyName(item, newKeyName) {
    return Object.assign(item, { [newKeyName]: item.value });
  }

  async convertToGPX(activityID) {
    try {
      const { metrics } = await this.getActivityById(
        activityID,
        "latitude,longitude"
      );
      const latitudeValues = metrics[0].values.map((item) =>
        this.changeKeyName(item, "latitude")
      );
      const longitudeValues = metrics[1].values.map((item) =>
        this.changeKeyName(item, "longitude")
      );
      const allValues = latitudeValues.map((item, i) =>
        Object.assign({}, item, longitudeValues[i])
      );

      const gpxFile = `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.0"><name>Run ${dayjs(
        parseInt(start_epoch_ms)
      ).toISOString()}</name><wpt lat="${allValues[0].latitude}" lon="${
        allValues[0].longitude
      }"><ele>0</ele>
		<name>Generated with node-nikerunclub</name></wpt><trk><name>Run ${dayjs(
      parseInt(start_epoch_ms)
    ).toISOString()}</name><number>1</number>
  <trkseg>${allValues.map(({ start_epoch_ms, latitude, longitude }, index) => {
    return `<trkpt lat="${latitude}" lon="${longitude}"><ele>${
      index + 1
    }</ele><time>${dayjs(
      parseInt(start_epoch_ms)
    ).toISOString()}</time></trkpt>`;
  })}
  </trkseg>
  </trk></gpx>`;
      return;
      gpxFile
        .replace(/\n/g, "")
        .replace(/\t/g, "")
        .replace(/,/g, "");
    } catch (err) {
      console.log("error with convertToGPX", err);
    }
  }
}

module.exports = Nikerunclub;
