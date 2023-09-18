import {isNil} from '@kodality-web/core-util';
import {Bundle} from 'fhir/model/bundle';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';

interface EditorFacade {
  getBundle: () => Bundle,
  getStructureMap: () => object,
  updateStructureMap: (sm: object) => void,
  renderFml: (sm: any) => Observable<string>
}

interface EditorState {
  editorUrl: string,

  iframe: any,
  disposeEventListener: any,
  initialized: boolean,

  structureMap: object,
}


const _updateState = (editorState: EditorState, data: Partial<EditorState>): void => {
  Object.assign(editorState, data);
};

const _dispose = (editorState: EditorState): void => {
  editorState.disposeEventListener();
  editorState.iframe.remove();
};

const _postMessage = (editorState: EditorState, message): void => {
  const {origin} = new URL(editorState.editorUrl);
  editorState.iframe.contentWindow.postMessage(JSON.stringify(message), origin);
};


/* 'init' event handler */
const prepareEditor = (state: EditorState, editorFacade: EditorFacade): void => {
  const {iframe} = state;

  try {
    loadResources(state, editorFacade);
    iframe.style.visibility = 'visible';
    window.scrollTo(0, 0);
    _updateState(state, {
      initialized: true
    });
  } catch (e) {
    console.error(e);
    _dispose(state);
  }
};

const loadResources = (state: EditorState, editorFacade: EditorFacade): void => {
  const bundle = editorFacade.getBundle();
  const structureMap = editorFacade.getStructureMap();
  _updateState(state, {
    structureMap,
  });

  _postMessage(state, {
    action: 'load',
    bundle,
    structureMap
  });
};


/* 'save' event handler */
const saveStructureMap = (editorState: EditorState, editorFacade: EditorFacade): void => {
  const {structureMap} = editorState;

  try {
    editorFacade.updateStructureMap(structureMap);
    setTimeout(() => _dispose(editorState), 10);
  } catch (e) {
    console.error(e);
  }
};


/* main event handler */
const handleEditorMessage = (editorState: EditorState, editorFacade: EditorFacade, evt): void => {
  if (isNil(evt) || evt.source !== editorState.iframe.contentWindow) {
    return;
  }

  const msg = JSON.parse(evt.data);
  switch (msg.event) {
    case 'init':
      prepareEditor(editorState, editorFacade);
      break;
    case 'save':
      _postMessage(editorState, {
        action: 'export',
        format: 'json+svg'
      });
      break;
    case 'export':
      _updateState(editorState, {structureMap: JSON.parse(msg.data)});
      saveStructureMap(editorState, editorFacade);
      break;
    case 'exit':
      _dispose(editorState);
      break;
    case 'render-fml':
      editorFacade.renderFml(msg.structureMap).subscribe(fml => {
        _postMessage(editorState, {
          action: 'render-fml',
          fml
        });
      });
  }
};


/* iframe */

const attachIFrameMessageListener = (editorState: EditorState, editorFacade: EditorFacade): void => {
  const evtHandler = (evt): void => {
    handleEditorMessage(editorState, editorFacade, evt);
  };

  window.addEventListener('message', evtHandler);

  _updateState(editorState, {
    disposeEventListener: () => window.removeEventListener('message', evtHandler),
  });
};


const createIFrame = (editorState: EditorState): void => {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('id', 'FML_EDITOR_IFRAME_ID');
  iframe.setAttribute('src', editorState.editorUrl);
  iframe.setAttribute('class', 'fml-editor');
  document.body.appendChild(iframe);

  const IFRAME_TIMEOUT = 6000;
  setTimeout(() => {
    if (editorState.initialized === false) {
      console.error('The FML editor could not be loaded.');
      _dispose(editorState);
    }
  }, IFRAME_TIMEOUT);

  _updateState(editorState, {
    iframe
  });
};


const createEditorState = ({editorUrl}): EditorState => ({
  editorUrl,
  iframe: null,
  disposeEventListener: null,
  initialized: false,
  structureMap: null,
});


const FML_EDITOR_URL = environment.fmlEditor.startsWith('/')
  ? location.origin + environment.fmlEditor
  : environment.fmlEditor;

export function launchFMLEditor({editorFacade, editorUrl = FML_EDITOR_URL}: {editorFacade: EditorFacade, editorUrl?: string}): void {
  const url = new URL(editorUrl);
  const state = createEditorState({editorUrl: url.href});

  // The execution order of these two functions matter
  attachIFrameMessageListener(state, editorFacade);
  createIFrame(state);
}

