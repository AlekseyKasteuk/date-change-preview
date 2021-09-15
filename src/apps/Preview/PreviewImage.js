import { memo, useEffect, useState } from "react";
import { CHANGE_TYPES } from "./constants"

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const getDate = (date, isEnd) => {
  const d = new Date(date)
  if (isEnd) {
    d.setDate(d.getDate() + 1)
  }
  return d
}
const getDiffInDays = (start, end, { gapEndDate, gapCount } = {}) => {
  const utc1 = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utc2 = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  let result = Math.floor((utc2 - utc1) / MS_PER_DAY);
  if (gapCount && gapEndDate && end.getTime() >= gapEndDate.getTime()) {
    result -= gapCount
  }
  return result
}

const getPositions = (dates) => {
  const { planStart, planEnd, contentStart, contentEnd, newPlanStart, newPlanEnd } = dates
  const min = getDate(planStart > newPlanStart ? newPlanStart : planStart)
  const max = getDate(planEnd > newPlanEnd ? planEnd : newPlanEnd, true)

  const [gapStartDate, gapEndDate] = (
    planStart > newPlanEnd
      ? [getDate(newPlanEnd, true), getDate(planStart)]
      : planEnd < newPlanStart
        ? [getDate(planEnd, true), getDate(newPlanStart)]
        : []
  )

  const gapDuration = gapStartDate && gapEndDate ? getDiffInDays(gapStartDate, gapEndDate) : 0
  let gapCount = 0
  let fullWidth = getDiffInDays(min, max)
  if ((gapDuration / fullWidth) > 0.01) {
    gapCount = gapDuration - Math.ceil(fullWidth * 0.01)
  }
  fullWidth = fullWidth - gapCount

  return {
    planStart: getDiffInDays(min, getDate(planStart), { gapEndDate, gapCount }) / fullWidth,
    planEnd: getDiffInDays(min, getDate(planEnd, true), { gapEndDate, gapCount }) / fullWidth,
    contentStart: getDiffInDays(min, getDate(contentStart), { gapEndDate, gapCount }) / fullWidth,
    contentEnd: getDiffInDays(min, getDate(contentEnd, true), { gapEndDate, gapCount }) / fullWidth,
    newPlanStart: getDiffInDays(min, getDate(newPlanStart), { gapEndDate, gapCount }) / fullWidth,
    newPlanEnd: getDiffInDays(min, getDate(newPlanEnd, true), { gapEndDate, gapCount }) / fullWidth,
  }
}

const NewPlan = ({ newPlanStart, newPlanEnd }) => (
  <div
    style={{
      position: 'absolute',
      left: `${newPlanStart * 100}%`,
      right: `${(1 - newPlanEnd) * 100}%`,
      top: 0,
      height: 300,
      backgroundColor: 'rgba(16, 130, 16, 0.7)',
      color: 'white',
      transition: 'left .3s, right .3s',
    }}
  >
    <span>New Plan</span>
  </div>
)

const Plan = ({ planStart, planEnd, planOpacity = 1 }) => (
  <div
    style={{
      position: 'absolute',
      left: `${planStart * 100}%`,
      right: `${(1 - planEnd) * 100}%`,
      top: 30,
      height: 240,
      backgroundColor: 'rgba(210, 10, 0, 0.7)',
      color: 'white',
      transition: 'left .3s, right .3s, opacity .3s',
      opacity: planOpacity,
    }}
  >
    <span>Plan</span>
  </div>
)

const Content = ({ contentStart, contentEnd }) => (
  <div
    style={{
      position: 'absolute',
      left: `${contentStart * 100}%`,
      right: `${(1 - contentEnd) * 100}%`,
      top: 60,
      height: 180,
      backgroundColor: 'rgba(0, 0, 255, 0.7)',
      color: 'white',
      transition: 'left .3s, right .3s',
    }}
  >
    <span>Content</span>
  </div>
)

