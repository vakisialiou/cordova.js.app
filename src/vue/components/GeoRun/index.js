import './style.scss'
import Vue from 'vue'
import Geo from './lib/Geo'
import EmulatorGeo from './lib/EmulatorGeo'
import template from './template.vue'

import '@vue/RunProcess'
import '@vue/Timer'
import '@vue/Speed'

const debug = false

export default Vue.component('GeoRun', {
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
  },
  data: function () {
    return {
      geoErrorMessage: null,
      startDate: '2018-11-11', // Дата с которой начинается цель тренировки в календаре
      geo: debug ? new EmulatorGeo() : new Geo(),
      day: null, // Текущий день календаря. (содержит информацию о текущей цели)
    }
  },
  methods: {
    setCurrentDay: function (day) {
      this.day = day
    },
    finishDistance: function () {
      let distance
      if (this.day) {
        distance = this.day.getOption('distance')
      }
      return (distance || 0) * 1000
    },
    path: function () {
      return this.geo.pathLength
    },
    speed: function () {
      return this.geo.speed
    },
    tempo: function () {
      return this.geo.tempo
    },
    start: function (actionStartTimer) {
      this.geo.start(actionStartTimer, (error) => {
        this.geoErrorMessage = error.message
        this.geo.stop()
      })
    },
    stop: function (actionStopTimer) {
      actionStopTimer()
      this.geo.stop()
    },
    end: function (actionEndTimer) {
      actionEndTimer()
      this.geo.end()
    },
  },
  template: template
})