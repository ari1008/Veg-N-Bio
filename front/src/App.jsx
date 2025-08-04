
import './App.css'

import { useState } from 'react'
import viteLogo from '/vite.svg'
import reactLogo from './assets/react.svg'

function App() {
    const [count, setCount] = useState(0)

    return (
        <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center text-center p-8">
            <div className="flex gap-8 mb-6">
                <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
                    <img src={viteLogo} className="w-16 hover:scale-110 transition" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
                    <img src={reactLogo} className="w-16 hover:scale-110 transition" alt="React logo" />
                </a>
            </div>

            <h1 className="text-4xl font-bold mb-4">Vite + React + DaisyUI</h1>

            <div className="card shadow-xl bg-base-100 p-6 mb-6">
                <button
                    className="btn btn-primary mb-4"
                    onClick={() => setCount(count + 1)}
                >
                    Count is {count}
                </button>
                <p>
                    Edit <code className="text-accent">src/App.jsx</code> and save to test HMR
                </p>
            </div>

            <p className="text-sm opacity-60">
                Click on the logos above to learn more
            </p>
        </div>
    )
}

export default App

