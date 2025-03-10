import "./App.css"
import GolfSwingAnalyzer from "./components/SimpleGolfSwingAnalyzer"

function App() {
  return (
    <div
      className="App"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #f0fdf4, #dcfce7)",
      }}
    >
      <GolfSwingAnalyzer />
    </div>
  )
}

export default App

