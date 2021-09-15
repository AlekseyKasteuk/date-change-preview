import { useState } from "react"
import { CHANGE_TYPES } from "./constants"
import PreviewImage from "./PreviewImage"
import PreviewOptions from "./PreviewOptions"

const Preview = ({ dates }) => {
  const [selected, setSelected] = useState(CHANGE_TYPES.leave)
  return (
    <>
      <PreviewOptions dates={dates} selected={selected} setSelected={setSelected} />
      <PreviewImage dates={dates} option={selected} />
    </>
  )
}

const PreviewWrapper = ({ dates }) => {
  const { planStart, planEnd, contentStart, contentEnd, newPlanStart, newPlanEnd } = dates
  if ([planStart, planEnd, contentStart, contentEnd, newPlanStart, newPlanEnd].some(v => !v)) {
    return null
  }
  return <Preview dates={dates} />
}

export default PreviewWrapper