import { Fragment, useCallback } from 'react';
import './Dates.css';

const Date = ({ name, value, setDate, min, max }) => {
  const onChange = useCallback((event) => setDate(name, event.currentTarget.value), [name, setDate])
  return (<input type='date' onChange={onChange} value={value} min={min} max={max} style={{ width: 150 }} />)
}

const DateSection = ({ label, prefix, min, max, dates, setDate }) => {
  const name = `${prefix}${label}`
  return (
    <div>
      <label>{label} Date: </label>
      <Date
        name={name}
        value={dates[name]}
        setDate={setDate}
        min={min && min(dates)}
        max={max && max(dates)}
      />
    </div>
  )
}

const configs = [
  {
    title: 'Plan',
    startMax: dates => dates.planEnd,
    endMin: dates => dates.planStart,
  },
  {
    title: 'Content',
    startMin: dates => dates.planStart,
    startMax: dates => dates.contentEnd || dates.planEnd,
    endMin: dates => dates.contentStart || dates.planStart,
    endMax: dates => dates.planEnd,
  },
  {
    title: 'New Plan',
    startMax: dates => dates.newPlanEnd,
    endMin: dates => dates.newPlanStart,
  },
]

const Dates = ({ dates, setDates }) => {
  const setDate = useCallback((name, value) => setDates({ ...dates, [name]: value }), [setDates, dates])
  return (
    <div className="Dates">
      <h2>Dates</h2>
      {
        configs.map(({ title, startMin, startMax, endMin, endMax }) => {
          const prefix = title[0].toLowerCase() + title.slice(1).split(' ').join('')
          return (
            <Fragment key={title}>
              <h3>{title} Dates</h3>
              <DateSection label="Start" prefix={prefix} min={startMin} max={startMax} dates={dates} setDate={setDate} />
              <DateSection label="End" prefix={prefix} min={endMin} max={endMax} dates={dates} setDate={setDate} />
            </Fragment>
          )
        })
      }
    </div>
  );
}

export default Dates;
