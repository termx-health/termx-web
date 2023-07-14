import {matchSection} from '@kodality-web/marina-markdown';
import {tokenAttrValue} from './plugin.util';


export function structureDefinitionFshPlugin(md) {
  md.renderer.rules.structure_definition_fsh = (tokens, idx, /*options, env, self */) => {
    const fsh = tokenAttrValue(tokens[idx], 'fsh');
    return `<ce-structure-definition fsh="${encodeURIComponent(fsh)}"></ce-structure-definition>`;
  };

  md.block.ruler.before('fence', 'structure_definition_fsh', (state, startl, endl, silent) => {
    const {failed, end, autoClosed, content} = matchSection('```fsh', '```', state, startl, endl, silent);
    if (failed) {
      return false;
    }

    const token = state.push('structure_definition_fsh', '', 0);
    token.attrs = [['fsh', content.match(/```fsh(.*?)```/s)[1]]];
    state.line = end.line + (autoClosed ? 1 : 0);
    return true;
  });
}
