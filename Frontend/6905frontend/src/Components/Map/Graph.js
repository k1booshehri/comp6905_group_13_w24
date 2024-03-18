import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Stage, Layer, Rect, Text, Circle, Line, Image } from "react-konva";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import location from "../../Icons/map.png";
import locationBlue from "../../Icons/mapBlue.png";
import locationRed from "../../Icons/mapRed.png";
import useImage from "use-image";
import axios from "axios";

const Graph = () => {
  const [locationIcon] = useImage(location);
  const [locationIconBlue] = useImage(locationBlue);
  const [locationIconRed] = useImage(locationRed);
  const [difficulty, setDifficulty] = React.useState("Black");
  const [origin, setOrigin] = React.useState(null);
  const [path, setPath] = React.useState([]);
  const [destination, setDestination] = React.useState(null);
  const handleChange = (e) => {
    setDifficulty(e.target.value);
  };

  const [rects, setRects] = useState([
    { x: 70, y: 160, text: "r1", textx: 170, texty: 180 },
    { x: 180, y: 140, text: "r2", textx: 270, texty: 290 },
    { x: 300, y: 290, text: "r3", textx: 510, texty: 420 },
    { x: 100, y: 400, text: "r4", textx: 255, texty: 617 },
    { x: 290, y: 618, text: "r5", textx: 440, texty: 625 },
    { x: 534, y: 542, text: "r6", textx: 538, texty: 548 },
  ]);

  const [lines, setLine] = useState([
    {
      startName: "r1",
      startx: 70,
      starty: 160,
      endName: "r2",
      endx: 180,
      endy: 140,
      weight: 10,
      fill: "white",
    },
    {
      startName: "r1",
      startx: 70,
      starty: 160,
      endName: "r4",
      endx: 100,
      endy: 400,
      weight: 5,
      fill: "white",
    },
    {
      startName: "r2",
      startx: 180,
      starty: 140,
      endName: "r3",
      endx: 300,
      endy: 290,
      weight: 10,
      fill: "white",
    },
    {
      startName: "r3",
      startx: 300,
      starty: 290,
      endName: "r5",
      endx: 290,
      endy: 618,
      weight: 1,
      fill: "white",
    },
    {
      startName: "r4",
      startx: 100,
      starty: 400,
      endName: "r2",
      endx: 180,
      endy: 140,
      weight: 5,
      fill: "white",
    },
    {
      startName: "r4",
      startx: 100,
      starty: 400,
      endName: "r5",
      endx: 290,
      endy: 618,
      weight: 3,
      fill: "white",
    },
    {
      startName: "r5",
      startx: 290,
      starty: 618,
      endName: "r6",
      endx: 534,
      endy: 542,
      weight: 4,
      fill: "white",
    },
  ]);

  const onPointSelection = (name) => {
    if (!origin) {
      setOrigin(name);
    } else if (!destination) {
      setDestination(name);
    } else {
      setDestination(null);
      setOrigin(name);
    }
  };

  const getData = async () => {
    if (origin && destination && difficulty)
      axios
        .get("http://localhost:3000/", {
          params: {
            start: "A",
            end: "B",
            level: "Blue",
          },
        })
        .then(
          (response) => {
            // setPath(response)
            console.log(response);
          },
          (error) => {
            console.log(error);
          }
        );
    else console.log("Somthing went wrong");
  };
  return (
    <div>
      <Box sx={{}}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={6} lg={4}>
            <Box sx={{ m: 2 }}>
              <FormControl variant="standard" sx={{ width: "100%" }}>
                <InputLabel>Difficulty Preference</InputLabel>
                <Select
                  value={difficulty}
                  onChange={(e) => handleChange(e)}
                  label="Difficulty Preference"
                >
                  <MenuItem value={"Black"}>Black</MenuItem>
                  <MenuItem value={"blue"}>Blue</MenuItem>
                  <MenuItem value={"Red"}>Red</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
          <Grid item xs={4} sm={4} md={2} lg={2}>
            <Box sx={{ m: 2 }}>
              <Button
                sx={{ width: "100%" }}
                variant="contained"
                size="large"
                color="success"
                onClick={getData}
              >
                contained
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Stage width={534 + 50} height={618 + 50}>
        <Layer>
          {rects.map((rect) => {
            return (
              <div>
                <Text
                  x={rect.x + 20}
                  y={rect.y + 10}
                  text={rect.text}
                  fontSize={15}
                />
                <Image
                  onClick={() => onPointSelection(rect.text)}
                  image={
                    origin && rect.text === origin
                      ? locationIconRed
                      : destination && rect.text === destination
                      ? locationIconBlue
                      : locationIcon
                  }
                  x={rect.x - 15}
                  y={rect.y - 27}
                  width={30}
                  height={30}
                />
              </div>
            );
          })}
          {lines.map((line) => {
            return (
              <Line
                points={[line.startx, line.starty, line.endx, line.endy]}
                stroke="black"
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default Graph;
