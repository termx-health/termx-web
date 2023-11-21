import {matchSection} from '@kodality-web/marina-markdown-parser';


export function valueSetConceptMatrixPlugin(md): void {
  md.renderer.rules.value_set_concept_matrix = (tokens, idx, /* options, env, self */) => {
    return `<ce-value-set-concept-matrix ${tokens[idx].attrs.filter(([_, v]) => v).filter(v=> v[1]).map(([k, v]) => `${k}="${encodeURIComponent(v)}"`).join(' ')}></ce-value-set-concept-matrix>`;
  };

  md.block.ruler.before('fence', 'value_set_concept_matrix', (state, startl, endl, silent, ...rest) => {
    const {failed, end, autoClosed, content} = matchSection('{{vsc:', '}}', state, startl, endl, silent);
    if (failed) {
      return false;
    }

    const token = state.push('value_set_concept_matrix', '', 0);
    const match: string = content.match(/{{vsc:(.*)}}/)[1];

    if (match.includes(';')) {
      const [idd, ...options] = match.split(";");
      const [id, version] = idd.split('|');

      token.attrs = [['id', id], ['version', version] ,...options.map(t => t.trim()).map(t => t.split('='))];
    } else {
      const [id, version] = match.split('|');
      token.attrs = [['id', id], ['version', version]];
    }
    state.line = end.line + (autoClosed ? 1 : 0);
    return true;
  });
}
