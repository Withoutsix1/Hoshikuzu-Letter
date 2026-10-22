import { useExtensionContext } from '@avg-studio/sdk';
import { defaultAppearance, type Appearance } from './visualAssets';

// 项目外观由作者在扩展设置中选择；玩家存档不会覆盖项目预设。
export function useAppearance(): Appearance {
  const ctx = useExtensionContext();
  const [background] = ctx.settings.useValue<string>('title.backgroundPreset');
  const [title] = ctx.settings.useValue<string>('title.titlePreset');
  return {
    background: background === 'milky-way' ? background : defaultAppearance.background,
    title: title === 'image' ? title : defaultAppearance.title,
  };
}
