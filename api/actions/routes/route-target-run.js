import { saveCalendarAction, updatePointsAction, updateDayAction, viewCalendarAction, viewPointsAction } from '../action-target-run'

export default [
  {
    method: 'post',
    path: '/run/save/calendar',
    action: saveCalendarAction
  },
  {
    method: 'post',
    path: '/run/update/points/:targetId',
    action: updatePointsAction
  },
  {
    method: 'post',
    path: '/run/update/day/:dayId',
    action: updateDayAction
  },
  {
    method: 'get',
    path: '/run/view/calendar/:targetId',
    action: viewCalendarAction
  },
  {
    method: 'get',
    path: '/run/view/points/:distanceId',
    action: viewPointsAction
  },
]