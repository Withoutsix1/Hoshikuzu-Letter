export type BackgroundVariant = "observatory" | "milky-way";
export type Appearance = {
  background: BackgroundVariant;
  title: "image" | "text";
};

export const backgrounds = {
  observatory: {
    label: "天文台星空",
    src: "./assets/observatory-sky.png",
    alt: "天文台栏杆前的群山夜景，淡淡银河与星点铺满深蓝天空，山谷灯火在远处延伸。",
    description: "夜风掠过栏杆，山谷的灯火在宁静星空下闪烁。",
  },
  "milky-way": {
    label: "星河天台",
    src: "./assets/title-starfield.png",
    alt: "天台与观测圆顶前，银河横跨夜空，群山和湖畔灯火在远处延伸。",
    description: "夜风掠过栏杆，远方的灯火与星河一同闪烁。",
  },
} satisfies Record<
  BackgroundVariant,
  { label: string; src: string; alt: string; description: string }
>;

export const titleWordmark = "./assets/title-gold-transparent.png";
export const defaultAppearance: Appearance = {
  background: "observatory",
  title: "text",
};

export function isAppearance(value: unknown): value is Appearance {
  if (!value || typeof value !== "object") return false;
  const appearance = value as Appearance;
  return (
    (appearance.background === "observatory" ||
      appearance.background === "milky-way") &&
    (appearance.title === "image" || appearance.title === "text")
  );
}
