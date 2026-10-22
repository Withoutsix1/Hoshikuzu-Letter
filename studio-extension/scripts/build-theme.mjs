import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
const source=path.resolve(import.meta.dirname,'../src');
const css=postcss.parse(['styles.css','archive.css','gallery.css','letter.css','settings.css','history.css'].map(name=>fs.readFileSync(path.join(source,name),'utf8')).join('\n'));
css.walkRules(rule=>{
 if(rule.parent.type==='atrule'&&/keyframes$/.test(rule.parent.name))return;
 rule.selectors=rule.selectors.map(selector=>{
  const scoped=selector.replace(/:root\b/g,'.hoshikuzu-ui').replace(/(^|[\s>+~,(])(?:html|body)(?=$|[\s>+~.#:[),])/g,'$1.hoshikuzu-ui');
  return scoped.startsWith('.hoshikuzu-ui')?scoped:'.hoshikuzu-ui '+scoped;
 });
});
fs.writeFileSync(path.join(source,'theme.css'),css.toString());