const SHIFT_POSITIONS_HANDLERS = {
  [CHANGE_TYPES.shiftStartDate]: (positions) => {
    const { planStart, planEnd, newPlanStart } = positions
    const newPlanDiff = Math.min(0, 1 - (newPlanStart + planEnd - planStart))
    const planDiff = newPlanStart + newPlanDiff - planStart
    return [newPlanDiff, planDiff]
  },
  [CHANGE_TYPES.shiftEndDate]: (positions) => {
    const { planStart, planEnd, newPlanEnd } = positions
    const newPlanDiff = Math.max(0, planEnd - planStart - newPlanEnd)
    const planDiff = newPlanEnd + newPlanDiff - planEnd
    return [newPlanDiff, planDiff]
  },
  [CHANGE_TYPES.shiftContentToStart]: (positions) => {
    const { contentStart, contentEnd, newPlanStart } = positions
    const newPlanDiff = Math.min(0, 1 - (newPlanStart + contentEnd - contentStart))
    const planDiff = newPlanStart + newPlanDiff - contentStart
    return [newPlanDiff, planDiff]
  },
  [CHANGE_TYPES.shiftContentToEnd]: (positions) => {
    const { contentStart, contentEnd, newPlanEnd } = positions
    const newPlanDiff = Math.max(0, contentEnd - contentStart - newPlanEnd)
    const planDiff = newPlanEnd + newPlanDiff - contentEnd
    return [newPlanDiff, planDiff]
  },
}

const getShiftedPositions = (positions, option) => {
  const [newPlanDiff, planDiff, contentDiff = planDiff] = SHIFT_POSITIONS_HANDLERS[option]?.(positions) ?? [0, 0]
  if (newPlanDiff === 0 && planDiff === 0) {
    return positions
  }
  const { planStart, planEnd, contentStart, contentEnd, newPlanStart, newPlanEnd } = positions
  return {
    planStart: planStart + planDiff,
    planEnd: planEnd + planDiff,
    contentStart: contentStart + contentDiff,
    contentEnd: contentEnd + contentDiff,
    newPlanStart: newPlanStart + newPlanDiff,
    newPlanEnd: newPlanEnd + newPlanDiff,
  }
}

const PreviewImage = memo(({ playCount, dates, option, replayCount = 0 }) => {
  const [planOpacity, setPlanOpacity] = useState(1)
  const [positions, setPositions] = useState()
  useEffect(() => {
    let timeout = null
    const initialPositions = getPositions(dates)
    const shiftedPositions = getShiftedPositions(initialPositions, option)
    let replayedTimes = 0
    const start = () => {
      setPlanOpacity(1)
      setPositions(initialPositions)
      const next = initialPositions === shiftedPositions ? hidePlan : shift
      timeout = setTimeout(next, 1000)
    }
    const shift = () => {
      setPositions(shiftedPositions)
      timeout = setTimeout(hidePlan, 500)
    }
    const hidePlan = () => {
      setPlanOpacity(0)
      if (replayedTimes >= replayCount) {
        timeout = null
      } else {
        replayedTimes++
        timeout = setTimeout(start, 1000)
      }
    }
    start()
    return () => {
      timeout !== null && clearTimeout(timeout)
    }
  }, [playCount, replayCount, dates, option, setPlanOpacity, setPositions])
  if (!positions) {
    return null
  }
  return (
    <>
      <NewPlan {...positions} />
      <Plan {...positions} planOpacity={planOpacity} />
      <Content {...positions} />
    </>
  )
})

const PreviewImageWrapper = ({ dates, option }) => {
  const [playCount, setPlayCount] = useState(0)
  return (
    <section style={{ flexGrow: 1, paddingRight: 10, paddingLeft: 10 }}>
      <h3>Image</h3>
      <div
        onClick={() => setPlayCount(playCount => (playCount + 1) % 100)}
        style={{ paddingRight: 10, height: 300, position: 'relative', maxWidth: 600, border: '1px solid black', overflow: 'hidden' }}
      >
        <PreviewImage playCount={playCount} dates={dates} option={option} />
      </div>
    </section>
  )
}

export default memo(PreviewImageWrapper)