import {matchSection} from '@kodality-web/marina-markdown';

export function structureDefinitionCodePlugin(md) {
  md.renderer.rules.structure_definition_code = (tokens, idx, /*options, env, self */) => {
    const code = tokens[idx].attrs.find(a => a[0] === 'code')?.[1];
    return `<ce-structure-definition def-code="${encodeURIComponent(code)}"></ce-structure-definition>`;
  };

  md.block.ruler.after('reference', 'structure_definition_code', (state, startl, endl, silent) => {
    const {failed, endLine, autoClosed, content} = matchSection('{{def:', '}}', state, startl, endl, silent);
    if (failed) {
      return false;
    }

    const token = state.push('structure_definition_code', '', 0);
    token.attrs = [['code', content.match(/{{def:(.*)}}/)[1]]];
    state.line = endLine + (autoClosed ? 1 : 0);
    return true;
  });
}
