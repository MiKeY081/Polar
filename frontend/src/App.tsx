import React from 'react'
import { Route, Routes } from 'react-router'
import Home from './Home'
import Analyzer from './Analyzer'

type Props = {}

const App = (props: Props) => {
  return (
    <div>
      <Routes >
        <Route path="/" element={<Home />} />
        <Route path="/analyzer" element={<Analyzer/>} />
      </Routes>
    </div>
  )
}
export default App