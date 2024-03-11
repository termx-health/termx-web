import {matchSection} from '@kodality-web/marina-markdown-parser';
import {tokenAttrValue} from './plugin.util';


export function structureDefinitionFshPlugin(md): void {
  md.renderer.rules.structure_definition_fsh = (tokens, idx, /* options, env, self */) => {
    const [fsh] = tokenAttrValue(tokens[idx], 'fsh');
    return `<ce-structure-definition content="${encodeURIComponent(fsh)}"></ce-structure-definition>`;
  };

  md.block.ruler.before('fence', 'structure_definition_fsh', (state, startl, endl, silent) => {
    const {failed, end, autoClosed, content} = matchSection('```fsh', '```', state, startl, endl, silent);
    if (failed) {
      return false;
    }

    const token = state.push('structure_definition_fsh', '', 0);
    const fsh = content.match(/```fsh(.*?)```/s)[1] as string;
    token.attrs = [['fsh', fsh.replace(/^\n/, '')]];
    state.line = end.line + (autoClosed ? 1 : 0);
    return true;
  });
}
