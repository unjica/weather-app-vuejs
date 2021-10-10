import { createStore } from 'vuex'
import axios from 'axios'

const unixTimestampFormat = (unix_timestamp) => {
  let date = new Date(unix_timestamp * 1000)
  
  let hours = date.getHours()
  let minutes = "0" + date.getMinutes()

  return hours + ':' + minutes.substr(-2)
}

export default createStore({
  state: {
    loading: true,
    weatherWidgetData: null,
    weatherDetails: null,
    currentHour: new Date().getHours(),
    error: false,
    searchedCities: [],
    errorMsg: ''
  },
  mutations: {
    SET_CURRENT_LOCATION(state, currentLocation) {
      state.currentLocation = currentLocation
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_WEATHER_WIDGET_DATA(state, data) {
      state.weatherWidgetData = data
    },
    SET_WEATHER_DETAILS(state, data) {
      state.weatherDetails = data
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    SET_ERROR_MSG(state, errorMsg) {
      state.errorMsg = errorMsg
    },
    ADD_CITY(state, city) {
      !state.searchedCities.includes(city) && state.searchedCities.push(city)
      state.searchedCities.length > 5 && state.searchedCities.shift()
    }
  },
  actions: {
    getCityWeather: ({ commit }, city = 'Ljubljana') => {
      commit('SET_LOADING', true)
      axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.VUE_APP_OPENWEATHERMAP_API_KEY}`)
        .then(res => {
          const weatherWidgetData = {
            name: res.data.name,
            temp: (res.data.main.temp-273.15).toFixed(),
            tempMax: (res.data.main.temp_max-273.15).toFixed(),
            tempMin: (res.data.main.temp_min-273.15).toFixed(),
            feelsLike: (res.data.main.feels_like-273.15).toFixed(),
            weatherDescription: res.data.weather[0].main,
            weatherIcon: res.data.weather[0]?.icon
          }
          commit('SET_WEATHER_WIDGET_DATA', weatherWidgetData)
          
          const weatherDetails = {
            humidity: {
              title: 'Humidity',
              val: res.data.main.humidity + '%',
              icon: 'humidity.png'
            },
            sunset: {
              title: 'Sunset',
              val: unixTimestampFormat(res.data.sys.sunset),
              icon: 'sunset.png'
            },
            sunrise: {
              title: 'Sunrise',
              val: unixTimestampFormat(res.data.sys.sunrise),
              icon: 'sunrise.png'
            },
            wind: {
              title: 'Wind',
              val: (res.data.wind.speed* 3.6).toFixed(1) + 'km/h',
              icon: 'wind.png'
            }
          }
          commit('SET_WEATHER_DETAILS', weatherDetails)
          commit('ADD_CITY', city)
        })
        .catch(() => {
          if (city.length < 1) {
            commit('SET_ERROR_MSG', 'The city name cannot be empty')
          } else {
            commit('SET_ERROR_MSG', city + ' does not exist')
          }
          commit('SET_ERROR', true)
          setTimeout(() => {
            commit('SET_ERROR', false)
          }, 2000)
        })
        .finally(() => commit('SET_LOADING', false))
    }
  },
  getters: {
    loading: state => {
      return state.loading
    },
    weatherWidgetData: state => {
      return state.weatherWidgetData
    },
    weatherDetails: state => {
      return state.weatherDetails
    },
    searchedCities: state => {
      return state.searchedCities
    },
    errorMsg: state => {
      return state.errorMsg
    }
  },
  modules: {
  }
})
