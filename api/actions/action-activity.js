import objectPath from 'object-path'
import { TYPE_GPS_LOCATION, TYPE_USER_FORM } from './../repositories/activity'
import { saveActivity, getActivitiesByDate, removeActivityById } from './../repositories/activity'
import { saveDistance, getDistances, removeDistancesByActivityId } from './../repositories/distance'
import { savePoints, getPoints, removePointsByActivityId } from './../repositories/point'
import { saveKeyAndGetDeviceId } from './../repositories/device'

/**
 * Update user activity.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {MySQL} db
 * @returns {Promise<void>}
 */
export async function saveActivityAction({ req, res, db }) {
  if (!req.deviceKey) {
    return res.status(403).send('Device key is required.')
  }
  // сохраняем активность пользователя.
  const dateTimeStart = objectPath.get(req, ['body', 'activity', 'dateTimeStart'], null)
  const dateTimeStop = objectPath.get(req, ['body', 'activity', 'dateTimeStop'], null)
  const deviceId = await saveKeyAndGetDeviceId(db, req.deviceKey)
  const activityId = await saveActivity(db, deviceId, {
    dateTimeStart,
    dateTimeStop,
    type: TYPE_GPS_LOCATION
  })

  // сохраняем дистанцию (отрезки по 1-км).
  const distances = objectPath.get(req, [ 'body', 'activity', 'distances' ], [])
  for (const distance of distances) {
    const points = objectPath.get(distance, 'points', [])

    const distanceId = await saveDistance(db, activityId, {
      uKey: distance.uKey,
      number: distance.number,
      avgHRM: distance.avgHRM,
      prevUKey: distance.prevUKey,
      avgSpeed: distance.avgSpeed,
      pathLength: distance.pathLength,
      elapsedTime: distance.elapsedTime
    })
    // сохраняем навигационные точки на отрезке.
    await savePoints(db, distanceId, points)
  }
  return res.send({status: true})
}

/**
 * Update user activity.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {MySQL} db
 * @returns {Promise<void>}
 */
export async function saveCustomActivityAction({ req, res, db }) {
  if (!req.deviceKey) {
    return res.status(403).send('Device key is required.')
  }

  // сохраняем активность.
  const deviceId = await saveKeyAndGetDeviceId(db, req.deviceKey)
  const activityId = await saveActivity(db, deviceId, {
    dateTimeStart: req.body.dateTimeStart,
    dateTimeStop: req.body.dateTimeStop,
    type: TYPE_USER_FORM
  })

  // сохраняем дистанцию.
  await saveDistance(db, activityId, {
    pathLength: Number(req.body.pathLength) * 1000,// километры в метры
    elapsedTime: (Math.floor(req.body.elapsedTime) * 60) + Math.round((req.body.elapsedTime % 1).toFixed(2) * 100), // минуты в секунды
  })

  return res.send({status: true})
}

/**
 *
 * @param {Object} req
 * @param {Object} res
 * @param {MySQL} db
 * @returns {Promise<void>}
 */
export async function viewActivitiesAction({ req, res, db }) {
  if (!req.deviceKey) {
    return res.status(403).send('Device key is required.')
  }
  const timestamp = objectPath.get(req, ['params', 'timestamp'], 0)
  const date = new Date()
  date.setTime(timestamp)
  const deviceId = await saveKeyAndGetDeviceId(db, req.deviceKey)
  const activities = await getActivitiesByDate(db, deviceId, date)
  for (const activity of activities) {
    const distances = await getDistances(db, activity.id)
    for (const distance of distances) {
      distance['points'] = await getPoints(db, distance.id)
    }
    activity['distances'] = distances
  }
  return res.send(activities)
}

/**
 *
 * @param {Object} req
 * @param {Object} res
 * @param {MySQL} db
 * @returns {Promise<void>}
 */
export async function removeActivitiesAction({ req, res, db }) {
  if (!req.deviceKey) {
    return res.status(403).send('Device key is required.')
  }

  let status = true
  const activityId = objectPath.get(req, ['body', 'activityId'], null)
  try {
    await db.beginTransaction()
    await removePointsByActivityId(db, activityId)
    await removeDistancesByActivityId(db, activityId)
    await removeActivityById(db, activityId)
    await db.commit()
  } catch (e) {
    status = false
    await db.rollback()
  }
  return res.send({ status })
}