import Vue from 'vue'
import Vuex from 'vuex'
import {
  ADD_AVAILABLE_TIMEZONE, ADD_SHOWN_TIMEZONE,
  REMOVE_SHOWN_TIMEZONE, CLEAR_SHOWN_TIMEZONES
} from './mutations'

Vue.use(Vuex)

const store = new Vuex.Store({
  strict: true,
  state: {
    availableTimezones: new Map(),
    shownTimezones: []
  },
  mutations: {
    [ADD_AVAILABLE_TIMEZONE] (state, payload) {
      state.availableTimezones.set(payload.timezoneKey, payload.timezone)
    },
    [ADD_SHOWN_TIMEZONE] (state, payload) {
      state.shownTimezones.push(payload.timezoneKey)
    },
    [REMOVE_SHOWN_TIMEZONE] (state, payload) {
      state.shownTimezones.splice(state.shownTimezones.indexOf(payload.timezoneKey), 1)
    },
    [CLEAR_SHOWN_TIMEZONES] (state) {
      state.shownTimezones = []
    }
  }
})
export default store
