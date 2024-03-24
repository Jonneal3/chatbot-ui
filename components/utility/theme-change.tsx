import { Bold } from "lucide-react"
import React, { useEffect, useState } from "react"
import { themeChange } from "theme-change"

const ThemeChange = () => {
  const [theme, setTheme] = useState("light")

  const handleChange = (event: { target: { value: any } }) => {
    const selectedTheme = event.target.value
    localStorage.setItem("theme", selectedTheme)
    setTheme(selectedTheme)
    themeChange(selectedTheme)
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme)
    themeChange(false)
  }, [])

  return (
    <div
      style={{
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100%"
      }}
    >
      <label
        htmlFor="themeSelect"
        style={{ marginBottom: "5px", fontSize: "14px" }}
      >
        Theme
      </label>
      <select
        id="themeSelect"
        value={theme}
        onChange={handleChange}
        style={{
          padding: "5px",
          fontSize: "16px",
          width: "100px",
          borderRadius: "8px",
          background: "bg-primary"
        }}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  )
}

export { ThemeChange }
