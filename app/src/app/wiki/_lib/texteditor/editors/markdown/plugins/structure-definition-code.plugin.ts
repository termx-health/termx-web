import {matchSection} from '@kodality-web/marina-markdown-parser';

export function structureDefinitionCodePlugin(md): void {
  md.renderer.rules.structure_definition_code = (tokens, idx, /* options, env, self */) => {
    return `<ce-structure-definition ${tokens[idx].attrs.map(([k, v]) => `${k}="${encodeURIComponent(v)}"`).join(' ')}></ce-structure-definition>`;
  };

  md.block.ruler.after('reference', 'structure_definition_code', (state, startl, endl, silent) => {
    const {failed, end, autoClosed, content} = matchSection('{{def:', '}}', state, startl, endl, silent);
    if (failed) {
      return false;
    }

    const token = state.push('structure_definition_code', '', 0);
    const match = content.match(/{{def:(.*)}}/)[1];
    if (match.includes(';')) {
      const [code, ...options] = match.split(";");
      token.attrs = [['def-code', code], ...options.map(t => t.trim()).map(t => t.split('='))];
    } else {
      token.attrs = [['def-code', match]];
    }
      state.line = end.line + (autoClosed ? 1 : 0);
    return true;
  });
}
