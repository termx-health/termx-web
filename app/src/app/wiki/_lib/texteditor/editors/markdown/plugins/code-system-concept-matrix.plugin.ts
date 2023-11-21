import {matchSection} from '@kodality-web/marina-markdown-parser';


export function codeSystemConceptMatrixPlugin(md): void {
  md.renderer.rules.code_system_concept_matrix = (tokens, idx, /* options, env, self */) => {
    return `<ce-code-system-concept-matrix ${tokens[idx].attrs.filter(([_, v]) => v).map(([k, v]) => `${k}="${encodeURIComponent(v)}"`).join(' ')}></ce-code-system-concept-matrix>`;
  };

  md.block.ruler.before('fence', 'code_system_concept_matrix', (state, startl, endl, silent, ...rest) => {
    const {failed, end, autoClosed, content} = matchSection('{{csc:', '}}', state, startl, endl, silent);
    if (failed) {
      return false;
    }

    const token = state.push('code_system_concept_matrix', '', 0);
    const match: string = content.match(/{{csc:(.*)}}/)[1];

    if (match.includes(';')) {
      const [id, ...options] = match.split(";");
      token.attrs = [['id', id], ...options.map(t => t.trim()).map(t => t.split('='))];
    } else {
      token.attrs = [['id', match]];
    }
    state.line = end.line + (autoClosed ? 1 : 0);
    return true;
  });
}
