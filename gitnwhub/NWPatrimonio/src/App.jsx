import React, {useState, useEffect} from 'react'
import Header from './components/Header'
import Patrimonio from './pages/Patrimonio'
import './App.css'

export default function App(){
  return (
    <div className="app-root" style={{flexDirection: 'column'}}>
      <Header />
      <main className="main-area" style={{flex: 1, overflow: 'auto', padding: '20px'}}>
        <Patrimonio />
      </main>
    </div>
  )
}


