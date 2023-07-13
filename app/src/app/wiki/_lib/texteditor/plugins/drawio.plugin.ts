import {matchSection} from '@kodality-web/marina-markdown';

export function drawioPlugin(md) {
  md.renderer.rules.drawio = (tokens, idx, /*options, env, self */) => {
    const data = tokens[idx].attrs.find(a => a[0] === 'data')?.[1];
    return `<img class="drawio" src="data:image/svg+xml;base64, ${data}">`;
  };

  md.block.ruler.before('fence', 'drawio', (state, startl, endl, silent) => {
    const {failed, end, autoClosed, content} = matchSection('```drawio', '```', state, startl, endl, silent);
    if (failed) {
      return false;
    }

    const base64 = content.match(/```drawio\n?(.+)\n?```/)[1];
    console.log(base64)

    const token = state.push('drawio', '', 0);
    token.attrs = [['data', base64]];
    state.line = end.line + (autoClosed ? 1 : 0);
    return true;
  });
}
