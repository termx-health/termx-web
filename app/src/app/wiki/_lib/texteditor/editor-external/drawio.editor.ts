// https://gitlab.com/gitlab-org/gitlab/-/blob/master/app/assets/javascripts/drawio/drawio_editor.js
import {isNil} from '@kodality-web/core-util';

interface EditorFacade {
  getDiagram: () => {markdown?: string, svg: string},
  insertDiagram: (d: {diagramSvg: string}) => void,
  updateDiagram: (d: {diagramMarkdown: string, diagramSvg: string}) => void,
}

interface EditorState {
  drawioUrl: string,

  iframe: any,
  disposeEventListener: any,
  initialized: boolean,
  isBusy: boolean,

  newDiagram: boolean,
  diagramMarkdown: string,
  diagramSvg: string,
}

const _updateState = (drawIOEditorState: EditorState, data: Partial<EditorState>): void => {
  Object.assign(drawIOEditorState, data);
};

const _dispose = (drawIOEditorState: EditorState): void => {
  drawIOEditorState.disposeEventListener();
  drawIOEditorState.iframe.remove();
};

const _postMessage = (drawIOEditorState: EditorState, message): void => {
  const {origin} = new URL(drawIOEditorState.drawioUrl);
  drawIOEditorState.iframe.contentWindow.postMessage(JSON.stringify(message), origin);
};

const _getSvg = (data): string => {
  const svgPath = atob(data.substring(data.indexOf(',') + 1));
  return `<?xml version="1.0" encoding="UTF-8"?>\n\
      <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n\
      ${svgPath}`;
};


/* 'init' event handler */
const prepareEditor = (drawIOEditorState: EditorState, editorFacade: EditorFacade): void => {
  const {iframe} = drawIOEditorState;

  try {
    loadExistingDiagram(drawIOEditorState, editorFacade);
    iframe.style.visibility = 'visible';
    window.scrollTo(0, 0);
    _updateState(drawIOEditorState, {
      initialized: true
    });
  } catch (e) {
    console.error(e);
    _dispose(drawIOEditorState);
  }
};

const loadExistingDiagram = (drawIOEditorState: EditorState, editorFacade: EditorFacade): void => {
  const {markdown, svg} = editorFacade.getDiagram();
  if (svg) {
    _updateState(drawIOEditorState, {
      newDiagram: false,
      diagramMarkdown: markdown,
      diagramSvg: svg,
    });
  } else {
    _updateState(drawIOEditorState, {
      newDiagram: true,
    });
  }

  _postMessage(drawIOEditorState, {
    action: 'load',
    xml: drawIOEditorState.diagramSvg,
    background: '#fff'
  });
};


/* 'export' event handler */
const saveDiagram = (drawIOEditorState: EditorState, editorFacade: EditorFacade): void => {
  const {newDiagram, diagramMarkdown, diagramSvg} = drawIOEditorState;

  try {
    if (newDiagram) {
      editorFacade.insertDiagram({diagramSvg});
    } else {
      editorFacade.updateDiagram({diagramMarkdown, diagramSvg});
    }
    setTimeout(() => _dispose(drawIOEditorState), 10);
  } catch (e) {
    _postMessage(drawIOEditorState, {
      action: 'dialog',
      titleKey: 'error',
      modified: true,
      buttonKey: 'close',
      messageKey: 'errorSavingFile',
    });
  }
};


/* main event handler */

const handleEditorMessage = (drawIOEditorState: EditorState, editorFacade: EditorFacade, evt): void => {
  if (isNil(evt) || evt.source !== drawIOEditorState.iframe.contentWindow) {
    return;
  }

  const msg = JSON.parse(evt.data);
  switch (msg.event) {
    case 'init':
      prepareEditor(drawIOEditorState, editorFacade);
      break;
    case 'save': {
      if (msg.exit) {
        _postMessage(drawIOEditorState, {
          action: 'export',
          format: 'xmlsvg'
        });
      }
      break;
    }
    case 'export':
      _updateState(drawIOEditorState, {diagramSvg: _getSvg(msg.data)});
      saveDiagram(drawIOEditorState, editorFacade);
      break;
    case 'exit':
      _dispose(drawIOEditorState);
      break;
  }
};


/* iframe */

const attachDrawioIFrameMessageListener = (drawIOEditorState: EditorState, editorFacade: EditorFacade): void => {
  const evtHandler = (evt): void => {
    handleEditorMessage(drawIOEditorState, editorFacade, evt);
  };

  window.addEventListener('message', evtHandler);

  _updateState(drawIOEditorState, {
    disposeEventListener: () => window.removeEventListener('message', evtHandler),
  });
};


const createEditorIFrame = (drawIOEditorState: EditorState): void => {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('id', 'DRAWIO_FRAME_ID');
  iframe.setAttribute('src', drawIOEditorState.drawioUrl);
  iframe.setAttribute('class', 'drawio-editor');
  document.body.appendChild(iframe);

  const DRAWIO_IFRAME_TIMEOUT = 6000;
  setTimeout(() => {
    if (drawIOEditorState.initialized === false) {
      console.error('The diagrams.net editor could not be loaded.');
      _dispose(drawIOEditorState);
    }
  }, DRAWIO_IFRAME_TIMEOUT);

  _updateState(drawIOEditorState, {
    iframe,
  });
};


const createDrawioEditorState = ({drawioUrl}): EditorState => ({
  drawioUrl,
  iframe: null,
  disposeEventListener: null,
  initialized: false,
  isBusy: false,

  newDiagram: true,
  diagramMarkdown: null,
  diagramSvg: null,
});


const DRAWIO_URL = 'https://embed.diagrams.net';
const DRAWIO_PARAMS = {
  ui: 'kennedy',
  noSaveBtn: 1,
  saveAndExit: 1,
  keepmodified: 1,
  spin: 1,
  embed: 1,
  libraries: 1,
  configure: 0,
  modified: 'unsavedChanges',
  proto: 'json',
  toSvg: 1,
};

export function launchDrawioEditor({editorFacade, drawioUrl = DRAWIO_URL}: {editorFacade: EditorFacade, drawioUrl?: string}) {
  const url = new URL(drawioUrl);

  for (const [key, value] of Object.entries(DRAWIO_PARAMS)) {
    url.searchParams.set(key, value as any);
  }

  const drawIOEditorState = createDrawioEditorState({drawioUrl: url.href});

  // The execution order of these two functions matter
  attachDrawioIFrameMessageListener(drawIOEditorState, editorFacade);
  createEditorIFrame(drawIOEditorState);
}
