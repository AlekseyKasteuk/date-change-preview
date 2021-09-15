import { useState } from 'react';
import './App.css';
import Dates from './apps/Dates';
import Preview from './apps/Preview';

const App = () => {
  const [dates, setDates] = useState({})
  return (
    <div className="App">
      <Dates dates={dates} setDates={setDates} />
      <Preview dates={dates} />
    </div>
  );
}

export default App;
