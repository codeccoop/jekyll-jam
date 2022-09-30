import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import Editor from '../../components/Editor';
import Preview from '../../components/Preview';
import AssetViewer from '../../components/AssetViewer';
import YamlForm from '../../components/YamlForm';

import { getBlob, postCommit, getBranch } from '../../services/api';

import { useQueryParams } from '../../store/queryParams';
import { useBranch } from '../../store/branch';

import './style.scss';

function getMode(queryPath) {
  let path;
  try {
    path = atob(queryPath);
  } catch (err) {
    return 'editor';
  }
  if (path.match(/^\_data/)) {
    return 'data';
  } else if (path.match(/^assets/)) {
    return 'asset';
  } else {
    return 'editor';
  }
}

function EditorPage() {
  const defaultContent = '# Loading file contents...';

  const [blob, setBlob] = useState({
    content: null,
    sha: null,
    frontmatter: null,
    path: null,
    encoding: null,
  });

  const [editorConent, setEditorContent] = useState(defaultContent);

  const [queryParams, setQueryParams] = useQueryParams();
  const [branch, setBranch] = useBranch();
  const navigate = useNavigate();

  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    setBlob({ ...blob, content: null });
    setEditorContent(defaultContent);
    if (queryParams.sha) {
      getBlob(queryParams)
        .then(data => {
          setBlob(data);
          if (getMode(queryParams.path) === 'editor') {
            setEditorContent(data.content);
          }
        })
        .catch(err => {
          console.warn('Invalid JSON data');
        });
    }

    return function () {
      getBranch().then(setBranch);
      // TODO: Control redundant branch loads when change file from directory (use the queryParams.path)
      // TODO: Debug what queryParams status is accessible from inside this context
    };
  }, [queryParams.sha]);

  useEffect(() => {
    setHasChanged(editorConent !== blob.content && editorConent !== defaultContent);
  }, [editorConent]);

  function saveBlob({ sha, path }) {
    postCommit({ content: editorConent.replace(/\n/g, '\n'), path, sha }).then(commit => {
      navigate('/edit', { search: `?sha=${commit.sha}&path=${path}` });
    });
  }

  return (
    <>
      <div className={'edit__content ' + getMode(queryParams.path)}>
        {getMode(queryParams.path) === 'editor' ? (
          <Editor
            onUpdate={setEditorContent}
            content={editorConent}
            defaultContent={defaultContent}
          />
        ) : getMode(queryParams.path) === 'data' ? (
          <YamlForm content={editorConent} />
        ) : (
          <AssetViewer content={blob.content} encoding={blob.encoding} path={blob.path} />
        )}
        <Preview text={editorConent} />
      </div>
      <div className='edit__controls'>
        <a
          className={'btn' + (hasChanged ? '' : ' disabled')}
          onClick={() =>
            saveBlob(Object.fromEntries(new URLSearchParams(location.search).entries()))
          }
        >
          Save
        </a>
      </div>
    </>
  );
}

export default EditorPage;
