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
    searchHistory: [],
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
    ADD_CITY_TO_SUCCESSFUL_SEARCHES(state, city) {
      !state.searchHistory.includes(city) && state.searchHistory.push(city)

      // not grater than five
      state.searchHistory.length > 5 && state.searchHistory.shift()
    }
  },
  actions: {
    getCityWeather: ({ commit, dispatch }, city = 'Ljubljana') => {
      commit('SET_LOADING', true)
      axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.VUE_APP_OPENWEATHERMAP_API_KEY}`)
        .then(res => dispatch('setCurrentWeatherData', res.data))
        .catch(() => {
          dispatch('setErrorMessage', city)
          dispatch('displayErrorInPopup')
        })
        .finally(() => commit('SET_LOADING', false))
    },
    setErrorMessage: ({ commit }, input) => {
      commit('SET_ERROR_MSG', input ? `${input} does not exist` : 'The city name cannot be empty')
    },
    displayErrorInPopup: ({ commit }) => {
      commit('SET_ERROR', true)
      setTimeout(() => {
        commit('SET_ERROR', false)
      }, 2000)
    },
    setCurrentWeatherData: ({ commit }, data) => {
      commit('SET_WEATHER_WIDGET_DATA', {
        name: data.name,
        temp: (data.main.temp-273.15).toFixed(),
        tempMax: (data.main.temp_max-273.15).toFixed(),
        tempMin: (data.main.temp_min-273.15).toFixed(),
        feelsLike: (data.main.feels_like-273.15).toFixed(),
        weatherDescription: data.weather[0].main,
        weatherIcon: data.weather[0]?.icon
      })
      
      commit('SET_WEATHER_DETAILS', {
        humidity: {
          title: 'Humidity',
          val: data.main.humidity + '%',
          icon: 'humidity.png'
        },
        sunset: {
          title: 'Sunset',
          val: unixTimestampFormat(data.sys.sunset),
          icon: 'sunset.png'
        },
        sunrise: {
          title: 'Sunrise',
          val: unixTimestampFormat(data.sys.sunrise),
          icon: 'sunrise.png'
        },
        wind: {
          title: 'Wind',
          val: (data.wind.speed* 3.6).toFixed(1) + 'km/h',
          icon: 'wind.png'
        }
      })
      
      commit('ADD_CITY_TO_SUCCESSFUL_SEARCHES', data.name)
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
    searchHistory: state => {
      return state.searchHistory
    },
    errorMsg: state => {
      return state.errorMsg
    }
  },
  modules: {
  }
})
