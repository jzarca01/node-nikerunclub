const axios = require("axios");
const qs = require("qs");
const dayjs = require("dayjs");
const { create, fragment } = require("xmlbuilder2");

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

      const trkpt = fragment();
      allValues.map(({ start_epoch_ms, latitude, longitude }, index) => {
        return trkpt
          .ele("trkpt", { lat: latitude, lon: longitude })
            .ele("ele")
              .txt(index + 1)
            .up()
            .ele("time")
              .txt(dayjs(parseInt(start_epoch_ms)).toISOString())
            .up()
          .up();
      });

      const root = create({ version: "1.0", encoding: "UTF-8" })
        .ele("gpx", { version: "1.0" })
          .ele("name")
            .txt(
              `Run ${dayjs(parseInt(allValues[0].start_epoch_ms)).toISOString()}`
            )
          .up()
        .ele("wpt", { lat: allValues[0].latitude, lon: allValues[0].longitude })
          .ele("ele")
            .txt(0)
          .up()
          .ele("name")
            .txt("Generated with node-nikerunclub")
          .up()
        .up()
        .ele("trk")
          .ele("name")
            .txt(
              `Run ${dayjs(parseInt(allValues[0].start_epoch_ms)).toISOString()}`
            )
          .up()
          .ele("number")
            .txt(1)
          .up()
          .import(trkpt)
        .up();

      

      root.end({ pretty: true });
      return root.toString();
    } catch (err) {
      console.log("error with convertToGPX", err);
    }
  }
}

module.exports = Nikerunclub;
