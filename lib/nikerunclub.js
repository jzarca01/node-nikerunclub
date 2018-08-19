const axios = require("axios");

class Nikerunclub {
    constructor(config) {
        this.config = config;
        this.userId = null;
        this.request = axios.create({
            baseURL: 'https://api.nike.com',
            headers: {
                "User-Agent": "NikeRunClub/5.17.0"
            }
        });
    }

    setAccessToken(accessToken) {
        this.request.defaults.headers.common['Authorization'] = '';
        delete this.request.defaults.headers.common['Authorization'];

        this.request.defaults.headers.common[
            'Authorization'
        ] = `Bearer ${accessToken}`;
    }

    setUserId(userId) {
        this.userId = userId;
    }

    async signIn(username, password) {
        try {
            let response = await this.request({
                method: 'POST',
                url: '/idn/shim/oauth/2.0/token',
                data: {
                    grant_type: "password",
                    ux_id: this.config.ux_id,
                    client_id: this.config.client_id,
                    username: username,
                    password: password
                },
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: 'json'
            });
            this.setAccessToken(response.data.access_token);
            this.setUserId(response.data.user_id);
            return response.data;
        } catch (error) {
            console.log('error', error);
        }
    }

    async getProfile() {
        try {
            let response = await this.request({
                method: 'GET',
                url: `/user/sharedprofile`,
                responseType: 'json'
            });
            return response.data;
        } catch (error) {
            console.log('error', error);
        }
    }

    async getRecords() {
        try {
            let response = await this.request({
                method: 'GET',
                url: `/plus/v3/personalbests/me/records`,
                responseType: 'json'
            });
            return response.data;
        } catch (error) {
            console.log('error', error);
        }
    }

    async getAchievements(sportType = 'RUNNING') {
        try {
            let response = await this.request({
                method: 'GET',
                url: `/plus/v3/achievements/${this.userId}/${sportType}`,
                responseType: 'json'
            });
            return response.data;
        } catch (error) {
            console.log('error', error);
        }
    }
}

module.exports = Nikerunclub;