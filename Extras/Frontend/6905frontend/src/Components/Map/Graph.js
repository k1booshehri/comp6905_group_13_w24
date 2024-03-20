import React, { useEffect, useState } from "react";
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
  const [routes, setRoutes] = useState([]);
  const [path, setPath] = React.useState([]);
  const [destination, setDestination] = React.useState(null);
  const handleChange = (e) => {
    setDifficulty(e.target.value);
  };

  const [nodes, setNodes] = useState([
    { x: 70, y: 160, text: "A", textx: 170, texty: 180 },
    { x: 180, y: 140, text: "B", textx: 270, texty: 290 },
    { x: 300, y: 290, text: "C", textx: 510, texty: 420 },
    { x: 100, y: 400, text: "D", textx: 255, texty: 617 },
    { x: 290, y: 618, text: "R", textx: 440, texty: 625 },
  ]);

  const [lines, setLines] = useState([]);
  const [pathEdges, setPathEdges] = useState([]);
  useEffect(() => {
    getGraphData();
  }, []);

  useEffect(() => {
    createPath();
  }, [path]);

  useEffect(() => {
    createGraph(routes);
  }, [routes]);

  const onPointSelection = (name) => {
    if (!origin) {
      setOrigin(name);
    } else if (!destination) {
      setDestination(name);
    } else {
      let pathEdgesCopy = [...pathEdges];
      for (let i = 0; i < pathEdgesCopy.length; i++) {
        pathEdgesCopy[i].color = "Black";
      }
      setPathEdges(pathEdgesCopy);
      setDestination(null);
      setOrigin(name);
    }
  };

  const getPathData = async () => {
    if (origin && destination && difficulty)
      axios
        .get("http://localhost:3028/", {
          params: {
            start: origin,
            end: destination,
            level: difficulty,
          },
        })
        .then(
          (res) => {
            setPath(res.data.path);
          },
          (error) => {
            console.log(error);
          }
        );
    else console.log("Somthing went wrong");
  };

  const createGraph = (edges) => {
    let vertices = [...nodes];
    if (edges) {
      let edgesList = [];
      for (let i = 0; i < edges.length; i++) {
        const e = edges[i];
        let originPoint = vertices.filter((n) => {
          return n.text === e.start;
        });
        let destPoint = vertices.filter((n) => {
          return n.text === e.end;
        });
        let edge = {
          origin: e.start,
          dest: e.end,
          origin_x: originPoint[0]?.x,
          origin_y: originPoint[0]?.y,
          dest_x: destPoint[0]?.x,
          dest_y: destPoint[0]?.y,
          w: e.distance,
          color: "black",
          isLift: e.isLift,
          strokeWidth: 3,
        };
        edgesList.push(edge);
      }
      setLines(edgesList);
    }
  };

  const createPath = () => {
    let pathEdges = [];
    if (path.length > 0) {
      let linesCopy = [...lines];
      let pathCopy = [...path];
      for (let i = 0; i < linesCopy.length; i++) {
        const line = linesCopy[i];
        for (let j = 0; j < pathCopy.length; j++) {
          if (
            pathCopy[j].start === line.origin &&
            pathCopy[j].end === line.dest
          ) {
            linesCopy[i].color = "red";
            pathEdges.push(linesCopy[i]);
          }
        }
      }
      setPathEdges(pathEdges);
    }
  };

  const getGraphData = async () => {
    axios.get("http://localhost:3028/all-routes").then(
      (response) => {
        setRoutes(response.data.routes);
      },
      (error) => {
        console.log(error);
      }
    );
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
                onClick={getPathData}
              >
                Submit
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Stage width={534 + 50} height={618 + 50}>
        <Layer>
          {nodes.map((node) => {
            return (
              <div>
                <Text
                  x={node.x + 20}
                  y={node.y + 10}
                  text={node.text}
                  fontSize={15}
                />
                <Image
                  onClick={() => onPointSelection(node.text)}
                  image={
                    origin && node.text === origin
                      ? locationIconRed
                      : destination && node.text === destination
                      ? locationIconBlue
                      : locationIcon
                  }
                  x={node.x - 15}
                  y={node.y - 27}
                  width={30}
                  height={30}
                />
              </div>
            );
          })}
          {lines.map((line) => {
            return (
              <Line
                points={[
                  line.origin_x,
                  line.origin_y,
                  line.dest_x,
                  line.dest_y,
                ]}
                stroke={line.color}
                shadowForStrokeEnabled={true}
                shadowColor="red"
                strokeWidth={line.strokeWidth}
                // shadowOffset={100}
                // shadowOffsetX={2}
                // shadowOffsetY={10}
              />
            );
          })}
          {pathEdges?.map((edge) => {
            return (
              <Line
                points={[
                  edge.origin_x,
                  edge.origin_y,
                  edge.dest_x,
                  edge.dest_y,
                ]}
                stroke={edge.color}
                shadowForStrokeEnabled={true}
                shadowColor="red"
                strokeWidth={edge.strokeWidth}
                // shadowOffset={100}
                // shadowOffsetX={2}
                // shadowOffsetY={10}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default Graph;
