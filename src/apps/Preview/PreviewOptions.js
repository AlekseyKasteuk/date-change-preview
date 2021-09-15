import { useCallback } from "react"
import { CHANGE_TYPES } from "./constants"

const OPTIONS = [
  {
    value: CHANGE_TYPES.leave,
    getLabel: ({ planStart, planEnd, newPlanStart, newPlanEnd }) => newPlanStart > planStart || newPlanEnd < planEnd ? 'Trim' : 'Leave',
  },
  {
    value: CHANGE_TYPES.shiftStartDate,
    getLabel: () => 'Shift Start Date',
  },
  {
    value: CHANGE_TYPES.shiftEndDate,
    getLabel: () => 'Shift End Date',
  },
  {
    value: CHANGE_TYPES.shiftContentToStart,
    getLabel: () => 'Shift Content To Start Date',
  },
  {
    value: CHANGE_TYPES.shiftContentToEnd,
    getLabel: () => 'Shift Content To End Date',
  },
]

const Option = ({ value, label, selected, setSelected }) => {
  const id = `preview-option-${value}`
  const onChange = useCallback(() => value !== selected && setSelected(value), [value, selected, setSelected])
  return (
    <div>
      <input
        id={id}
        name={value}
        type="radio"
        checked={value === selected}
        onChange={onChange}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  )
}

const PreviewOptions = ({ dates, selected, setSelected }) => {
  return (
    <section>
        <h2>Biasing options</h2>
        {
          OPTIONS.map(({ value, getLabel }) => (
            <Option
              key={value}
              value={value}
              label={getLabel(dates)}
              selected={selected}
              setSelected={setSelected}
            />
          ))
        }
      </section>
  )
}

export default PreviewOptions