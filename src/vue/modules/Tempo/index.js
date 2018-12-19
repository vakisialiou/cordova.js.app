import './style.scss'
import Vue from 'vue'
import template from './template.html'
import Ajax from '@lib/Ajax'
import '@vue/Grid/Row'
import '@vue/Grid/Cell'
import moment from 'moment'
import '@vue/Button'
import '@vue/Rate'
import '@vue/RunProcess'
import Timer from '@lib/Timer'

const timer = new Timer()

export default Vue.component('Tempo', {
  props: {
    day: {
      type: Object,
    },
  },
  data: function () {
    return {
      loading: false,
      activities: [],
      selectedActivity: null
    }
  },
  beforeMount: function () {
    if (!this.day) {
      return
    }
    this.loading = true
    Ajax.get(`run/view/activity/${this.day.id}`)
      .then((activities) => {
        this.loading = false
        this.activities = activities
      })
      .catch(() => {
        this.loading = false
      })
  },
  computed: {
    /**
     * Массив всех дистанций.
     *
     * @returns {Array}
     */
    distances: function () {
      return this.selectedActivity ? this.selectedActivity.distances : []
    },
    /**
     * Средний темп.
     *
     * @returns {string}
     */
    avgTempo: function () {
      let sum = 0
      for (const distance of this.distances) {
        sum += this.distanceTempoNumber(distance)
      }
      return Number(sum ? sum / this.distances.length : 0).toFixed(2)
    },
    /**
     * Самый быстрый темп.
     *
     * @returns {string}
     */
    upperTempo: function () {
      let upperTempo = + Infinity
      for (const distance of this.distances) {
        const tempo = this.distanceTempoNumber(distance)
        if (tempo < upperTempo) {
          upperTempo = tempo
        }
      }
      return (upperTempo === + Infinity ? 0 : upperTempo).toFixed(2)
    },
    /**
     * Самый медленый темп.
     *
     * @returns {string}
     */
    lowerTempo: function () {
      let lowerTempo = - Infinity
      for (const distance of this.distances) {
        const tempo = this.distanceTempoNumber(distance)
        if (tempo > lowerTempo) {
          lowerTempo = tempo
        }
      }
      return (lowerTempo === - Infinity ? 0 : lowerTempo).toFixed(2)
    },

    /**
     * Максимальный темп.
     *
     * @returns {number}
     */
    maxTempo: function () {
      const tempo = Number(this.upperTempo)
      return tempo + (tempo / 100 * 10)
    }
  },
  methods: {
    /**
     * Фарматирование даты.
     *
     * @param {Date|string} date
     * @returns {string}
     */
    formatDate(date) {
      return moment(date).locale('ru').format('DD MMM HH:mm')
    },
    /**
     * Название активности.
     *
     * @param activity
     * @returns {string}
     */
    activityName: function (activity) {
      return `${this.formatDate(activity.dateTimeStart)} - ${this.formatDate(activity.dateTimeStop)}`
    },
    /**
     * Генерация текста если нет активностей.
     *
     * @returns {string}
     */
    activityEmpty: function () {
      return moment(this.day.date).locale('ru').format('DD MMMM')
    },
    /**
     * Получение темпа из дистанции.
     *
     * @param {Object} distance
     * @returns {number}
     */
    distanceTempoNumber(distance) {
      if (!distance.prevUKey) {
        return timer.setTime((distance.time / distance.pathLength) * 1000).toNumberMinutes()
      }
      const time = (distance.time / distance.pathLength) * 1000
      return timer.setTime(time).toNumberMinutes()
    },
    /**
     * Получение темпа из дистанции. Возвращает форматированую строку.
     *
     * @param {Object} distance
     * @returns {string}
     */
    distanceTempoString(distance) {
      const splitValue = this.distanceTempoNumber(distance).toFixed(2).split('.')
      return `${splitValue[0]}'${splitValue[1]}'`
    },
    /**
     * Номер дистанции.
     *
     * @param {Object} distance
     * @returns {string}
     */
    distanceNumber(distance) {
      let len = 'км'
      if (distance.pathLength < 1000) {
        len = `- ${Number(distance.pathLength).toFixed(0)}м`
      }
      return `${distance.number + 1} ${len}`
    },
    /**
     * Время на дистанции.
     *
     * @param {Object} distance
     * @returns {string}
     */
    distanceTime(distance) {
      return timer.setTime(distance.elapsedTime).toStringHours()
    },
    /**
     * Длина всего пути активности.
     *
     * @param {Object} activity
     * @returns {string}
     */
    activityPathLength(activity) {
      let len = 0
      if (activity) {
        for (const distance of activity.distances) {
          len += distance.pathLength
        }
      }
      return (len / 1000).toFixed(3)
    },
    /**
     * Открыть подробную информацию об активности.
     *
     * @param activity
     * @returns {void}
     */
    openActivity(activity) {
      this.selectedActivity = activity
    },
    /**
     * Закрыть подробную информацию об активности.
     *
     * @returns {void}
     */
    closeActivity() {
      this.selectedActivity = null
    }
  },
  template: template
})