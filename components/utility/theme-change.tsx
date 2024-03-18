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
          background: "bg-base-100"
        }}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="cupcake">Cupcake</option>
        <option value="bumblebee">Bumblebee</option>
        <option value="emerald">Emerald</option>
        <option value="corporate">Corporate</option>
        <option value="synthwave">Synthwave</option>
        <option value="retro">Retro</option>
        <option value="cyberpunk">Cyberpunk</option>
        <option value="valentine">Valentine</option>
        <option value="halloween">Halloween</option>
        <option value="garden">Garden</option>
        <option value="forest">Forest</option>
        <option value="aqua">Aqua</option>
        <option value="lofi">Lofi</option>
        <option value="pastel">Pastel</option>
        <option value="fantasy">Fantasy</option>
        <option value="wireframe">Wireframe</option>
        <option value="black">Black</option>
        <option value="luxury">Luxury</option>
        <option value="dracula">Dracula</option>
        <option value="cmyk">CMYK</option>
        <option value="autumn">Autumn</option>
        <option value="business">Business</option>
        <option value="acid">Acid</option>
        <option value="lemonade">Lemonade</option>
        <option value="night">Night</option>
        <option value="coffee">Coffee</option>
        <option value="winter">Winter</option>
        <option value="dim">Dim</option>
        <option value="nord">Nord</option>
        <option value="sunset">Sunset</option>
      </select>
    </div>
  )
}

export { ThemeChange }
