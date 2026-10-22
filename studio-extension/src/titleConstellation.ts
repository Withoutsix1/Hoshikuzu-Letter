import type { StoryPhase } from "./model";

// Stars and path endpoints use one coordinate source, in stage percentages.
export const menuNodes = [
  { number: "01", label: "START", subtitle: "开始阅读", x: 47.8, y: 16.6 },
  { number: "02", label: "LOAD", subtitle: "展开记忆", x: 64.7, y: 26.2 },
  { number: "03", label: "CONFIG", subtitle: "阅读设置", x: 73.3, y: 42.7 },
  { number: "04", label: "GALLERY", subtitle: "星光画廊", x: 81.2, y: 56.3 },
];
export const storyStars = [
  {
    starId: "center-yellow",
    x: 58.5,
    y: 57.8,
    color: "#ffe299",
    white: false,
    layer: 0,
    delay: -0.6,
  },
  {
    starId: "lower-pink",
    x: 22,
    y: 73.5,
    color: "#ffd5e9",
    white: false,
    layer: 0,
    delay: -2.2,
  },
  {
    starId: "upper-blue",
    x: 65,
    y: 10,
    color: "#8dbdff",
    white: true,
    layer: 1,
    delay: -1.3,
  },
  {
    starId: "upper-red",
    x: 79,
    y: 15,
    color: "#ff8a96",
    white: true,
    layer: 1,
    delay: -2.8,
  },
  {
    starId: "upper-yellow",
    x: 92,
    y: 26,
    color: "#ffe299",
    white: true,
    layer: 1,
    delay: -0.1,
  },
  {
    starId: "final-pink-left",
    x: 87,
    y: 10.8,
    color: "#ffd5e9",
    white: true,
    layer: 2,
    delay: -1.8,
  },
  {
    starId: "final-pink-right",
    x: 95,
    y: 17,
    color: "#ffd5e9",
    white: true,
    layer: 2,
    delay: -0.9,
  },
];
function point(anchor: { x: number; y: number }) {
  return `${Number((anchor.x * 10).toFixed(3))} ${Number((anchor.y * 6).toFixed(3))}`;
}
const root = point(menuNodes[0]);
export const menuThreads = [
  { path: `M${root} C522 135 605 146 ${point(menuNodes[1])}`, dot: [570, 142] },
  {
    path: `M${point(menuNodes[1])} C698 190 723 218 ${point(menuNodes[2])}`,
    dot: [702, 208],
  },
  {
    path: `M${point(menuNodes[2])} C770 280 792 305 ${point(menuNodes[3])}`,
    dot: [774, 290],
  },
];
const [, pink, blue, red, yellow, finalLeft, finalRight] =
  storyStars.map(point);
export type StoryThread = {
  id: string;
  to: string;
  path: string;
  layer: StoryPhase;
  duration: number;
  after?: string;
};
export const storyThreads: StoryThread[] = [
  {
    id: "start-pink",
    to: "lower-pink",
    layer: 0,
    duration: 2.8,
    path: `M${root} C407 124 438 194 361 252 C284 310 300 409 ${pink}`,
  },
  {
    id: "start-blue",
    to: "upper-blue",
    layer: 1,
    duration: 1.4,
    path: `M${root} C487 33 592 5 ${blue}`,
  },
  {
    id: "blue-red",
    to: "upper-red",
    layer: 1,
    duration: 1.4,
    after: "start-blue",
    path: `M${blue} C685 103 742 113 ${red}`,
  },
  {
    id: "red-yellow",
    to: "upper-yellow",
    layer: 1,
    duration: 1.4,
    after: "blue-red",
    path: `M${red} C845 63 899 104 ${yellow}`,
  },
  {
    id: "yellow-final-left",
    to: "final-pink-left",
    layer: 2,
    duration: 1.4,
    after: "red-yellow",
    path: `M${yellow} C930 112 902 84 ${finalLeft}`,
  },
  {
    id: "yellow-final-right",
    to: "final-pink-right",
    layer: 2,
    duration: 1.4,
    after: "red-yellow",
    path: `M${yellow} C923 134 945 123 ${finalRight}`,
  },
];
