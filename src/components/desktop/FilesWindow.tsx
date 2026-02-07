import { useState, useEffect, useCallback } from 'react';
import { useWSRequest } from '../../stores/wsStore.js';

interface MediaFile {
  id: string;
  filename: string;
  file_url: string;
  file_type: string;
  category: string;
  description?: string;
  created_at: number;
  owner_type: string;
  npc_id?: string;
}

interface NPCFolder {
  npc: {
    id: string;
    display_name: string;
    avatar_url: string;
  };
  files: MediaFile[];
}

interface FilesystemData {
  myFiles: MediaFile[];
  npcs: NPCFolder[];
}

export function FilesWindow() {
  const { request, connected } = useWSRequest();
  const [currentPath, setCurrentPath] = useState<string[]>(['My Files']);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filesystem, setFilesystem] = useState<FilesystemData>({ myFiles: [], npcs: [] });
  const [searchResults, setSearchResults] = useState<MediaFile[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFilesystem = useCallback(() => {
    if (!connected) return;
    setLoading(true);
    request<void, FilesystemData>('media:filesystem')
      .then(data => { setFilesystem(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [connected, request]);

  useEffect(() => {
    fetchFilesystem();
  }, [fetchFilesystem]);

  // Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(() => {
      request<any, { files: MediaFile[] }>('media:getAll', {
        filters: { search: searchQuery },
      }).then(data => setSearchResults(data.files)).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, request]);

  const handleNavigate = (path: string) => {
    if (path === '..') {
      setCurrentPath(prev => prev.slice(0, -1));
    } else {
      setCurrentPath(prev => [...prev, path]);
    }
    setSelectedFile(null);
  };

  const handleDelete = useCallback((fileId: string) => {
    request('media:delete', { id: fileId })
      .then(() => {
        setSelectedFile(null);
        fetchFilesystem();
      })
      .catch(() => {});
  }, [request, fetchFilesystem]);

  const currentFolder = currentPath[currentPath.length - 1];
  const isRootLevel = currentPath.length === 1;
  const isNPCFolder = currentPath.length >= 2 && currentPath[1] === 'NPCs';
  const selectedNPCName = isNPCFolder && currentPath.length === 3 ? currentPath[2] : null;
  const selectedNPCFolder = selectedNPCName
    ? filesystem.npcs.find(n => n.npc.display_name === selectedNPCName)
    : null;

  // Determine which files to display
  const displayFiles = searchResults
    ?? (currentFolder === 'My Uploads' ? filesystem.myFiles : []);
  const npcFiles = selectedNPCFolder?.files ?? [];

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        {/* Navigation */}
        <div className="flex items-center gap-2 flex-1">
          {!isRootLevel && (
            <button
              onClick={() => handleNavigate('..')}
              className="px-3 py-1 rounded transition-colors"
              style={{ background: 'var(--color-bgTertiary)', color: 'var(--color-text)' }}
            >
              ← Back
            </button>
          )}
          <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-textSecondary)' }}>
            {currentPath.map((segment, i) => (
              <div key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                <span style={{ color: i === currentPath.length - 1 ? 'var(--color-text)' : 'var(--color-textMuted)' }}>
                  {segment}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1 rounded text-sm w-64"
          style={{
            background: 'var(--color-bgSecondary)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        />

        {/* View Mode Toggle */}
        <div className="flex gap-1 rounded" style={{ background: 'var(--color-bgTertiary)', padding: '2px' }}>
          <button
            onClick={() => setViewMode('grid')}
            className="px-3 py-1 rounded text-sm"
            style={{
              background: viewMode === 'grid' ? 'var(--color-primary)' : 'transparent',
              color: 'var(--color-text)',
            }}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="px-3 py-1 rounded text-sm"
            style={{
              background: viewMode === 'list' ? 'var(--color-primary)' : 'transparent',
              color: 'var(--color-text)',
            }}
          >
            List
          </button>
        </div>

        {/* Refresh */}
        <button
          onClick={fetchFilesystem}
          className="px-3 py-1 rounded text-sm transition-colors"
          style={{ background: 'var(--color-bgTertiary)', color: 'var(--color-text)' }}
        >
          Refresh
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* File List/Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full" style={{ color: 'var(--color-textMuted)' }}>
              Loading files...
            </div>
          ) : searchResults ? (
            // Search results view
            <div>
              <div className="text-xs mb-3" style={{ color: 'var(--color-textMuted)' }}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
              </div>
              <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-3' : 'space-y-1'}>
                {searchResults.map((file) => (
                  <FileItem
                    key={file.id}
                    file={file}
                    isSelected={selectedFile?.id === file.id}
                    onClick={() => setSelectedFile(file)}
                    viewMode={viewMode}
                  />
                ))}
                {searchResults.length === 0 && (
                  <div className="col-span-4 text-center py-12" style={{ color: 'var(--color-textMuted)' }}>
                    No files match your search.
                  </div>
                )}
              </div>
            </div>
          ) : currentFolder === 'My Files' ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-3' : 'space-y-1'}>
              <FolderItem
                name="My Uploads"
                icon="📁"
                count={filesystem.myFiles.length}
                onClick={() => handleNavigate('My Uploads')}
                viewMode={viewMode}
              />
              <FolderItem
                name="NPCs"
                icon="👥"
                count={filesystem.npcs.length}
                onClick={() => handleNavigate('NPCs')}
                viewMode={viewMode}
              />
            </div>
          ) : currentFolder === 'NPCs' && !selectedNPCName ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-3' : 'space-y-1'}>
              {filesystem.npcs.map((npcFolder) => (
                <NPCFolderItem
                  key={npcFolder.npc.id}
                  npc={npcFolder.npc}
                  fileCount={npcFolder.files.length}
                  onClick={() => handleNavigate(npcFolder.npc.display_name)}
                  viewMode={viewMode}
                />
              ))}
              {filesystem.npcs.length === 0 && (
                <div className="col-span-4 text-center py-12" style={{ color: 'var(--color-textMuted)' }}>
                  No NPCs yet. Create some NPCs to see their files here!
                </div>
              )}
            </div>
          ) : selectedNPCName ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-3' : 'space-y-1'}>
              {npcFiles.map((file) => (
                <FileItem
                  key={file.id}
                  file={file}
                  isSelected={selectedFile?.id === file.id}
                  onClick={() => setSelectedFile(file)}
                  viewMode={viewMode}
                />
              ))}
              {npcFiles.length === 0 && (
                <div className="col-span-4 text-center py-12" style={{ color: 'var(--color-textMuted)' }}>
                  No files for this NPC yet.
                </div>
              )}
            </div>
          ) : currentFolder === 'My Uploads' ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-3' : 'space-y-1'}>
              {displayFiles.map((file) => (
                <FileItem
                  key={file.id}
                  file={file}
                  isSelected={selectedFile?.id === file.id}
                  onClick={() => setSelectedFile(file)}
                  viewMode={viewMode}
                />
              ))}
              {displayFiles.length === 0 && (
                <div className="col-span-4 text-center py-12" style={{ color: 'var(--color-textMuted)' }}>
                  No files yet. Save something from CobPaint!
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Preview Panel */}
        {selectedFile && (
          <div
            className="w-80 p-4 overflow-y-auto"
            style={{ borderLeft: '1px solid var(--color-border)' }}
          >
            <div className="space-y-4">
              {/* Preview */}
              <div
                className="w-full aspect-square rounded flex items-center justify-center overflow-hidden"
                style={{ background: 'var(--color-bgSecondary)' }}
              >
                {selectedFile.file_type.match(/jpg|jpeg|png|gif|webp/) ? (
                  <img src={selectedFile.file_url} alt={selectedFile.filename} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-4xl">📄</div>
                )}
              </div>

              {/* File Info */}
              <div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  {selectedFile.filename}
                </h3>
                <div className="space-y-1 text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                  <div>Type: {selectedFile.file_type.toUpperCase()}</div>
                  <div>Category: {selectedFile.category}</div>
                  <div>Uploaded: {new Date(selectedFile.created_at * 1000).toLocaleDateString()}</div>
                </div>
              </div>

              {selectedFile.description && (
                <div>
                  <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Description
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                    {selectedFile.description}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => handleDelete(selectedFile.id)}
                  className="w-full px-3 py-2 rounded text-sm transition-colors"
                  style={{ background: 'var(--color-error)', color: 'var(--color-text)' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Folder Item Component
function FolderItem({
  name,
  icon,
  count,
  onClick,
  viewMode,
}: {
  name: string;
  icon: string;
  count: number;
  onClick: () => void;
  viewMode: 'grid' | 'list';
}) {
  if (viewMode === 'list') {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-2 rounded transition-colors text-left"
        style={{ background: 'var(--color-bgSecondary)', color: 'var(--color-text)' }}
      >
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="font-medium">{name}</div>
          <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            {count} items
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="p-4 rounded flex flex-col items-center gap-2 transition-colors"
      style={{ background: 'var(--color-bgSecondary)', color: 'var(--color-text)' }}
    >
      <span className="text-4xl">{icon}</span>
      <div className="text-sm font-medium text-center">{name}</div>
      <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
        {count} items
      </div>
    </button>
  );
}

// NPC Folder Item Component
function NPCFolderItem({
  npc,
  fileCount,
  onClick,
  viewMode,
}: {
  npc: { id: string; display_name: string; avatar_url: string };
  fileCount: number;
  onClick: () => void;
  viewMode: 'grid' | 'list';
}) {
  if (viewMode === 'list') {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-2 rounded transition-colors text-left"
        style={{ background: 'var(--color-bgSecondary)', color: 'var(--color-text)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
          style={{ background: 'var(--color-bgTertiary)' }}
        >
          {npc.avatar_url ? <img src={npc.avatar_url} alt={npc.display_name} className="w-full h-full rounded-full object-cover" /> : '👤'}
        </div>
        <div className="flex-1">
          <div className="font-medium">{npc.display_name}</div>
          <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            {fileCount} files
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="p-4 rounded flex flex-col items-center gap-2 transition-colors"
      style={{ background: 'var(--color-bgSecondary)', color: 'var(--color-text)' }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
        style={{ background: 'var(--color-bgTertiary)' }}
      >
        {npc.avatar_url ? <img src={npc.avatar_url} alt={npc.display_name} className="w-full h-full rounded-full object-cover" /> : '👤'}
      </div>
      <div className="text-sm font-medium text-center">{npc.display_name}</div>
      <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
        {fileCount} files
      </div>
    </button>
  );
}

// File Item Component
function FileItem({
  file,
  isSelected,
  onClick,
  viewMode,
}: {
  file: MediaFile;
  isSelected: boolean;
  onClick: () => void;
  viewMode: 'grid' | 'list';
}) {
  const isImage = file.file_type.match(/jpg|jpeg|png|gif|webp/);

  if (viewMode === 'list') {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-2 rounded transition-colors text-left"
        style={{
          background: isSelected ? 'var(--color-bgTertiary)' : 'var(--color-bgSecondary)',
          border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
          color: 'var(--color-text)',
        }}
      >
        <div
          className="w-10 h-10 rounded flex items-center justify-center overflow-hidden"
          style={{ background: 'var(--color-bg)' }}
        >
          {isImage ? (
            <img src={file.file_url} alt={file.filename} className="w-full h-full object-cover" />
          ) : (
            <span>📄</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{file.filename}</div>
          <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
            {file.file_type.toUpperCase()}
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="rounded overflow-hidden transition-colors"
      style={{
        background: 'var(--color-bgSecondary)',
        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
      }}
    >
      <div
        className="w-full aspect-square flex items-center justify-center overflow-hidden"
        style={{ background: 'var(--color-bg)' }}
      >
        {isImage ? (
          <img src={file.file_url} alt={file.filename} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">📄</span>
        )}
      </div>
      <div className="p-2">
        <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
          {file.filename}
        </div>
        <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
          {file.file_type.toUpperCase()}
        </div>
      </div>
    </button>
  );
}
