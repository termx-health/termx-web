import {tokenAttrValue} from './plugin.util';
import {matchSection} from '@kodality-web/marina-markdown-parser';

export function structureDefinitionCodePlugin(md): void {
  md.renderer.rules.structure_definition_code = (tokens, idx, /*options, env, self */) => {
    const [code] = tokenAttrValue(tokens[idx], 'code');
    return `<ce-structure-definition def-code="${encodeURIComponent(code)}"></ce-structure-definition>`;
  };

  md.block.ruler.after('reference', 'structure_definition_code', (state, startl, endl, silent) => {
    const {failed, end, autoClosed, content} = matchSection('{{def:', '}}', state, startl, endl, silent);
    if (failed) {
      return false;
    }

    const token = state.push('structure_definition_code', '', 0);
    token.attrs = [['code', content.match(/{{def:(.*)}}/)[1]]];
    state.line = end.line + (autoClosed ? 1 : 0);
    return true;
  });
}
